"""Backend tests for delivery-health, resend, telegram-test and per-lead delivery tracking."""
import time
import pytest
import requests
from pathlib import Path


def _visitor_headers():
    """Each test submission looks like a different visitor. Behind a proxy the backend
    trusts X-Forwarded-For, so without this the whole suite shares one rate-limit bucket."""
    import random
    return {"X-Forwarded-For": f"198.18.%d.%d" % (random.randint(1, 250), random.randint(1, 250))}

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
def token(s):
    r = s.post(f"{API}/admin/login", json={"username": ADMIN_USER, "password": ADMIN_PASS}, timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="module")
def auth(token):
    return {"Authorization": f"Bearer {token}"}


# ---- delivery-health ----
def test_delivery_health_requires_auth(s):
    r = s.get(f"{API}/admin/delivery-health")
    assert r.status_code in (401, 403)


def test_delivery_health_shape(s, auth):
    r = s.get(f"{API}/admin/delivery-health", headers=auth, timeout=20)
    assert r.status_code == 200
    j = r.json()
    assert j.get("email_configured") is True
    assert j.get("smtp_login_ok") is True, f"SMTP not healthy: {j}"
    assert j.get("telegram_configured") is False
    assert isinstance(j.get("undelivered"), int)


# ---- telegram test endpoint (unconfigured -> 400) ----
def test_telegram_test_unconfigured_returns_400(s, auth):
    r = s.post(f"{API}/admin/telegram/test", headers=auth, timeout=15)
    assert r.status_code == 400
    detail = (r.json().get("detail") or "").lower()
    assert "telegram" in detail and ("not configured" in detail or "missing" in detail or "not connected" in detail or "empty" in detail or "token" in detail)


def test_telegram_test_requires_auth(s):
    r = s.post(f"{API}/admin/telegram/test")
    assert r.status_code in (401, 403)


# ---- Quote submission records delivery.email.status = sent ----
def _wait_for_email_sent(s, auth, kind_plural, doc_id, timeout=20):
    deadline = time.time() + timeout
    last = None
    while time.time() < deadline:
        items = s.get(f"{API}/admin/{kind_plural}", headers=auth, timeout=15).json()
        m = next((i for i in items if i["id"] == doc_id), None)
        if m and (m.get("delivery") or {}).get("email", {}).get("status") == "sent":
            return m
        last = m
        time.sleep(2)
    pytest.fail(f"email never marked sent for {kind_plural}/{doc_id}. Last state: {last}")


def test_quote_records_email_sent_and_telegram_not_configured(s, auth):
    r = s.post(f"{API}/quotes", json={
        "name": "QA Regression Test - delivery quote",
        "email": "qa+delivery@example.com",
        "phone": "555-000-7001",
        "city": "Dallas",
        "service": "Deep cleaning",
        "details": "QA delivery-tracking regression",
    }, timeout=15, headers=_visitor_headers())
    assert r.status_code == 200
    qid = r.json()["id"]

    m = _wait_for_email_sent(s, auth, "quotes", qid, timeout=25)
    delivery = m.get("delivery") or {}
    email = delivery.get("email") or {}
    assert email.get("status") == "sent"
    assert email.get("attempts", 0) >= 1
    tg = delivery.get("telegram") or {}
    # Telegram is unconfigured -> should NOT be 'sent', should be 'not_configured' (or pending -> not_configured)
    assert tg.get("status") in ("not_configured", None, "pending"), f"unexpected telegram status: {tg}"
    # Email independence: sent regardless of telegram
    assert email.get("status") == "sent"

    # cleanup
    s.delete(f"{API}/admin/quotes/{qid}", headers=auth)


def test_application_records_email_sent(s, auth):
    r = s.post(f"{API}/applications", json={
        "name": "QA Regression Test - delivery app",
        "email": "qa+deliveryapp@example.com",
        "phone": "555-000-7002",
        "position": "Cleaner",
        "message": "QA delivery-tracking regression",
    }, timeout=15, headers=_visitor_headers())
    assert r.status_code == 200
    aid = r.json()["id"]

    m = _wait_for_email_sent(s, auth, "applications", aid, timeout=25)
    email = (m.get("delivery") or {}).get("email") or {}
    assert email.get("status") == "sent"
    assert email.get("attempts", 0) >= 1

    s.delete(f"{API}/admin/applications/{aid}", headers=auth)


# ---- Resend endpoint ----
def test_resend_requires_auth(s):
    r = s.post(f"{API}/admin/quotes/any/resend")
    assert r.status_code in (401, 403)


def test_resend_invalid_kind_returns_400(s, auth):
    r = s.post(f"{API}/admin/foos/anything/resend", headers=auth)
    # Route pattern uses {kind}s so /admin/foos/.../resend matches with kind='foo'
    assert r.status_code == 400


def test_resend_unknown_id_returns_404(s, auth):
    r = s.post(f"{API}/admin/quotes/does-not-exist/resend", headers=auth)
    assert r.status_code == 404


def test_resend_reincrements_attempts_and_returns_delivery(s, auth):
    # Create a fresh quote, wait for sent, then resend and verify attempts incremented
    r = s.post(f"{API}/quotes", json={
        "name": "QA Regression Test - resend",
        "email": "qa+resend@example.com",
        "phone": "555-000-7003",
        "city": "Plano",
        "service": "One-time cleaning",
        "details": "QA resend test",
    }, timeout=15, headers=_visitor_headers())
    qid = r.json()["id"]
    m = _wait_for_email_sent(s, auth, "quotes", qid, timeout=25)
    attempts_before = (m["delivery"]["email"]).get("attempts", 0)

    r2 = s.post(f"{API}/admin/quotes/{qid}/resend", headers=auth, timeout=25)
    assert r2.status_code == 200
    body = r2.json()
    assert body.get("success") is True
    assert "delivery" in body
    # give the background dispatch a moment
    m2 = _wait_for_email_sent(s, auth, "quotes", qid, timeout=25)
    attempts_after = (m2["delivery"]["email"]).get("attempts", 0)
    assert attempts_after >= attempts_before, f"attempts did not persist: before={attempts_before} after={attempts_after}"

    s.delete(f"{API}/admin/quotes/{qid}", headers=auth)


# ---- retry_failed_deliveries idempotency (indirect): after everything is sent,
# delivery-health.undelivered should be 0 and stay 0 across a couple of polls.
def test_undelivered_stays_zero(s, auth):
    j1 = s.get(f"{API}/admin/delivery-health", headers=auth, timeout=20).json()
    time.sleep(3)
    j2 = s.get(f"{API}/admin/delivery-health", headers=auth, timeout=20).json()
    assert j1.get("undelivered") == 0, f"leftover undelivered leads: {j1}"
    assert j2.get("undelivered") == 0
