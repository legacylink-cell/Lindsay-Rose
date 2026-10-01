from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import time
import asyncio
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from zoneinfo import ZoneInfo
import jwt
import httpx
import smtplib
import ssl
from email.message import EmailMessage
from email.utils import formataddr

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Config
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'changeme')
JWT_SECRET = os.environ.get('JWT_SECRET', 'dev-secret')
FORWARD_EMAIL = os.environ.get('FORWARD_EMAIL', 'support@brightathomecleaning.com')
SMTP_HOST = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
SMTP_PORT = int(os.environ.get('SMTP_PORT', '587'))
SMTP_USER = os.environ.get('SMTP_USER', '')
SMTP_APP_PASSWORD = (os.environ.get('SMTP_APP_PASSWORD') or '').replace(' ', '')
MAIL_FROM_NAME = os.environ.get('MAIL_FROM_NAME', 'Bright at Home Cleaning')
SITE_URL = os.environ.get('SITE_URL', 'https://brightathomecleaning.com')
REMINDER_AFTER_HOURS = int(os.environ.get('REMINDER_AFTER_HOURS', '24'))
REMINDER_CHECK_MINUTES = int(os.environ.get('REMINDER_CHECK_MINUTES', '180'))
TELEGRAM_BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN', '')
TELEGRAM_CHAT_ID = os.environ.get('TELEGRAM_CHAT_ID', '')
DELIVERY_RETRY_MINUTES = int(os.environ.get('DELIVERY_RETRY_MINUTES', '10'))
DELIVERY_MAX_ATTEMPTS = int(os.environ.get('DELIVERY_MAX_ATTEMPTS', '8'))
WATCHDOG_MINUTES = int(os.environ.get('WATCHDOG_MINUTES', '15'))
BUSINESS_PHONE = '469-443-6903'
BUSINESS_PHONE_RAW = '4694436903'
QUOTE_STATUSES = ('new', 'contacted', 'booked')
APP_STATUSES = ('new', 'contacted')
NOMINATION_STATUSES = ('new', 'reviewing', 'selected', 'not_selected')
NOMINATIONS_OPEN_DAY = 1
NOMINATIONS_CLOSE_DAY = 15
DFW_TZ = ZoneInfo('America/Chicago')
JWT_ALGO = 'HS256'

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=True)


# ---------------- Models ----------------
class QuoteCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    city: Optional[str] = ""
    service: Optional[str] = ""
    details: Optional[str] = ""
    company: Optional[str] = ""  # honeypot (should stay empty)


class ApplicationCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    position: Optional[str] = ""
    message: Optional[str] = ""
    company: Optional[str] = ""  # honeypot


class LoginBody(BaseModel):
    username: str
    password: str


class StatusBody(BaseModel):
    status: str


class NominationBody(BaseModel):
    nominator_name: str
    nominator_phone: str
    nominator_email: str
    nominator_city: str = ""
    nominee_name: str
    nominee_city: str = ""
    nominee_phone: str = ""
    why: str
    relationship: str = ""
    permission_to_contact: bool = False
    understands_selected: bool = False
    wants_discount: bool = False
    company: str = ""


class SettingsBody(BaseModel):
    nominations_live: bool


# ---------------- Helpers ----------------
def _now():
    return datetime.now(timezone.utc)


def _clean(doc: dict) -> dict:
    doc = dict(doc)
    doc.pop('_id', None)
    return doc


def _send_smtp(to: str, subject: str, text: str, reply_to: str = None, html: str = None):
    msg = EmailMessage()
    msg["From"] = formataddr((MAIL_FROM_NAME, SMTP_USER))
    msg["To"] = to
    msg["Subject"] = subject
    if reply_to:
        msg["Reply-To"] = reply_to
    msg.set_content(text)
    if html:
        msg.add_alternative(html, subtype="html")
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=20) as smtp:
        smtp.ehlo()
        smtp.starttls(context=ssl.create_default_context())
        smtp.ehlo()
        smtp.login(SMTP_USER, SMTP_APP_PASSWORD)
        smtp.send_message(msg)


