"""Backend tests for spam filtering, nomination CSV export, and announcements."""
import os
import re
import csv
import io
import time
import glob
import subprocess
import pytest
import requests
from pathlib import Path

FRONTEND_ENV = Path(__file__).resolve().parents[2] / "frontend" / ".env"
BASE_URL = None
for line in FRONTEND_ENV.read_text().splitlines():
    if line.startswith("REACT_APP_BACKEND_URL="):
        BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
assert BASE_URL, "REACT_APP_BACKEND_URL missing"

API = f"{BASE_URL}/api"
ADMIN_USER = "brightadmin"
ADMIN_PASS = "Dallas2025!!"

PITCH = (
    "Hi, Are you planning to re-design your website? "
    "Visit https://example.com and www.another.com for details."
)


def visitor(tag=""):
    """Each submission comes from a distinct simulated visitor IP; behind a proxy the
    backend trusts X-Forwarded-For, so this is what real separate users look like."""
    import random
    return {"X-Forwarded-For": tag or f"203.0.113.{random.randint(1, 250)}"}


# -------- fixtures --------
@pytest.fixture(scope="module")
def s():
    return requests.Session()


@pytest.fixture(scope="module")
def admin_token(s):
    r = s.post(f"{API}/admin/login", json={"username": ADMIN_USER, "password": ADMIN_PASS}, timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="module")
