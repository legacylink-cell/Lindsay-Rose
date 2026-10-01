"""Backend tests for Bright Blessing nomination feature and site-settings."""
import os
import time
import glob
import pytest
import requests
from pathlib import Path

FRONTEND_ENV = Path(__file__).resolve().parents[2] / "frontend" / ".env"
BASE_URL = None
for line in FRONTEND_ENV.read_text().splitlines():
    if line.startswith("REACT_APP_BACKEND_URL="):
        BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
assert BASE_URL

API = f"{BASE_URL}/api"
ADMIN_USER = "brightadmin"
ADMIN_PASS = "Dallas2025!!"


@pytest.fixture(scope="module")
def s():
    return requests.Session()


@pytest.fixture(scope="module")
def admin_token(s):
    r = s.post(f"{API}/admin/login", json={"username": ADMIN_USER, "password": ADMIN_PASS}, timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="module")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# ---------------- Site settings (public + admin auth) ----------------
def test_site_settings_public_shape(s):
    r = s.get(f"{API}/site-settings", timeout=10)
    assert r.status_code == 200
    data = r.json()
    assert "nominations_live" in data
    assert isinstance(data["nominations_live"], bool)
    assert "nominations" in data
    nom = data["nominations"]
    for k in ("is_open", "cycle", "month_label", "closes_label", "next_open_label"):
        assert k in nom, f"missing key {k}"
    assert isinstance(nom["is_open"], bool)


def test_patch_site_settings_requires_auth(s):
    r = s.patch(f"{API}/admin/site-settings", json={"nominations_live": True}, timeout=10)
    assert r.status_code in (401, 403)


def test_patch_site_settings_bad_token(s):
    r = s.patch(
        f"{API}/admin/site-settings",
        json={"nominations_live": True},
        headers={"Authorization": "Bearer bogus"},
        timeout=10,
    )
    assert r.status_code == 401


# ---------------- Nomination validation ----------------
def test_nomination_rejects_missing_understands(s):
    payload = {
        "nominator_name": "QA Nominator",
        "nominator_phone": "555-123-4567",
        "nominator_email": "qa+nom-noconsent@example.com",
        "nominator_city": "Dallas",
        "nominee_name": "QA Nominee",
        "nominee_city": "Plano",
        "nominee_phone": "",
        "why": "QA Nomination Test (should 400 - no consent)",
        "relationship": "Neighbor",
        "permission_to_contact": True,
        "understands_selected": False,
        "wants_discount": False,
    }
    r = s.post(f"{API}/nominations", json=payload, timeout=15)
    assert r.status_code == 400


def test_nomination_honeypot_returns_success_without_store(s, auth_headers):
    before = s.get(f"{API}/admin/nominations", headers=auth_headers, timeout=15).json()
    before_ids = {i["id"] for i in before}
    payload = {
        "nominator_name": "QA Honeypot Bot",
        "nominator_phone": "555-000-0000",
        "nominator_email": "bot@example.com",
        "nominee_name": "Victim",
        "why": "spam",
        "understands_selected": True,
        "company": "SPAMMER INC",  # honeypot tripped
    }
    r = s.post(f"{API}/nominations", json=payload, timeout=15)
    assert r.status_code == 200
    body = r.json()
    assert body.get("success") is True
    assert "id" not in body
    # Should NOT appear in admin listing
    after = s.get(f"{API}/admin/nominations", headers=auth_headers, timeout=15).json()
    assert len(after) == len(before)
    for item in after:
        assert item["id"] in before_ids or item["nominator_name"] != "QA Honeypot Bot"


# ---------------- Nomination happy path + delivery.email.status ----------------
@pytest.fixture(scope="module")
def created_nomination(s, auth_headers):
    payload = {
        "nominator_name": "QA Nomination Test",
        "nominator_phone": "214-555-0101",
        "nominator_email": "qa+nom@example.com",
        "nominator_city": "Dallas",
        "nominee_name": "QA Nominee Family",
        "nominee_city": "Richardson",
        "nominee_phone": "214-555-0102",
        "why": "QA Nomination Test - automated test, please ignore. This family has been through a hard season.",
        "relationship": "Neighbor",
        "permission_to_contact": True,
        "understands_selected": True,
        "wants_discount": False,
    }
    r = s.post(f"{API}/nominations", json=payload, timeout=15)
    assert r.status_code == 200, r.text
    nid = r.json()["id"]
    assert nid
    yield nid
    # Cleanup
    s.delete(f"{API}/admin/nominations/{nid}", headers=auth_headers, timeout=10)