def _email_shell(heading: str, inner_html: str, cta_html: str = "") -> str:
    """Branded email wrapper shared by client confirmations and internal reminders."""
    cta_row = (f'<tr><td align="center" style="padding:6px 30px 30px;">{cta_html}</td></tr>'
               if cta_html else "")
    return f"""\
<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#E8EFE9;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#E8EFE9;padding:28px 12px;">
<tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#FFFFFB;border-radius:14px;overflow:hidden;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
    <tr><td align="center" style="background:#FFFFFB;padding:24px 24px 20px;">
      <img src="{SITE_URL}/logos/logo-b-rooftop-emblem-t.png" alt="Bright at Home Cleaning" width="200" style="display:block;width:200px;max-width:74%;height:auto;border:0;">
    </td></tr>
    <tr><td style="height:4px;background:#C9A227;font-size:0;line-height:0;">&nbsp;</td></tr>
    <tr><td style="padding:30px 30px 8px;">
      <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:#1F4D3A;font-weight:700;">{heading}</h1>
      {inner_html}
    </td></tr>
    {cta_row}
    <tr><td style="background:#E8EFE9;padding:22px 30px;text-align:center;">
      <p style="margin:0 0 6px;font-size:14px;color:#1F4D3A;font-weight:700;">The Bright at Home Cleaning Team</p>
      <p style="margin:0 0 10px;font-size:13px;color:#2E2E2E;font-style:italic;">A brighter home, a brighter life.</p>
      <p style="margin:0;font-size:13px;color:#2E2E2E;">
        <a href="{SITE_URL}" style="color:#1F4D3A;text-decoration:underline;">brightathomecleaning.com</a>
        &nbsp;&middot;&nbsp; Serving Plano, Frisco, McKinney &amp; nearby
      </p>
    </td></tr>
  </table>
</td></tr></table>
</body></html>"""


CLIENT_EMAILS = {
    "quote": {
        "subject": "We received your quote request \u2013 Bright at Home Cleaning",
        "heading": "Thanks for your quote request!",
        "paragraphs": [
            "Thank you for requesting a quote with Bright at Home Cleaning! We've received your "
            "request and a member of our team will reach out very soon to confirm the details and "
            "your custom quote.",
            "Need us sooner? Give us a call or text \u2014 we're happy to help.",
        ],
    },
    "application": {
        "subject": "We received your application \u2013 Bright at Home Cleaning",
        "heading": "Thanks for applying!",
        "paragraphs": [
            "Thank you for applying to join the Bright at Home Cleaning team! We've received your "
            "application and will review it carefully. If it looks like a good fit, we'll be in "
            "touch about the next steps.",
            "Questions in the meantime? Give us a call or text \u2014 we'd love to hear from you.",
        ],
    },
}


def _client_message(kind: str, first: str):
    """Build (subject, plain_text, html) for the confirmation sent to the submitter."""
    tpl = CLIENT_EMAILS[kind]
    greeting = f"Hi {first},"

    text = "\n\n".join([greeting, *tpl["paragraphs"]])
    text += (
        f"\n\nCall or text: {BUSINESS_PHONE}\n{SITE_URL}\n\n"
        "Warm regards,\nThe Bright at Home Cleaning Team\nA brighter home, a brighter life."
    )

    body_html = "".join(
        f'<p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#2E2E2E;">{p}</p>'
        for p in tpl["paragraphs"]
    )
    inner = f'<p style="margin:0 0 18px;font-size:16px;color:#2E2E2E;">{greeting}</p>{body_html}'
    cta = (f'<a href="tel:{BUSINESS_PHONE_RAW}" style="display:inline-block;background:#1F4D3A;'
           f'color:#FFFFFB;text-decoration:none;font-size:16px;font-weight:700;padding:14px 30px;'
           f'border-radius:999px;">Call or text {BUSINESS_PHONE}</a>')
    return tpl["subject"], text, _email_shell(tpl["heading"], inner, cta)


def _hours_since(iso: str):
    try:
        return (_now() - datetime.fromisoformat(iso)).total_seconds() / 3600
    except Exception:
        return None