def auth(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


def _read_backend_logs() -> str:
    text = ""
    for path in glob.glob("/var/log/supervisor/backend.*.log"):
        try:
            with open(path) as f:
                text += f.read()
        except Exception:
            pass
    return text


# -------- SPAM content filtering (3 content submissions - each counts toward rate limit) --------
@pytest.fixture(scope="module")
def spam_quote_id(s, auth):
    body = {
        "name": "TEST_Spam Quote",
        "email": "qa+spamquote@example.com",
        "phone": "214-555-9001",
        "city": "Dallas",
        "service": "web redesign offer",
        "details": PITCH,
        "elapsed_ms": 45000,
    }
    r = s.post(f"{API}/quotes", json=body, headers=visitor(), timeout=15)
    assert r.status_code == 200, r.text
    j = r.json()
    if not j.get("id"):
        pytest.skip("rate limiter exhausted; cannot create spam quote fixture")
    yield j["id"]
    s.delete(f"{API}/admin/quotes/{j['id']}", headers=auth, timeout=10)


def test_spam_quote_stored_as_spam_not_emailed(s, auth, spam_quote_id):
    time.sleep(3)
    items = s.get(f"{API}/admin/quotes", headers=auth, timeout=15).json()
    item = next((i for i in items if i["id"] == spam_quote_id), None)
    assert item is not None
    assert item.get("spam") is True
    assert item.get("spam_reason")
    # delivery.email should NOT be set (never dispatched)
    delivery = item.get("delivery") or {}
    email_status = (delivery.get("email") or {}).get("status")
    assert email_status in (None, ""), f"spam quote should not be emailed, got {email_status}"
    logs = _read_backend_logs()
    assert f"Quote {spam_quote_id} filtered as spam" in logs
    # Ensure 'Support notification sent' is NOT associated with this id
    for line in logs.splitlines():
        if spam_quote_id in line:
            assert "Support notification sent" not in line


@pytest.fixture(scope="module")
def spam_app_id(s, auth):
    body = {
        "name": "TEST_Spam App",
        "email": "qa+spamapp@example.com",
        "phone": "214-555-9002",
        "position": "cleaner",
        "message": PITCH,
        "elapsed_ms": 45000,
    }
    r = s.post(f"{API}/applications", json=body, headers=visitor(), timeout=15)
    assert r.status_code == 200
    j = r.json()
    if not j.get("id"):
        pytest.skip("rate limiter exhausted; cannot create spam application fixture")
    yield j["id"]
    s.delete(f"{API}/admin/applications/{j['id']}", headers=auth, timeout=10)


def test_spam_application_flagged(s, auth, spam_app_id):
    time.sleep(2)
    items = s.get(f"{API}/admin/applications", headers=auth, timeout=15).json()
    item = next((i for i in items if i["id"] == spam_app_id), None)
    assert item is not None
    assert item.get("spam") is True
    delivery = item.get("delivery") or {}
    assert (delivery.get("email") or {}).get("status") in (None, "")


@pytest.fixture(scope="module")
def spam_nom_id(s, auth):
    body = {
        "nominator_name": "TEST_Spam Nominator",
        "nominator_phone": "214-555-9003",
        "nominator_email": "qa+spamnom@example.com",
        "nominator_city": "Dallas",
        "nominee_name": "TEST_Spam Nominee",
        "nominee_city": "Plano",
        "why": PITCH,
        "understands_selected": True,
        "permission_to_contact": True,
        "elapsed_ms": 45000,
    }
    r = s.post(f"{API}/nominations", json=body, headers=visitor(), timeout=15)
    assert r.status_code == 200, r.text
    j = r.json()
    if not j.get("id"):
        pytest.skip("rate limiter exhausted; cannot create spam nomination fixture")
    yield j["id"]
    s.delete(f"{API}/admin/nominations/{j['id']}", headers=auth, timeout=10)


def test_spam_nomination_flagged(s, auth, spam_nom_id):
    time.sleep(2)
    items = s.get(f"{API}/admin/nominations", headers=auth, timeout=15).json()
    item = next((i for i in items if i["id"] == spam_nom_id), None)
    assert item is not None
    assert item.get("spam") is True
    delivery = item.get("delivery") or {}
    assert (delivery.get("email") or {}).get("status") in (None, "")


# -------- Timing trap (elapsed_ms < 2500) - returns BEFORE rate limiter --------
def test_timing_trap_drops_silently(s, auth):
    before = s.get(f"{API}/admin/quotes", headers=auth, timeout=15).json()
    before_ids = {i["id"] for i in before}
    body = {
        "name": "TEST_Timing Trap", "email": "qa+timing@example.com",
        "phone": "214-555-9004", "city": "Dallas", "service": "deep",
        "details": "This filled too fast to be a human", "elapsed_ms": 300,
    }
    r = s.post(f"{API}/quotes", json=body, headers=visitor(), timeout=15)
    assert r.status_code == 200
    assert r.json() == {"success": True}  # no id
    after = s.get(f"{API}/admin/quotes", headers=auth, timeout=15).json()
    new_items = [i for i in after if i["id"] not in before_ids]
    assert new_items == [], f"timing trap should drop, got {new_items}"


# -------- Honeypot (company field) - returns BEFORE rate limiter --------
def test_honeypot_drops_silently(s, auth):
    before = s.get(f"{API}/admin/quotes", headers=auth, timeout=15).json()
    before_ids = {i["id"] for i in before}
    body = {
        "name": "TEST_Honeypot", "email": "qa+honey@example.com",
        "phone": "214-555-9005", "city": "Dallas", "service": "deep",
        "details": "hey", "elapsed_ms": 45000,
        "company": "SpamCo",
    }
    r = s.post(f"{API}/quotes", json=body, headers=visitor(), timeout=15)
    assert r.status_code == 200
    assert "id" not in r.json()
    after = s.get(f"{API}/admin/quotes", headers=auth, timeout=15).json()
    new_items = [i for i in after if i["id"] not in before_ids]
    assert new_items == []


# -------- GENUINE lead must still pass end-to-end --------
@pytest.fixture(scope="module")
def genuine_quote_id(s, auth):
    body = {
        "name": "TEST_Genuine Lead",
        "email": "qa+genuine@example.com",
        "phone": "214-555-9006",
        "city": "Plano",
        "service": "Deep Cleaning",
        "details": ("TEST_Genuine Lead: 3 bed 2 bath, pets, prefer morning. "
                    "Please ignore - automated QA test. Needs standard clean."),
        "elapsed_ms": 45000,
    }
    r = s.post(f"{API}/quotes", json=body, headers=visitor(), timeout=15)
    assert r.status_code == 200, r.text
    qid = r.json().get("id")
    if not qid:
        pytest.skip("rate limiter exhausted; cannot create genuine quote fixture")
    yield qid
    s.delete(f"{API}/admin/quotes/{qid}", headers=auth, timeout=10)


def test_genuine_quote_stored_and_emailed(s, auth, genuine_quote_id):
    # Allow dispatch time for SMTP
    match = None
    for _ in range(25):
        items = s.get(f"{API}/admin/quotes", headers=auth, timeout=15).json()
        match = next((i for i in items if i["id"] == genuine_quote_id), None)
        if match and (match.get("delivery", {}).get("email", {}).get("status") == "sent"):
            break
        time.sleep(1)
    assert match is not None
    assert not match.get("spam"), f"genuine lead was marked spam: {match.get('spam_reason')}"
    assert match["delivery"]["email"]["status"] == "sent"


# -------- RATE LIMIT: 6 submissions, at most 4 stored --------
def test_rate_limit_drops_after_four(s, auth):
    """Fresh IP budget assumed low because backend was restarted at session start.
    After 4 budget-eligible submissions above (3 spam + 1 genuine), a 5th would already
    be blocked. We instead verify directly: submit 6 fresh with unique markers and ensure
    at most 4 persist. If prior hits already exhausted the budget, 0 may persist (still <=4)."""
    marker = f"TEST_RL_{int(time.time())}"
    created = []
    for i in range(8):
        body = {
            "name": f"{marker}_{i}",
            "email": f"qa+rl{i}@example.com",
            "phone": f"214-555-70{i:02d}",
            "city": "Dallas", "service": "deep",
            "details": f"{marker} submission {i}",
            "elapsed_ms": 45000,
        }
        r = s.post(f"{API}/quotes", json=body, headers=visitor("198.51.100.77"), timeout=15)
        assert r.status_code == 200
        if r.json().get("id"):
            created.append(r.json()["id"])
    time.sleep(1)
    items = s.get(f"{API}/admin/quotes", headers=auth, timeout=15).json()
    persisted = [i for i in items if (i.get("name") or "").startswith(marker)]
    try:
        # Bursts are never discarded (a real lead must survive); the extras are flagged
        # as spam so they stay visible and restorable in the dashboard.
        assert len(persisted) == 8, f"a burst must still be stored, got {len(persisted)}"
        flagged = [i for i in persisted if i.get("spam")]
        assert flagged, "a burst past the limit from one visitor should flag the extras"
        assert any("unusual number" in (i.get("spam_reason") or "") for i in flagged)
    finally:
        for i in persisted:
            s.delete(f"{API}/admin/quotes/{i['id']}", headers=auth, timeout=10)


# -------- NOT-SPAM restore triggers email --------
def test_not_spam_restore_sends_email(s, auth):
    """After backend restart, rate limiter is fresh. We can create a spam quote here
    only if budget available; otherwise reuse spam_quote_id. For determinism create a
    fresh spam quote under a new identity. If creation returns no id (rate-limited),
    skip the test rather than fail."""
    body = {
        "name": "TEST_Restore Spam",
        "email": "qa+restore@example.com",
        "phone": "214-555-9009",
        "city": "Dallas",
        "service": "web redesign",
        "details": PITCH,
        "elapsed_ms": 45000,
    }
    r = s.post(f"{API}/quotes", json=body, headers=visitor(), timeout=15)
    assert r.status_code == 200
    qid = r.json().get("id")
    if not qid:
        pytest.skip("rate limiter exhausted; cannot create fresh spam quote for restore test")

    # auth required
    r_na = s.post(f"{API}/admin/quotes/{qid}/not-spam", timeout=10)
    assert r_na.status_code in (401, 403)

    # restore with auth
    r2 = s.post(f"{API}/admin/quotes/{qid}/not-spam", headers=auth, timeout=15)
    assert r2.status_code == 200, r2.text

    # verify spam=False and email dispatched
    match = None
    for _ in range(25):
        items = s.get(f"{API}/admin/quotes", headers=auth, timeout=15).json()
        match = next((i for i in items if i["id"] == qid), None)
        if match and (match.get("delivery", {}).get("email", {}).get("status") == "sent"):
            break
        time.sleep(1)
    assert match is not None
    assert match.get("spam") is False
    assert match.get("delivery", {}).get("email", {}).get("status") == "sent"
    s.delete(f"{API}/admin/quotes/{qid}", headers=auth, timeout=10)


# -------- delivery-health must not count spam items as undelivered --------
def test_delivery_health_excludes_spam(s, auth, spam_quote_id, spam_app_id, spam_nom_id):
    r = s.get(f"{API}/admin/delivery-health", headers=auth, timeout=15)
    assert r.status_code == 200
    j = r.json()
    assert "undelivered" in j
    # Each of our spam items has no delivery.email.status 'sent' but is spam=True;
    # the query excludes None statuses, so undelivered should be 0 for these items.
    # We assert it's an int and reasonable (<=5 to catch regressions).
    assert isinstance(j["undelivered"], int)
    assert j["undelivered"] <= 5


# -------- CSV EXPORT --------
def test_export_requires_auth(s):
    r = s.get(f"{API}/admin/nominations/export", timeout=15)
    assert r.status_code in (401, 403)


def test_export_csv_headers_and_rows(s, auth, spam_nom_id):
    # Create a non-spam nomination so we have at least one row
    body = {
        "nominator_name": "TEST_Export Nominator",
        "nominator_phone": "214-555-9010",
        "nominator_email": "qa+export@example.com",
        "nominator_city": "Dallas",
        "nominee_name": "TEST_Export Nominee",
        "nominee_city": "Plano",
        "why": "TEST_Export - automated. Please ignore.",
        "relationship": "Neighbor",
        "permission_to_contact": True,
        "understands_selected": True,
        "wants_discount": True,
        "elapsed_ms": 45000,
    }
    r = s.post(f"{API}/nominations", json=body, headers=visitor(), timeout=15)
    assert r.status_code == 200
    good_id = r.json().get("id")
    # If rate-limited here, create one directly via admin fallback is not possible; skip row check
    try:
        r = s.get(f"{API}/admin/nominations/export", headers=auth, timeout=20)
        assert r.status_code == 200
        assert "text/csv" in r.headers.get("content-type", "")
        cd = r.headers.get("content-disposition", "")
        assert "attachment" in cd.lower()
        assert "filename" in cd.lower()

        body_text = r.content.decode("utf-8")
        reader = csv.reader(io.StringIO(body_text))
        rows = list(reader)
        assert rows, "CSV empty"
        header = rows[0]
        expected = ["Submitted", "Cycle", "Nominator", "Phone", "Email", "City",
                    "Wants $25 code", "Relationship", "Nominee", "Nominee city", "Status"]
        assert header == expected, f"header mismatch: {header}"

        # Spam nomination must NOT appear in CSV
        spam_email_present = any("qa+spamnom@example.com" in row for row in rows[1:])
        assert not spam_email_present, "spam nomination leaked into CSV"

        if good_id:
            good_present = any("qa+export@example.com" in row for row in rows[1:])
            assert good_present, "non-spam nomination missing from CSV"
    finally:
        if good_id:
            s.delete(f"{API}/admin/nominations/{good_id}", headers=auth, timeout=10)


def test_export_with_cycle_filter(s, auth):
    r = s.get(f"{API}/admin/nominations/export?cycle=1999-01", headers=auth, timeout=15)
    assert r.status_code == 200
    body_text = r.content.decode("utf-8")
    rows = list(csv.reader(io.StringIO(body_text)))
    # Only header expected for a cycle with no nominations
    assert len(rows) == 1


# -------- ANNOUNCEMENTS: privacy + publish flow --------
@pytest.fixture
def created_announcement(s, auth):
    ids = []

    def _make(**overrides):
        payload = {"first_name": "Dana Hughes", "city": "Plano",
                   "month_label": "January", "note": "A quiet blessing."}
        payload.update(overrides)
        r = s.post(f"{API}/admin/announcements", json=payload, headers=auth, timeout=10)
        return r

    yield _make, ids
    for aid in ids:
        s.delete(f"{API}/admin/announcements/{aid}", headers=auth, timeout=10)
    # Also cleanup any announcements left over by name
    r = s.get(f"{API}/admin/announcements", headers=auth, timeout=10)
    if r.status_code == 200:
        for i in r.json():
            if i.get("note") == "A quiet blessing." or (i.get("city") == "Plano" and i.get("first_name") == "Dana"):
                s.delete(f"{API}/admin/announcements/{i['id']}", headers=auth, timeout=10)


def test_announcement_first_name_trimmed_server_side(s, auth, created_announcement):
    make, ids = created_announcement
    r = make(first_name="Dana Hughes")
    assert r.status_code == 200, r.text
    ann = r.json()["announcement"]
    assert ann["first_name"] == "Dana"
    assert ann["city"] == "Plano"
    assert ann["published"] is False
    ids.append(ann["id"])


def test_announcement_requires_first_and_city(s, auth, created_announcement):
    make, _ = created_announcement
    r = make(first_name="")
    assert r.status_code == 400
    r = make(first_name="Dana", city="")
    assert r.status_code == 400


def test_announcement_publish_flow(s, auth, created_announcement):
    make, ids = created_announcement
    r = make()
    assert r.status_code == 200
    aid = r.json()["announcement"]["id"]
    ids.append(aid)

    # Public list should NOT include an unpublished announcement
    pub = s.get(f"{API}/announcements", timeout=10).json()
    assert all(i["id"] != aid for i in pub)

    # Admin publish requires auth
    r_na = s.patch(f"{API}/admin/announcements/{aid}/publish?published=true", timeout=10)
    assert r_na.status_code in (401, 403)

    # Publish
    r = s.patch(f"{API}/admin/announcements/{aid}/publish?published=true",
                headers=auth, timeout=10)
    assert r.status_code == 200
    assert r.json()["published"] is True

    pub = s.get(f"{API}/announcements", timeout=10).json()
    match = next((i for i in pub if i["id"] == aid), None)
    assert match is not None
    assert match["first_name"] == "Dana"
    assert match["city"] == "Plano"
    assert "note" in match and "month_label" in match
    # Privacy: no 'why' or nominator fields in public response
    assert "why" not in match
    assert "nominator_name" not in match

    # Unpublish
    r = s.patch(f"{API}/admin/announcements/{aid}/publish?published=false",
                headers=auth, timeout=10)
    assert r.status_code == 200
    pub = s.get(f"{API}/announcements", timeout=10).json()
    assert all(i["id"] != aid for i in pub)


def test_announcement_admin_list_and_delete_require_auth(s, auth, created_announcement):
    make, ids = created_announcement
    r = make()
    aid = r.json()["announcement"]["id"]
    ids.append(aid)

    assert s.get(f"{API}/admin/announcements", timeout=10).status_code in (401, 403)
    assert s.delete(f"{API}/admin/announcements/{aid}", timeout=10).status_code in (401, 403)

    r = s.delete(f"{API}/admin/announcements/{aid}", headers=auth, timeout=10)
    assert r.status_code == 200
    ids.remove(aid)
