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
import requests

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


def _forward_email(subject: str, fields: dict):
    """Forward a submission to the support inbox via FormSubmit (no API key)."""
    try:
        payload = {**fields, "_subject": subject, "_template": "table", "_captcha": "false"}
        requests.post(
            f"https://formsubmit.co/ajax/{FORWARD_EMAIL}",
            json=payload,
            timeout=12,
        )
    except Exception as e:  # never block a submission on email issues
        logging.warning(f"Email forward failed: {e}")


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
    asyncio.create_task(asyncio.to_thread(
        _forward_email,
        "New Quote Request \u2013 Bright at Home Cleaning",
        {
            "Name": body.name, "Phone": body.phone, "Email": body.email,
            "City": body.city or "\u2014", "Service": body.service or "\u2014",
            "Details": body.details or "\u2014",
        },
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
    asyncio.create_task(asyncio.to_thread(
        _forward_email,
        "New Career Application \u2013 Bright at Home Cleaning",
        {
            "Name": body.name, "Phone": body.phone, "Email": body.email,
            "Position": body.position or "\u2014", "About": body.message or "\u2014",
        },
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