def _reminder_message(items: list):
    """Build (subject, plain_text, html) for the overdue-leads digest sent to support."""
    n = len(items)
    subject = f"{n} quote request{'s' if n != 1 else ''} still need{'' if n != 1 else 's'} a reply"
    heading = "These leads are still waiting"
    intro = (f"The following came in more than {REMINDER_AFTER_HOURS} hours ago and "
             "aren't marked as contacted yet.")

    text_lines = [intro, ""]
    rows = [f'<p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#2E2E2E;">{intro}</p>']
    for it in items:
        hrs = _hours_since(it.get("created_at", ""))
        age = f"{round(hrs)} hrs ago" if hrs is not None else "recently"
        bits = [b for b in [it.get("city"), it.get("service")] if b and b != "\u2014"]
        meta = " \u00b7 ".join(bits) or "No details given"
        text_lines += [
            f"{it.get('name', 'Unknown')} \u2014 {meta} \u2014 submitted {age}",
            f"  {it.get('phone', '')}  |  {it.get('email', '')}",
            "",
        ]
        rows.append(f"""\
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 12px;background:#E8EFE9;border-radius:10px;">
  <tr><td style="padding:14px 16px;">
    <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:#1F4D3A;">{it.get('name', 'Unknown')}</p>
    <p style="margin:0 0 8px;font-size:13px;color:#2E2E2E;">{meta} &nbsp;&middot;&nbsp; submitted {age}</p>
    <p style="margin:0;font-size:14px;">
      <a href="tel:{it.get('phone', '')}" style="color:#1F4D3A;font-weight:700;text-decoration:none;">{it.get('phone', '')}</a>
      &nbsp;&middot;&nbsp;
      <a href="mailto:{it.get('email', '')}" style="color:#2E2E2E;text-decoration:underline;">{it.get('email', '')}</a>
    </p>
  </td></tr>
</table>""")

    text = "\n".join([*text_lines, f"Open your dashboard: {SITE_URL}/admin"])
    cta = (f'<a href="{SITE_URL}/admin" style="display:inline-block;background:#1F4D3A;color:#FFFFFB;'
           f'text-decoration:none;font-size:16px;font-weight:700;padding:14px 30px;border-radius:999px;">'
           f'Open Admin Dashboard</a>')
    return subject, text, _email_shell(heading, "".join(rows), cta)


async def run_reminders():
    """Email support a digest of quote requests still marked New after the cutoff.
    Each lead is reminded once (reminded_at), so restarts never re-send."""
    docs = await db.quotes.find({
        "$or": [{"status": "new"}, {"status": {"$exists": False}}],
        "reminded_at": {"$exists": False},
    }).sort("created_at", 1).to_list(200)

    overdue = [d for d in docs
               if (_hours_since(d.get("created_at", "")) or 0) >= REMINDER_AFTER_HOURS]
    if not overdue:
        return 0

    subject, text, html = _reminder_message(overdue)
    await asyncio.to_thread(_send_smtp, FORWARD_EMAIL, subject, text, None, html)
    await db.quotes.update_many(
        {"id": {"$in": [d["id"] for d in overdue]}},
        {"$set": {"reminded_at": _now().isoformat()}},
    )
    logging.info("Follow-up reminder sent for %d lead(s)", len(overdue))
    return len(overdue)


async def _reminder_loop():
    while True:
        await asyncio.sleep(REMINDER_CHECK_MINUTES * 60)
        try:
            await run_reminders()
        except Exception as e:
            logging.warning(f"Reminder check failed: {e}")


def _forward_email(subject: str, fields: dict, reply_to: str = None, client_kind: str = None,
                   first_name: str = "there"):
    """Send the submission to the support inbox and a confirmation to the submitter.
    Raises on support-notification failure so the caller can record it and retry.
    A failed client confirmation is logged but does not fail the dispatch."""
    if not SMTP_USER or not SMTP_APP_PASSWORD:
        raise RuntimeError("SMTP not configured (SMTP_USER / SMTP_APP_PASSWORD missing)")

    body = "\n".join(f"{k}: {v}" for k, v in fields.items())
    _send_smtp(FORWARD_EMAIL, subject, body, reply_to)
    logging.info("Support notification sent: %s", subject)

    if client_kind and reply_to:
        try:
            c_subject, c_text, c_html = _client_message(client_kind, first_name)
            _send_smtp(reply_to, c_subject, c_text, html=c_html)
            logging.info("Client confirmation sent: %s", c_subject)
        except Exception as e:
            logging.warning(f"Client confirmation failed: {e}")


