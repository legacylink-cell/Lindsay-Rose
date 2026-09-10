"""Backend tests for status transitions and reminders endpoints."""
import os
import time
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
ADMIN_PASS = "Brighth4Dyvnjh"


@pytest.fixture(scope="module")
def s():
    return requests.Session()


@pytest.fixture(scope="module")
def token(s):
    r = s.post(f"{API}/admin/login", json={"username": ADMIN_USER, "password": ADMIN_PASS}, timeout=15)
    assert r.status_code == 200
    return r.json()["token"]


@pytest.fixture(scope="module")
def auth(token):
    return {"Authorization": f"Bearer {token}"}


# ---- Auth protection on status endpoints ----
def test_status_endpoints_require_auth(s):
    r = s.patch(f"{API}/admin/quotes/xyz/status", json={"status": "contacted"})
    assert r.status_code in (401, 403)
    r = s.patch(f"{API}/admin/applications/xyz/status", json={"status": "contacted"})
    assert r.status_code in (401, 403)


def test_status_endpoints_bad_token(s):
    h = {"Authorization": "Bearer garbage"}
    r = s.patch(f"{API}/admin/quotes/xyz/status", json={"status": "contacted"}, headers=h)
    assert r.status_code == 401


# ---- Quote status transitions ----
def _make_quote(s, name="TEST_status"):
    r = s.post(f"{API}/quotes", json={
        "name": name, "email": "qa+status@example.com", "phone": "555-000-3333",
        "city": "Frisco", "service": "Deep cleaning", "details": "status test",
    }, timeout=15)
    assert r.status_code == 200
    return r.json()["id"]


def test_quote_status_transitions_and_persist(s, auth):
    qid = _make_quote(s, "TEST_status_quote")
    # new -> contacted
    r = s.patch(f"{API}/admin/quotes/{qid}/status", json={"status": "contacted"}, headers=auth)
    assert r.status_code == 200
    assert r.json()["status"] == "contacted"
    # verify persisted
    items = s.get(f"{API}/admin/quotes", headers=auth).json()
    m = next(i for i in items if i["id"] == qid)
    assert m["status"] == "contacted"
    assert "reminded_at" in m  # stamped so it won't re-remind

    # contacted -> booked
    r = s.patch(f"{API}/admin/quotes/{qid}/status", json={"status": "booked"}, headers=auth)
    assert r.status_code == 200
    # booked -> new
    r = s.patch(f"{API}/admin/quotes/{qid}/status", json={"status": "new"}, headers=auth)
    assert r.status_code == 200
    items = s.get(f"{API}/admin/quotes", headers=auth).json()
    m = next(i for i in items if i["id"] == qid)
    assert m["status"] == "new"

    # cleanup
    s.delete(f"{API}/admin/quotes/{qid}", headers=auth)


def test_quote_status_invalid(s, auth):
    qid = _make_quote(s, "TEST_bad_status")
    r = s.patch(f"{API}/admin/quotes/{qid}/status", json={"status": "junk"}, headers=auth)
    assert r.status_code == 400
    s.delete(f"{API}/admin/quotes/{qid}", headers=auth)


def test_quote_status_404(s, auth):
    r = s.patch(f"{API}/admin/quotes/doesnotexist/status", json={"status": "contacted"}, headers=auth)
    assert r.status_code == 404


# ---- Application status transitions ----
def test_application_status_transitions(s, auth):
    r = s.post(f"{API}/applications", json={
        "name": "TEST_status_app", "email": "qa+appstatus@example.com",
        "phone": "555-000-4444", "position": "Cleaner",
    }, timeout=15)
    aid = r.json()["id"]

    r = s.patch(f"{API}/admin/applications/{aid}/status", json={"status": "contacted"}, headers=auth)
    assert r.status_code == 200
    # booked is invalid for applications
    r = s.patch(f"{API}/admin/applications/{aid}/status", json={"status": "booked"}, headers=auth)
    assert r.status_code == 400
    # back to new
    r = s.patch(f"{API}/admin/applications/{aid}/status", json={"status": "new"}, headers=auth)
    assert r.status_code == 200

    s.delete(f"{API}/admin/applications/{aid}", headers=auth)


# ---- Reminders endpoint ----
def test_reminders_requires_auth(s):
    r = s.post(f"{API}/admin/reminders/run")
    assert r.status_code in (401, 403)


def test_reminders_idempotent(s, auth):
    """Run reminders; the second immediate call should return 0 (all stamped)."""
    r1 = s.post(f"{API}/admin/reminders/run", headers=auth, timeout=30)
    assert r1.status_code == 200
    first = r1.json().get("leads_reminded")
    assert isinstance(first, int)
    r2 = s.post(f"{API}/admin/reminders/run", headers=auth, timeout=15)
    assert r2.status_code == 200
    assert r2.json().get("leads_reminded") == 0


def test_marking_contacted_stamps_reminded_at(s, auth):
    """A quote marked contacted should never appear in a reminder digest afterward."""
    qid = _make_quote(s, "TEST_no_remind")
    s.patch(f"{API}/admin/quotes/{qid}/status", json={"status": "contacted"}, headers=auth)
    items = s.get(f"{API}/admin/quotes", headers=auth).json()
    m = next(i for i in items if i["id"] == qid)
    assert "reminded_at" in m and m["reminded_at"]
    s.delete(f"{API}/admin/quotes/{qid}", headers=auth)


# ---- SMTP send log check ----
def test_smtp_send_logged(s):
    s.post(f"{API}/quotes", json={
        "name": "TEST_SMTP_Log", "email": "qa+smtp@example.com",
        "phone": "555-000-9999", "city": "Plano", "service": "One-time",
        "details": "smtp log check",
    }, timeout=15)
    time.sleep(8)
    import glob
    logs = ""
    for path in glob.glob("/var/log/supervisor/backend.*.log"):
        try:
            logs += open(path).read()
        except Exception:
            pass
    # Either support notification or client confirmation should have logged.
    assert ("Support notification sent" in logs) or ("Client confirmation sent" in logs), \
        "No SMTP success log line found"
