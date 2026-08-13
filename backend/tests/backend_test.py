"""Backend API tests for Bright at Home Cleaning."""
import os
import time
import pytest
import requests
from pathlib import Path

# Load frontend .env to get REACT_APP_BACKEND_URL
FRONTEND_ENV = Path(__file__).resolve().parents[2] / "frontend" / ".env"
BASE_URL = None
for line in FRONTEND_ENV.read_text().splitlines():
    if line.startswith("REACT_APP_BACKEND_URL="):
        BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
assert BASE_URL, "REACT_APP_BACKEND_URL missing"

API = f"{BASE_URL}/api"

ADMIN_USER = "brightadmin"
ADMIN_PASS = "Brighth4Dyvnjh"


@pytest.fixture(scope="session")
def s():
    return requests.Session()


@pytest.fixture(scope="session")
def admin_token(s):
    r = s.post(f"{API}/admin/login", json={"username": ADMIN_USER, "password": ADMIN_PASS}, timeout=15)
    assert r.status_code == 200, r.text
    tok = r.json().get("token")
    assert tok
    return tok


# ---------------- Health ----------------
def test_root(s):
    r = s.get(f"{API}/", timeout=10)
    assert r.status_code == 200
    assert "Bright" in r.json().get("message", "")


# ---------------- Admin login ----------------
def test_admin_login_bad(s):
    r = s.post(f"{API}/admin/login", json={"username": "x", "password": "y"}, timeout=10)
    assert r.status_code == 401


def test_admin_login_good(admin_token):
    assert isinstance(admin_token, str) and len(admin_token) > 20


# ---------------- Quote create + persistence ----------------
def test_create_quote_and_persist(s, admin_token):
    payload = {
        "name": "QA Test Quote",
        "email": "qa+quote@example.com",
        "phone": "555-000-1111",
        "city": "Dallas",
        "service": "Deep cleaning",
        "details": "Automated QA test submission",
    }
    r = s.post(f"{API}/quotes", json=payload, timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data.get("success") is True
    qid = data.get("id")
    assert qid

    # verify via admin listing
    r2 = s.get(f"{API}/admin/quotes", headers={"Authorization": f"Bearer {admin_token}"}, timeout=15)
    assert r2.status_code == 200
    items = r2.json()
    assert any(i["id"] == qid for i in items)
    match = next(i for i in items if i["id"] == qid)
    assert match["name"] == payload["name"]
    assert "_id" not in match  # ObjectId excluded


def test_quote_honeypot(s):
    r = s.post(f"{API}/quotes", json={
        "name": "Bot", "email": "bot@x.com", "phone": "1",
        "company": "spam",
    }, timeout=10)
    assert r.status_code == 200
    assert "id" not in r.json()


# ---------------- Application create + persistence ----------------
def test_create_application_and_persist(s, admin_token):
    payload = {
        "name": "QA Test Applicant",
        "email": "qa+apply@example.com",
        "phone": "555-000-2222",
        "position": "Team Lead & Trainer",
        "message": "Automated QA test application",
    }
    r = s.post(f"{API}/applications", json=payload, timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data.get("success") is True
    aid = data.get("id")
    assert aid

    r2 = s.get(f"{API}/admin/applications", headers={"Authorization": f"Bearer {admin_token}"}, timeout=15)
    assert r2.status_code == 200
    assert any(i["id"] == aid for i in r2.json())


# ---------------- Admin auth protection ----------------
def test_admin_list_requires_auth(s):
    r = s.get(f"{API}/admin/quotes", timeout=10)
    assert r.status_code in (401, 403)
    r = s.get(f"{API}/admin/applications", timeout=10)
    assert r.status_code in (401, 403)


def test_admin_delete_requires_auth(s):
    r = s.delete(f"{API}/admin/quotes/nonexistent-id", timeout=10)
    assert r.status_code in (401, 403), f"got {r.status_code}"
    r = s.delete(f"{API}/admin/applications/nonexistent-id", timeout=10)
    assert r.status_code in (401, 403)


def test_admin_delete_with_bad_token(s):
    r = s.delete(f"{API}/admin/quotes/x", headers={"Authorization": "Bearer garbage"}, timeout=10)
    assert r.status_code == 401


# ---------------- Admin summary + delete flow ----------------
def test_delete_quote_flow(s, admin_token):
    # create
    r = s.post(f"{API}/quotes", json={
        "name": "QA Delete Me", "email": "qa+del@example.com", "phone": "555-0000",
    }, timeout=15)
    assert r.status_code == 200
    qid = r.json()["id"]

    h = {"Authorization": f"Bearer {admin_token}"}
    d = s.delete(f"{API}/admin/quotes/{qid}", headers=h, timeout=10)
    assert d.status_code == 200
    assert d.json().get("success") is True

    r2 = s.get(f"{API}/admin/quotes", headers=h, timeout=15)
    assert not any(i["id"] == qid for i in r2.json())


def test_admin_summary(s, admin_token):
    r = s.get(f"{API}/admin/summary", headers={"Authorization": f"Bearer {admin_token}"}, timeout=10)
    assert r.status_code == 200
    j = r.json()
    assert "quotes" in j and "applications" in j
    assert isinstance(j["quotes"], int)


# ---------------- Email forwarding log check ----------------
def test_formsubmit_forward_logged(s):
    """Trigger a quote submission and check backend log for FormSubmit forward line."""
    payload = {
        "name": "QA Log Check",
        "email": "qa+log@example.com",
        "phone": "555-777-8888",
        "city": "Plano",
        "service": "One-time cleaning",
        "details": "log verification",
    }
    r = s.post(f"{API}/quotes", json=payload, timeout=15)
    assert r.status_code == 200
    # Give background thread time to POST to formsubmit
    time.sleep(6)

    import glob
    logs = ""
    for path in glob.glob("/var/log/supervisor/backend.*.log"):
        try:
            with open(path) as f:
                logs += f.read()
        except Exception:
            pass
    assert "FormSubmit forward" in logs, "No FormSubmit forward log line found"
    # Look for success line - if not present, note it
    print("Recent FormSubmit lines:")
    for line in logs.splitlines()[-200:]:
        if "FormSubmit" in line:
            print(line)