# ---------------- Lead delivery (email + Telegram, tracked and retried) ----------------
def _send_telegram(text: str):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        raise RuntimeError("Telegram not configured (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID missing)")
    r = httpx.post(
        f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage",
        json={"chat_id": TELEGRAM_CHAT_ID, "text": text, "parse_mode": "HTML",
              "disable_web_page_preview": True},
        timeout=15,
    )
    if r.status_code != 200:
        raise RuntimeError(f"Telegram API {r.status_code}: {r.text[:200]}")


def _collection(kind: str):
    if kind == "quote":
        return db.quotes
    if kind == "nomination":
        return db.nominations
    return db.applications


def _email_payload(kind: str, doc: dict):
    if kind == "quote":
        return "New Quote Request \u2013 Bright at Home Cleaning", {
            "Name": doc.get("name"), "Phone": doc.get("phone"), "email": doc.get("email"),
            "City": doc.get("city") or "\u2014", "Service": doc.get("service") or "\u2014",
            "Details": doc.get("details") or "\u2014",
        }
    if kind == "nomination":
        return "New Bright Blessing Nomination \u2013 Bright at Home Cleaning", {
            "Nominated by": doc.get("nominator_name"),
            "Nominator phone": doc.get("nominator_phone"),
            "email": doc.get("nominator_email"),
            "Nominator city": doc.get("nominator_city") or "\u2014",
            "Relationship": doc.get("relationship") or "\u2014",
            "Nominee": doc.get("nominee_name"),
            "Nominee city / ZIP": doc.get("nominee_city") or "\u2014",
            "Nominee phone": doc.get("nominee_phone") or "not provided",
            "Why this home": doc.get("why") or "\u2014",
            "OK to contact nominee": "Yes" if doc.get("permission_to_contact") else "No",
            "Wants $25 off (BRIGHT25)": "Yes" if doc.get("wants_discount") else "No",
            "Confirmed it is a selected blessing": "Yes" if doc.get("understands_selected") else "No",
        }
    return "New Career Application \u2013 Bright at Home Cleaning", {
        "Name": doc.get("name"), "Phone": doc.get("phone"), "email": doc.get("email"),
        "Position": doc.get("position") or "\u2014", "About": doc.get("message") or "\u2014",
    }


def _telegram_payload(kind: str, doc: dict):
    if kind == "quote":
        lines = [
            "\U0001F9F9 <b>New quote request</b>",
            f"<b>{doc.get('name', '')}</b>",
            f"\U0001F4DE {doc.get('phone', '')}",
            f"\u2709\uFE0F {doc.get('email', '')}",
        ]
        if doc.get("city"):
            lines.append(f"\U0001F4CD {doc['city']}")
        if doc.get("service"):
            lines.append(f"\U0001F9FD {doc['service']}")
        if doc.get("details"):
            lines.append(f"\n\u201C{doc['details'][:400]}\u201D")
    elif kind == "nomination":
        lines = [
            "\U0001F54A\uFE0F <b>New Bright Blessing nomination</b>",
            f"Nominee: <b>{doc.get('nominee_name', '')}</b> ({doc.get('nominee_city') or 'city not given'})",
            f"From: {doc.get('nominator_name', '')} \u2014 {doc.get('relationship') or 'relationship not given'}",
            f"\U0001F4DE {doc.get('nominator_phone', '')}",
        ]
        if doc.get("why"):
            lines.append(f"\n\u201C{doc['why'][:400]}\u201D")
    else:
        lines = [
            "\U0001F464 <b>New job application</b>",
            f"<b>{doc.get('name', '')}</b>",
            f"\U0001F4DE {doc.get('phone', '')}",
            f"\u2709\uFE0F {doc.get('email', '')}",
        ]
        if doc.get("position"):
            lines.append(f"\U0001F4BC {doc['position']}")
        if doc.get("message"):
            lines.append(f"\n\u201C{doc['message'][:400]}\u201D")
    lines.append(f'\n<a href="{SITE_URL}/admin">Open dashboard</a>')
    return "\n".join(lines)