def test_nomination_appears_in_admin_list(s, auth_headers, created_nomination):
    r = s.get(f"{API}/admin/nominations", headers=auth_headers, timeout=15)
    assert r.status_code == 200
    items = r.json()
    match = next((i for i in items if i["id"] == created_nomination), None)
    assert match is not None
    assert match["nominator_name"] == "QA Nomination Test"
    assert match["nominee_name"] == "QA Nominee Family"
    assert match.get("status") == "new"
    assert "_id" not in match


def test_nomination_delivery_email_sent(s, auth_headers, created_nomination):
    # Give background dispatch time to run
    for _ in range(20):
        r = s.get(f"{API}/admin/nominations", headers=auth_headers, timeout=15)
        match = next((i for i in r.json() if i["id"] == created_nomination), None)
        if match and match.get("delivery", {}).get("email", {}).get("status") == "sent":
            break
        time.sleep(1)
    assert match is not None
    delivery = match.get("delivery", {})
    email = delivery.get("email", {})
    assert email.get("status") == "sent", f"delivery.email.status != sent: {delivery}"
    assert email.get("attempts", 0) >= 1


def test_nomination_no_client_confirmation_in_logs(created_nomination):
    """Verify no 'Client confirmation sent' is emitted for the nomination."""
    time.sleep(2)
    logs = ""
    for path in glob.glob("/var/log/supervisor/backend.*.log"):
        try:
            with open(path) as f:
                logs += f.read()
        except Exception:
            pass
    # Must see support notification for a nomination
    assert "Bright Blessing" in logs or "nomination" in logs.lower()
    # Must NOT see client confirmation for a nomination id
    nid = created_nomination
    # Check lines mentioning this nomination id - none should be "Client confirmation"
    for line in logs.splitlines():
        if nid in line:
            assert "Client confirmation" not in line, f"Unexpected client confirmation for nomination: {line}"


# ---------------- Nomination status workflow ----------------
@pytest.mark.parametrize("status", ["reviewing", "selected", "not_selected", "new"])
def test_nomination_status_transitions_persist(s, auth_headers, created_nomination, status):
    r = s.patch(
        f"{API}/admin/nominations/{created_nomination}/status",
        json={"status": status},
        headers=auth_headers,
        timeout=10,
    )
    assert r.status_code == 200, r.text
    assert r.json().get("status") == status
    # verify persistence via GET
    r2 = s.get(f"{API}/admin/nominations", headers=auth_headers, timeout=15)
    match = next(i for i in r2.json() if i["id"] == created_nomination)
    assert match.get("status") == status


def test_nomination_invalid_status_rejected(s, auth_headers, created_nomination):
    r = s.patch(
        f"{API}/admin/nominations/{created_nomination}/status",
        json={"status": "booked"},
        headers=auth_headers,
        timeout=10,
    )
    assert r.status_code == 400


def test_nomination_admin_endpoints_require_auth(s, created_nomination):
    r = s.get(f"{API}/admin/nominations", timeout=10)
    assert r.status_code in (401, 403)
    r = s.patch(f"{API}/admin/nominations/{created_nomination}/status", json={"status": "new"}, timeout=10)
    assert r.status_code in (401, 403)
    r = s.delete(f"{API}/admin/nominations/{created_nomination}", timeout=10)
    assert r.status_code in (401, 403)


# ---------------- Publish toggle via API ----------------
def test_publish_toggle_round_trip(s, auth_headers):
    # Record initial state
    initial = s.get(f"{API}/site-settings", timeout=10).json()["nominations_live"]
    try:
        # Flip to True
        r = s.patch(
            f"{API}/admin/site-settings",
            json={"nominations_live": True},
            headers=auth_headers,
            timeout=10,
        )
        assert r.status_code == 200
        assert r.json()["nominations_live"] is True
        assert s.get(f"{API}/site-settings", timeout=10).json()["nominations_live"] is True

        # Flip back to False
        r = s.patch(
            f"{API}/admin/site-settings",
            json={"nominations_live": False},
            headers=auth_headers,
            timeout=10,
        )
        assert r.status_code == 200
        assert r.json()["nominations_live"] is False
        assert s.get(f"{API}/site-settings", timeout=10).json()["nominations_live"] is False
    finally:
        # Restore initial state - review request requires OFF at end
        s.patch(
            f"{API}/admin/site-settings",
            json={"nominations_live": False},
            headers=auth_headers,
            timeout=10,
        )
