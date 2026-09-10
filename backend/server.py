from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import asyncio
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
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
BUSINESS_PHONE = '469-443-6903'
BUSINESS_PHONE_RAW = '4694436903'
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
    html = f"""\
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
      <h1 style="margin:0 0 6px;font-size:22px;line-height:1.3;color:#1F4D3A;font-weight:700;">{tpl['heading']}</h1>
      <p style="margin:0 0 18px;font-size:16px;color:#2E2E2E;">{greeting}</p>
      {body_html}
    </td></tr>
    <tr><td align="center" style="padding:6px 30px 30px;">
      <a href="tel:{BUSINESS_PHONE_RAW}" style="display:inline-block;background:#1F4D3A;color:#FFFFFB;text-decoration:none;font-size:16px;font-weight:700;padding:14px 30px;border-radius:999px;">Call or text {BUSINESS_PHONE}</a>
    </td></tr>
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
    return tpl["subject"], text, html


def _forward_email(subject: str, fields: dict, reply_to: str = None, client_kind: str = None,
                   first_name: str = "there"):
    """Send the submission to the support inbox and a confirmation to the submitter.
    Each send is independent; email failures never affect the saved submission."""
    if not SMTP_USER or not SMTP_APP_PASSWORD:
        logging.warning("SMTP not configured; skipping email for: %s", subject)
        return

    body = "\n".join(f"{k}: {v}" for k, v in fields.items())
    try:
        _send_smtp(FORWARD_EMAIL, subject, body, reply_to)
        logging.info("Support notification sent: %s", subject)
    except Exception as e:
        logging.warning(f"Support notification failed: {e}")

    if client_kind and reply_to:
        try:
            c_subject, c_text, c_html = _client_message(client_kind, first_name)
            _send_smtp(reply_to, c_subject, c_text, html=c_html)
            logging.info("Client confirmation sent: %s", c_subject)
        except Exception as e:
            logging.warning(f"Client confirmation failed: {e}")


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
        "created_at": _now().isoformat(),
    }
    await db.quotes.insert_one(dict(doc))
    first = body.name.split()[0] if body.name else "there"
    asyncio.create_task(asyncio.to_thread(
        _forward_email,
        "New Quote Request \u2013 Bright at Home Cleaning",
        {
            "Name": body.name, "Phone": body.phone, "email": body.email,
            "City": body.city or "\u2014", "Service": body.service or "\u2014",
            "Details": body.details or "\u2014",
        },
        body.email,
        "quote",
        first,
    ))
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
        "created_at": _now().isoformat(),
    }
    await db.applications.insert_one(dict(doc))
    first = body.name.split()[0] if body.name else "there"
    asyncio.create_task(asyncio.to_thread(
        _forward_email,
        "New Career Application \u2013 Bright at Home Cleaning",
        {
            "Name": body.name, "Phone": body.phone, "email": body.email,
            "Position": body.position or "\u2014", "About": body.message or "\u2014",
        },
        body.email,
        "application",
        first,
    ))
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


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