async def _record(kind: str, doc_id: str, channel: str, status: str, error: str = None):
    await _collection(kind).update_one({"id": doc_id}, {
        "$set": {
            f"delivery.{channel}.status": status,
            f"delivery.{channel}.error": error,
            f"delivery.{channel}.at": _now().isoformat(),
        },
        "$inc": {f"delivery.{channel}.attempts": 1},
    })


async def dispatch_lead(kind: str, doc_id: str):
    """Deliver one lead over every channel, recording the outcome per channel.
    Channels are independent: a broken one can never suppress the other."""
    doc = await _collection(kind).find_one({"id": doc_id})
    if not doc:
        return
    delivery = doc.get("delivery") or {}
    first = (doc.get("name") or doc.get("nominator_name") or "there").split()[0]
    reply_to = doc.get("email") or doc.get("nominator_email")
    # Nominators are thanked manually by Operations (playbook §5), so no auto-confirmation.
    client_kind = None if kind == "nomination" else kind

    if (delivery.get("email") or {}).get("status") != "sent":
        subject, fields = _email_payload(kind, doc)
        try:
            await asyncio.to_thread(_forward_email, subject, fields, reply_to, client_kind, first)
            await _record(kind, doc_id, "email", "sent")
        except Exception as e:
            logging.warning("Email delivery failed for %s %s: %s", kind, doc_id, e)
            await _record(kind, doc_id, "email", "failed", str(e)[:300])

    if (delivery.get("telegram") or {}).get("status") != "sent":
        if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
            await _record(kind, doc_id, "telegram", "not_configured")
        else:
            try:
                await asyncio.to_thread(_send_telegram, _telegram_payload(kind, doc))
                logging.info("Telegram alert sent for %s %s", kind, doc_id)
                await _record(kind, doc_id, "telegram", "sent")
            except Exception as e:
                logging.warning("Telegram delivery failed for %s %s: %s", kind, doc_id, e)
                await _record(kind, doc_id, "telegram", "failed", str(e)[:300])


_smtp_probe_cache = {"at": 0.0, "ok": None, "error": None}


def _smtp_probe(max_age_seconds: int = 60):
    """Live SMTP login check, cached briefly so dashboard loads don't hammer Google."""
    if not SMTP_USER or not SMTP_APP_PASSWORD:
        return None, None
    now = time.monotonic()
    if _smtp_probe_cache["ok"] is not None and now - _smtp_probe_cache["at"] < max_age_seconds:
        return _smtp_probe_cache["ok"], _smtp_probe_cache["error"]
    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=12) as s:
            s.ehlo()
            s.starttls(context=ssl.create_default_context())
            s.ehlo()
            s.login(SMTP_USER, SMTP_APP_PASSWORD)
        ok, err = True, None
    except Exception as e:
        ok, err = False, str(e)[:200]
    _smtp_probe_cache.update({"at": now, "ok": ok, "error": err})
    return ok, err


def _is_channel_outage(error: str) -> bool:
    """True when a failure was the channel being down/misconfigured rather than a bad lead.
    Those must not burn the per-lead retry budget: once the channel is healthy the lead retries."""
    if not error:
        return True
    e = error.lower()
    return any(s in e for s in (
        "not configured", "badcredentials", "username and password not accepted",
        "authentication", "535", "534", "connection", "timed out", "timeout",
        "unreachable", "disconnected", "refused", "temporarily", "try again",
    ))


def _smtp_healthy() -> bool:
    ok, _ = _smtp_probe()
    return bool(ok)


async def retry_failed_deliveries():
    """Re-attempt any lead whose email or Telegram alert has not landed yet.
    A lead is never abandoned because of an outage: the attempt cap only applies to
    lead-specific errors, and is ignored once the channel is healthy again."""
    email_ok = await asyncio.to_thread(_smtp_healthy)
    retried = 0
    for kind in ("quote", "application", "nomination"):
        docs = await _collection(kind).find({
            "$or": [
                {"delivery.email.status": {"$ne": "sent"}},
                {"delivery.telegram.status": "failed"},
            ],
        }).sort("created_at", -1).to_list(100)
        for d in docs:
            channels = d.get("delivery") or {}
            email_ch = channels.get("email") or {}
            tg_ch = channels.get("telegram") or {}
            attempts = max(email_ch.get("attempts", 0), tg_ch.get("attempts", 0))
            recovered = (
                (email_ok and email_ch.get("status") != "sent" and _is_channel_outage(email_ch.get("error")))
                or (TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID and tg_ch.get("status") != "sent"
                    and _is_channel_outage(tg_ch.get("error")))
            )
            if attempts >= DELIVERY_MAX_ATTEMPTS and not recovered:
                continue
            await dispatch_lead(kind, d["id"])
            retried += 1
    if retried:
        logging.info("Retried delivery for %d lead(s)", retried)
    return retried


async def _delivery_retry_loop():
    while True:
        await asyncio.sleep(DELIVERY_RETRY_MINUTES * 60)
        try:
            await retry_failed_deliveries()
        except Exception as e:
            logging.warning(f"Delivery retry sweep failed: {e}")


# Alerting the owner when a channel itself breaks, using whichever channel still works.
_channel_state = {"email": None, "telegram": None}


async def watchdog_check():
    """Detect a channel going down and warn through the surviving channel.
    Only fires on the healthy -> broken transition, so it never spams."""
    email_ok = await asyncio.to_thread(_smtp_healthy)
    telegram_ok = None
    if TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID:
        try:
            await asyncio.to_thread(
                httpx.get, f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getMe", timeout=10
            )
            telegram_ok = True
        except Exception:
            telegram_ok = False

    if _channel_state["email"] is True and email_ok is False and telegram_ok:
        try:
            await asyncio.to_thread(_send_telegram, (
                "\u26A0\uFE0F <b>Lead emails are failing</b>\n"
                "Google is rejecting the mailbox sign-in, so lead notification emails "
                "cannot go out. Leads are still being saved and will send automatically "
                "once it's fixed.\n\nRegenerate the app password at "
                "myaccount.google.com/apppasswords"
            ))
            logging.info("Watchdog: email outage alerted via Telegram")
        except Exception as e:
            logging.warning(f"Watchdog Telegram alert failed: {e}")

    if _channel_state["telegram"] is True and telegram_ok is False and email_ok:
        try:
            await asyncio.to_thread(
                _send_smtp, FORWARD_EMAIL, "Phone alerts are down \u2013 Bright at Home Cleaning",
                "Telegram lead alerts are failing, so you are relying on email only right now.\n"
                "Leads are still being saved and emailed normally.\n\n"
                f"Dashboard: {SITE_URL}/admin",
            )
            logging.info("Watchdog: Telegram outage alerted via email")
        except Exception as e:
            logging.warning(f"Watchdog email alert failed: {e}")

    _channel_state.update({"email": email_ok, "telegram": telegram_ok})
    return {"email_ok": email_ok, "telegram_ok": telegram_ok}


async def _watchdog_loop():
    while True:
        try:
            await watchdog_check()
        except Exception as e:
            logging.warning(f"Watchdog check failed: {e}")
        await asyncio.sleep(WATCHDOG_MINUTES * 60)


def _make_token():
    exp = _now() + timedelta(hours=12)
    return jwt.encode({"sub": ADMIN_USERNAME, "exp": exp}, JWT_SECRET, algorithm=JWT_ALGO)


def require_admin(creds: HTTPAuthorizationCredentials = Depends(security)):
    try:
        jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALGO])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    return True


# ---------------- Public routes ----------------
@api_router.get("/")
async def root():
    return {"message": "Bright at Home Cleaning API"}


@api_router.post("/quotes")
async def create_quote(body: QuoteCreate):
    if body.company:  # honeypot tripped -> pretend success, drop it
        return {"success": True}
    doc = {
        "id": str(uuid.uuid4()),
        "type": "quote",
        "name": body.name, "email": body.email, "phone": body.phone,
        "city": body.city, "service": body.service, "details": body.details,
        "status": "new",
        "created_at": _now().isoformat(),
    }
    await db.quotes.insert_one(dict(doc))
    asyncio.create_task(dispatch_lead("quote", doc["id"]))
    return {"success": True, "id": doc["id"]}


@api_router.post("/applications")
async def create_application(body: ApplicationCreate):
    if body.company:
        return {"success": True}
    doc = {
        "id": str(uuid.uuid4()),
        "type": "application",
        "name": body.name, "email": body.email, "phone": body.phone,
        "position": body.position, "message": body.message,
        "status": "new",
        "created_at": _now().isoformat(),
    }
    await db.applications.insert_one(dict(doc))
    asyncio.create_task(dispatch_lead("application", doc["id"]))
    return {"success": True, "id": doc["id"]}


# ---------------- Admin routes ----------------
@api_router.post("/admin/login")
async def admin_login(body: LoginBody):
    if body.username != ADMIN_USERNAME or body.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    return {"token": _make_token()}


@api_router.get("/admin/quotes")
async def list_quotes(_: bool = Depends(require_admin)):
    items = await db.quotes.find().sort("created_at", -1).to_list(1000)
    return [_clean(i) for i in items]


@api_router.get("/admin/applications")
async def list_applications(_: bool = Depends(require_admin)):
    items = await db.applications.find().sort("created_at", -1).to_list(1000)
    return [_clean(i) for i in items]


@api_router.get("/admin/summary")
async def summary(_: bool = Depends(require_admin)):
    return {
        "quotes": await db.quotes.count_documents({}),
        "applications": await db.applications.count_documents({}),
    }


def nomination_cycle(now: datetime = None):
    """Nominations run the 1st through the 15th, DFW time (playbook §4)."""
    local = (now or _now()).astimezone(DFW_TZ)
    closes = local.replace(day=NOMINATIONS_CLOSE_DAY, hour=23, minute=59, second=59, microsecond=0)
    is_open = local.day <= NOMINATIONS_CLOSE_DAY
    next_open = (closes.replace(day=1) + timedelta(days=32)).replace(day=1)
    return {
        "is_open": is_open,
        "cycle": local.strftime("%Y-%m"),
        "month_label": local.strftime("%B"),
        "closes_label": closes.strftime("%B %-d"),
        "next_open_label": next_open.strftime("%B %-d"),
    }


@api_router.get("/site-settings")
async def site_settings():
    """Public: whether the Bright Blessing page is published, plus the current cycle."""
    doc = await db.settings.find_one({"id": "site"}) or {}
    return {
        "nominations_live": bool(doc.get("nominations_live", False)),
        "nominations": nomination_cycle(),
    }


@api_router.post("/nominations")
async def create_nomination(body: NominationBody):
    if body.company:
        return {"success": True}
    if not body.understands_selected:
        raise HTTPException(status_code=400, detail="Please confirm this is a selected blessing.")
    cycle = nomination_cycle()
    doc = {
        "id": str(uuid.uuid4()), "type": "nomination",
        "nominator_name": body.nominator_name, "nominator_phone": body.nominator_phone,
        "nominator_email": body.nominator_email, "nominator_city": body.nominator_city,
        "nominee_name": body.nominee_name, "nominee_city": body.nominee_city,
        "nominee_phone": body.nominee_phone, "why": body.why,
        "relationship": body.relationship,
        "permission_to_contact": body.permission_to_contact,
        "understands_selected": body.understands_selected,
        "wants_discount": body.wants_discount,
        "cycle": cycle["cycle"],
        "status": "new",
        "created_at": _now().isoformat(),
    }
    await db.nominations.insert_one(dict(doc))
    asyncio.create_task(dispatch_lead("nomination", doc["id"]))
    return {"success": True, "id": doc["id"]}


@api_router.get("/admin/nominations")
async def list_nominations(_: bool = Depends(require_admin)):
    items = await db.nominations.find().sort("created_at", -1).to_list(1000)
    return [_clean(i) for i in items]


@api_router.patch("/admin/nominations/{item_id}/status")
async def set_nomination_status(item_id: str, body: StatusBody, _: bool = Depends(require_admin)):
    if body.status not in NOMINATION_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status")
    res = await db.nominations.update_one({"id": item_id}, {"$set": {"status": body.status}})
    if not res.matched_count:
        raise HTTPException(status_code=404, detail="Not found")
    return {"success": True, "status": body.status}


@api_router.delete("/admin/nominations/{item_id}")
async def delete_nomination(item_id: str, _: bool = Depends(require_admin)):
    res = await db.nominations.delete_one({"id": item_id})
    if not res.deleted_count:
        raise HTTPException(status_code=404, detail="Not found")
    return {"success": True}


@api_router.patch("/admin/site-settings")
async def update_site_settings(body: SettingsBody, _: bool = Depends(require_admin)):
    await db.settings.update_one(
        {"id": "site"},
        {"$set": {"nominations_live": body.nominations_live, "updated_at": _now().isoformat()}},
        upsert=True,
    )
    return {"success": True, "nominations_live": body.nominations_live}


@api_router.get("/admin/delivery-health")
async def delivery_health(_: bool = Depends(require_admin)):
    """Tells the dashboard whether alerts can actually go out right now."""
    email_configured = bool(SMTP_USER and SMTP_APP_PASSWORD)
    smtp_login_ok, smtp_error = await asyncio.to_thread(_smtp_probe)
    undelivered = 0
    for kind in ("quote", "application", "nomination"):
        undelivered += await _collection(kind).count_documents(
            {"delivery.email.status": {"$nin": ["sent", None]}}
        )
    return {
        "email_configured": email_configured,
        "smtp_login_ok": smtp_login_ok,
        "smtp_error": smtp_error,
        "telegram_configured": bool(TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID),
        "undelivered": undelivered,
    }


@api_router.post("/admin/{kind}s/{item_id}/resend")
async def resend_lead(kind: str, item_id: str, _: bool = Depends(require_admin)):
    if kind not in ("quote", "application"):
        raise HTTPException(status_code=400, detail="Invalid kind")
    doc = await _collection(kind).find_one({"id": item_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    await _collection(kind).update_one(
        {"id": item_id},
        {"$set": {"delivery.email.status": "pending", "delivery.telegram.status": "pending"}},
    )
    await dispatch_lead(kind, item_id)
    updated = await _collection(kind).find_one({"id": item_id})
    return {"success": True, "delivery": (updated or {}).get("delivery", {})}


@api_router.post("/admin/telegram/test")
async def telegram_test(_: bool = Depends(require_admin)):
    try:
        await asyncio.to_thread(
            _send_telegram,
            "\u2705 <b>Bright at Home Cleaning</b>\nAlerts are connected. "
            "You'll get a message here the moment any form is submitted.",
        )
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)[:300])


@api_router.patch("/admin/quotes/{item_id}/status")
async def set_quote_status(item_id: str, body: StatusBody, _: bool = Depends(require_admin)):
    if body.status not in QUOTE_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status")
    update = {"status": body.status}
    if body.status != "new":
        # Handled, so it should never appear in a follow-up reminder.
        update["reminded_at"] = _now().isoformat()
    res = await db.quotes.update_one({"id": item_id}, {"$set": update})
    if not res.matched_count:
        raise HTTPException(status_code=404, detail="Not found")
    return {"success": True, "status": body.status}


@api_router.patch("/admin/applications/{item_id}/status")
async def set_application_status(item_id: str, body: StatusBody, _: bool = Depends(require_admin)):
    if body.status not in APP_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status")
    res = await db.applications.update_one({"id": item_id}, {"$set": {"status": body.status}})
    if not res.matched_count:
        raise HTTPException(status_code=404, detail="Not found")
    return {"success": True, "status": body.status}


@api_router.post("/admin/reminders/run")
async def trigger_reminders(_: bool = Depends(require_admin)):
    sent = await run_reminders()
    return {"success": True, "leads_reminded": sent}


@api_router.delete("/admin/quotes/{item_id}")
async def delete_quote(item_id: str, _: bool = Depends(require_admin)):
    await db.quotes.delete_one({"id": item_id})
    return {"success": True}


@api_router.delete("/admin/applications/{item_id}")
async def delete_application(item_id: str, _: bool = Depends(require_admin)):
    await db.applications.delete_one({"id": item_id})
    return {"success": True}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def start_reminder_loop():
    asyncio.create_task(_reminder_loop())
    asyncio.create_task(_delivery_retry_loop())
    asyncio.create_task(_watchdog_loop())
    logging.info("Follow-up reminders: every %d min, cutoff %d hrs | delivery retry: every %d min",
                 REMINDER_CHECK_MINUTES, REMINDER_AFTER_HOURS, DELIVERY_RETRY_MINUTES)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
