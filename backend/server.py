from fastapi import FastAPI, APIRouter, HTTPException, Depends, BackgroundTasks
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt
import random
from enum import Enum
import httpx
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"

# OneSignal Configuration
ONESIGNAL_APP_ID = "3adbb1be-a764-4977-a22c-0de12043ac2e"
ONESIGNAL_REST_API_KEY = os.environ.get("ONESIGNAL_REST_API_KEY", "")  # سنحتاجه لاحقاً

# Scheduler for automatic reminders
scheduler = AsyncIOScheduler()

# Function to send automatic reminders
async def send_automatic_reminders():
    """
    Check for appointments and send reminders:
    - 24 hours before appointment
    - 3 hours before appointment
    """
    try:
        now = datetime.now(timezone.utc)
        
        # Get all confirmed appointments
        appointments = await db.appointments.find({"status": "confirmed"}, {"_id": 0}).to_list(1000)
        
        for apt in appointments:
            # Parse appointment date
            apt_date = datetime.fromisoformat(apt['appointment_date']) if isinstance(apt['appointment_date'], str) else apt['appointment_date']
            
            # Make sure apt_date is timezone-aware
            if apt_date.tzinfo is None:
                apt_date = apt_date.replace(tzinfo=timezone.utc)
            
            time_until_appointment = apt_date - now
            hours_until = time_until_appointment.total_seconds() / 3600
            
            # 24-hour reminder (send if between 24h and 23h before appointment)
            if 23 <= hours_until <= 24 and not apt.get('reminder_24h_sent', False):
                await send_reminder_notification(
                    apt, 
                    "تذكير: موعدك غداً 📅",
                    f"موعدك مع د. {apt['doctor_name']} غداً في تمام الساعة {apt_date.strftime('%I:%M %p')}\n\nنتطلع لرؤيتك 🦷"
                )
                # Mark as sent
                await db.appointments.update_one(
                    {"id": apt['id']},
                    {"$set": {"reminder_24h_sent": True}}
                )
                print(f"✅ Sent 24h reminder for appointment {apt['id']}")
            
            # 3-hour reminder (send if between 3h and 2.5h before appointment)
            elif 2.5 <= hours_until <= 3 and not apt.get('reminder_3h_sent', False):
                await send_reminder_notification(
                    apt,
                    "تذكير: موعدك بعد 3 ساعات ⏰",
                    f"موعدك مع د. {apt['doctor_name']} بعد 3 ساعات\n📍 عيادات الغصاب\n⏰ {apt_date.strftime('%I:%M %p')}\n\nنراك قريباً 😊"
                )
                # Mark as sent
                await db.appointments.update_one(
                    {"id": apt['id']},
                    {"$set": {"reminder_3h_sent": True}}
                )
                print(f"✅ Sent 3h reminder for appointment {apt['id']}")
    
    except Exception as e:
        print(f"❌ Error in automatic reminders: {e}")

async def send_reminder_notification(appointment: dict, title: str, message: str):
    """Send reminder notification via OneSignal"""
    try:
        async with httpx.AsyncClient() as client:
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Basic {ONESIGNAL_REST_API_KEY}"
            }
            
            payload = {
                "app_id": ONESIGNAL_APP_ID,
                "included_segments": ["All"],
                "headings": {"en": title, "ar": title},
                "contents": {"en": message, "ar": message},
                "url": "https://dental-booking-app.preview.emergentagent.com/patient/dashboard"
            }
            
            response = await client.post(
                "https://onesignal.com/api/v1/notifications",
                headers=headers,
                json=payload,
                timeout=10.0
            )
            
            if response.status_code == 200:
                print(f"✅ Reminder notification sent for {appointment.get('patient_phone', 'unknown')}")
            else:
                print(f"❌ Failed to send reminder: {response.text}")
    except Exception as e:
        print(f"❌ Error sending reminder notification: {e}")

# Enums
class UserRole(str, Enum):
    ADMIN = "admin"
    PATIENT = "patient"

class AppointmentStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class ServiceType(str, Enum):
    CLEANING = "تنظيف"
    FILLING = "حشو"
    EXTRACTION = "خلع"
    ROOT_CANAL = "علاج عصب"
    WHITENING = "تبييض"
    ORTHODONTICS = "تقويم"
    IMPLANTS = "زراعة"
    COSMETIC = "تجميل"

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    phone: str
    name: Optional[str] = None
    role: UserRole = UserRole.PATIENT
    fcm_token: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    phone: str
    name: Optional[str] = None

class OTPVerify(BaseModel):
    phone: str
    otp: str

class Doctor(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    specialization: str
    phone: Optional[str] = None
    available_days: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DoctorCreate(BaseModel):
    name: str
    specialization: str
    phone: Optional[str] = None
    available_days: List[str] = []

class Service(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    name_en: str
    description: Optional[str] = None
    duration_minutes: int = 30
    price: Optional[float] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ServiceCreate(BaseModel):
    name: str
    name_en: str
    description: Optional[str] = None
    duration_minutes: int = 30
    price: Optional[float] = None

class Appointment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    patient_id: str
    patient_name: str
    patient_phone: str
    doctor_id: str
    doctor_name: str
    service_id: str
    service_name: str
    appointment_date: datetime
    status: AppointmentStatus = AppointmentStatus.PENDING
    notes: Optional[str] = None
    reminder_24h_sent: bool = False
    reminder_3h_sent: bool = False
    post_visit_sent: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by: str = "patient"  # patient or admin

class AppointmentCreate(BaseModel):
    patient_id: Optional[str] = None
    patient_name: str
    patient_phone: str
    doctor_id: str
    service_id: str
    appointment_date: datetime
    notes: Optional[str] = None
    created_by: str = "patient"

class AppointmentUpdate(BaseModel):
    doctor_id: Optional[str] = None
    service_id: Optional[str] = None
    appointment_date: Optional[datetime] = None
    status: Optional[AppointmentStatus] = None
    notes: Optional[str] = None

class Campaign(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    message: str
    target_audience: str  # all, service_type, last_visit_date, etc.
    target_filter: Optional[dict] = None
    sent_count: int = 0
    opened_count: int = 0
    booked_count: int = 0
    status: str = "draft"  # draft, sent, scheduled
    scheduled_for: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by: str

class CampaignCreate(BaseModel):
    title: str
    message: str
    target_audience: str
    target_filter: Optional[dict] = None
    scheduled_for: Optional[datetime] = None

class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    message: str
    type: str  # reminder, campaign, post_visit, general
    appointment_id: Optional[str] = None
    read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class NotificationCreate(BaseModel):
    user_id: str
    title: str
    message: str
    type: str
    appointment_id: Optional[str] = None

class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    appointment_id: str
    patient_id: str
    rating: int  # 1-5
    comment: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReviewCreate(BaseModel):
    appointment_id: str
    patient_id: str
    rating: int
    comment: Optional[str] = None

class Stats(BaseModel):
    total_appointments: int
    pending_appointments: int
    confirmed_appointments: int
    completed_appointments: int
    cancelled_appointments: int
    total_patients: int
    total_doctors: int
    avg_rating: float

# Helper functions
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=30)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def generate_otp():
    return str(random.randint(100000, 999999))

async def send_notification(user_id: str, title: str, message: str, notification_type: str, appointment_id: Optional[str] = None):
    """Send notification to user and store in database"""
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=notification_type,
        appointment_id=appointment_id
    )
    doc = notification.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.notifications.insert_one(doc)
    
    # Note: Push notifications sent via campaigns endpoint
    return notification

# Admin Auth Models
class AdminLogin(BaseModel):
    username: str
    password: str

class ChangePasswordRequest(BaseModel):
    user_id: str
    current_password: str
    new_password: str

class AdminUser(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    password_hash: str
    name: str
    role: UserRole = UserRole.ADMIN
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Helper function to verify password
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# Admin Auth Routes
@api_router.post("/auth/admin/login")
async def admin_login(login_data: AdminLogin):
    """Admin login with username and password"""
    admin = await db.admin_users.find_one({"username": login_data.username}, {"_id": 0})
    
    if not admin:
        raise HTTPException(status_code=401, detail="اسم المستخدم أو كلمة المرور غير صحيحة")
    
    if not verify_password(login_data.password, admin['password_hash']):
        raise HTTPException(status_code=401, detail="اسم المستخدم أو كلمة المرور غير صحيحة")
    
    # Create token
    token = create_access_token({
        "user_id": admin['id'],
        "username": admin['username'],
        "role": admin['role']
    })
    
    return {
        "token": token,
        "user": {
            "id": admin['id'],
            "name": admin['name'],
            "role": admin['role'],
            "username": admin['username']
        }
    }

@api_router.put("/admin/change-password")
async def change_admin_password(change_data: ChangePasswordRequest):
    """Change admin password"""
    admin = await db.admin_users.find_one({"id": change_data.user_id}, {"_id": 0})
    
    if not admin:
        raise HTTPException(status_code=404, detail="المستخدم غير موجود")
    
    # Verify current password
    if not verify_password(change_data.current_password, admin['password_hash']):
        raise HTTPException(status_code=401, detail="كلمة المرور الحالية غير صحيحة")
    
    # Hash new password
    new_password_hash = hash_password(change_data.new_password)
    
    # Update password
    await db.admin_users.update_one(
        {"id": change_data.user_id},
        {"$set": {"password_hash": new_password_hash}}
    )
    
    return {"message": "تم تغيير كلمة المرور بنجاح"}

# Auth Routes
@api_router.post("/auth/send-otp")
async def send_otp(user_data: UserCreate):
    """Send OTP to phone number"""
    otp = generate_otp()
    # Store OTP in database with expiry
    otp_data = {
        "phone": user_data.phone,
        "otp": otp,
        "expires_at": (datetime.now(timezone.utc) + timedelta(minutes=5)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.otps.delete_many({"phone": user_data.phone})  # Delete old OTPs
    await db.otps.insert_one(otp_data)
    
    # TODO: Integrate with SMS provider
    # For now, return OTP in response (only for development)
    return {"message": "OTP sent successfully", "otp": otp, "phone": user_data.phone}

@api_router.post("/auth/verify-otp")
async def verify_otp(verify_data: OTPVerify):
    """Verify OTP and create/login user"""
    # Check OTP
    otp_record = await db.otps.find_one({"phone": verify_data.phone, "otp": verify_data.otp})
    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    # Check expiry
    expires_at = datetime.fromisoformat(otp_record['expires_at'])
    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=400, detail="OTP expired")
    
    # Delete used OTP
    await db.otps.delete_one({"phone": verify_data.phone})
    
    # Find or create user
    user_doc = await db.users.find_one({"phone": verify_data.phone}, {"_id": 0})
    if user_doc:
        if isinstance(user_doc['created_at'], str):
            user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
        user = User(**user_doc)
    else:
        user = User(phone=verify_data.phone, role=UserRole.PATIENT)
        doc = user.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.users.insert_one(doc)
    
    # Create token
    token = create_access_token({"user_id": user.id, "phone": user.phone, "role": user.role})
    
    return {"token": token, "user": user}

# User Routes
@api_router.get("/users/me")
async def get_current_user(token: str):
    """Get current user info"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user_doc:
            raise HTTPException(status_code=404, detail="User not found")
        if isinstance(user_doc['created_at'], str):
            user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
        return User(**user_doc)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@api_router.put("/users/me")
async def update_user(token: str, name: Optional[str] = None, fcm_token: Optional[str] = None):
    """Update user profile"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        update_data = {}
        if name:
            update_data["name"] = name
        if fcm_token:
            update_data["fcm_token"] = fcm_token
        
        if update_data:
            await db.users.update_one({"id": user_id}, {"$set": update_data})
        
        user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})
        if isinstance(user_doc['created_at'], str):
            user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
        return User(**user_doc)
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Doctor Routes
@api_router.post("/doctors", response_model=Doctor)
async def create_doctor(doctor: DoctorCreate):
    doctor_obj = Doctor(**doctor.model_dump())
    doc = doctor_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.doctors.insert_one(doc)
    return doctor_obj

@api_router.get("/doctors", response_model=List[Doctor])
async def get_doctors():
    doctors = await db.doctors.find({}, {"_id": 0}).to_list(1000)
    for doctor in doctors:
        if isinstance(doctor['created_at'], str):
            doctor['created_at'] = datetime.fromisoformat(doctor['created_at'])
    return doctors

@api_router.get("/doctors/{doctor_id}", response_model=Doctor)
async def get_doctor(doctor_id: str):
    doctor = await db.doctors.find_one({"id": doctor_id}, {"_id": 0})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    if isinstance(doctor['created_at'], str):
        doctor['created_at'] = datetime.fromisoformat(doctor['created_at'])
    return Doctor(**doctor)

@api_router.delete("/doctors/{doctor_id}")
async def delete_doctor(doctor_id: str):
    result = await db.doctors.delete_one({"id": doctor_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return {"message": "Doctor deleted successfully"}

# Service Routes
@api_router.post("/services", response_model=Service)
async def create_service(service: ServiceCreate):
    service_obj = Service(**service.model_dump())
    doc = service_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.services.insert_one(doc)
    return service_obj

@api_router.get("/services", response_model=List[Service])
async def get_services():
    services = await db.services.find({}, {"_id": 0}).to_list(1000)
    for service in services:
        if isinstance(service['created_at'], str):
            service['created_at'] = datetime.fromisoformat(service['created_at'])
    return services

@api_router.delete("/services/{service_id}")
async def delete_service(service_id: str):
    result = await db.services.delete_one({"id": service_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"message": "Service deleted successfully"}

# Appointment Routes
@api_router.post("/appointments", response_model=Appointment)
async def create_appointment(appointment: AppointmentCreate):
    # Get doctor and service info
    doctor = await db.doctors.find_one({"id": appointment.doctor_id}, {"_id": 0})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    service = await db.services.find_one({"id": appointment.service_id}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    appointment_obj = Appointment(
        patient_id=appointment.patient_id or "",
        patient_name=appointment.patient_name,
        patient_phone=appointment.patient_phone,
        doctor_id=appointment.doctor_id,
        doctor_name=doctor['name'],
        service_id=appointment.service_id,
        service_name=service['name'],
        appointment_date=appointment.appointment_date,
        notes=appointment.notes,
        created_by=appointment.created_by
    )
    
    doc = appointment_obj.model_dump()
    doc['appointment_date'] = doc['appointment_date'].isoformat()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.appointments.insert_one(doc)
    
    return appointment_obj

@api_router.get("/appointments", response_model=List[Appointment])
async def get_appointments(status: Optional[str] = None, patient_id: Optional[str] = None, patient_phone: Optional[str] = None):
    query = {}
    if status:
        query["status"] = status
    if patient_id:
        query["patient_id"] = patient_id
    if patient_phone:
        query["patient_phone"] = patient_phone
    
    appointments = await db.appointments.find(query, {"_id": 0}).to_list(1000)
    for apt in appointments:
        if isinstance(apt['appointment_date'], str):
            apt['appointment_date'] = datetime.fromisoformat(apt['appointment_date'])
        if isinstance(apt['created_at'], str):
            apt['created_at'] = datetime.fromisoformat(apt['created_at'])
    return appointments

@api_router.get("/appointments/{appointment_id}", response_model=Appointment)
async def get_appointment(appointment_id: str):
    apt = await db.appointments.find_one({"id": appointment_id}, {"_id": 0})
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if isinstance(apt['appointment_date'], str):
        apt['appointment_date'] = datetime.fromisoformat(apt['appointment_date'])
    if isinstance(apt['created_at'], str):
        apt['created_at'] = datetime.fromisoformat(apt['created_at'])
    return Appointment(**apt)

@api_router.put("/appointments/{appointment_id}", response_model=Appointment)
async def update_appointment(appointment_id: str, update: AppointmentUpdate):
    apt = await db.appointments.find_one({"id": appointment_id}, {"_id": 0})
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    
    # Update doctor/service names if IDs changed
    if "doctor_id" in update_data:
        doctor = await db.doctors.find_one({"id": update_data["doctor_id"]}, {"_id": 0})
        if doctor:
            update_data["doctor_name"] = doctor['name']
    
    if "service_id" in update_data:
        service = await db.services.find_one({"id": update_data["service_id"]}, {"_id": 0})
        if service:
            update_data["service_name"] = service['name']
    
    if "appointment_date" in update_data:
        update_data["appointment_date"] = update_data["appointment_date"].isoformat()
    
    if update_data:
        await db.appointments.update_one({"id": appointment_id}, {"$set": update_data})
    
    apt = await db.appointments.find_one({"id": appointment_id}, {"_id": 0})
    if isinstance(apt['appointment_date'], str):
        apt['appointment_date'] = datetime.fromisoformat(apt['appointment_date'])
    if isinstance(apt['created_at'], str):
        apt['created_at'] = datetime.fromisoformat(apt['created_at'])
    
    # Send notification if status changed to confirmed
    if update.status == AppointmentStatus.CONFIRMED:
        # Check if patient_phone exists (always present in appointments)
        if apt.get('patient_phone'):
            # Send in-app notification (only if patient has an ID)
            if apt.get('patient_id') and apt['patient_id']:
                await send_notification(
                    apt['patient_id'],
                    "تم تأكيد موعدك",
                    f"تم تأكيد موعدك مع د. {apt['doctor_name']} في {apt['appointment_date']}",
                    "reminder",
                    appointment_id
                )
            
            # Send push notification via OneSignal (for ALL patients)
            try:
                async with httpx.AsyncClient() as client:
                    headers = {
                        "Content-Type": "application/json",
                        "Authorization": f"Basic {ONESIGNAL_REST_API_KEY}"
                    }
                    
                    # Format date nicely
                    apt_date = datetime.fromisoformat(apt['appointment_date']) if isinstance(apt['appointment_date'], str) else apt['appointment_date']
                    formatted_date = apt_date.strftime('%A %d %B الساعة %I:%M %p')
                    
                    payload = {
                        "app_id": ONESIGNAL_APP_ID,
                        "included_segments": ["All"],
                        "headings": {"en": "✅ تم تأكيد موعدك", "ar": "✅ تم تأكيد موعدك"},
                        "contents": {
                            "en": f"موعدك مع د. {apt['doctor_name']}\n{formatted_date}\n\nنتطلع لرؤيتك 🦷",
                            "ar": f"موعدك مع د. {apt['doctor_name']}\n{formatted_date}\n\nنتطلع لرؤيتك 🦷"
                        },
                        "url": "https://dental-booking-app.preview.emergentagent.com/patient/dashboard"
                    }
                    
                    response = await client.post(
                        "https://onesignal.com/api/v1/notifications",
                        headers=headers,
                        json=payload,
                        timeout=10.0
                    )
                    
                    if response.status_code == 200:
                        print(f"✅ Confirmation push notification sent for patient: {apt['patient_phone']}")
                    else:
                        print(f"❌ Failed to send push notification: {response.text}")
            except Exception as e:
                print(f"Error sending OneSignal notification: {e}")
    
    return Appointment(**apt)

@api_router.delete("/appointments/{appointment_id}")
async def delete_appointment(appointment_id: str):
    result = await db.appointments.delete_one({"id": appointment_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"message": "Appointment deleted successfully"}

# Campaign Routes
@api_router.post("/campaigns", response_model=Campaign)
async def create_campaign(campaign: CampaignCreate, created_by: str = "admin"):
    campaign_obj = Campaign(**campaign.model_dump(), created_by=created_by)
    doc = campaign_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    if doc.get('scheduled_for'):
        doc['scheduled_for'] = doc['scheduled_for'].isoformat()
    await db.campaigns.insert_one(doc)
    return campaign_obj

@api_router.get("/campaigns", response_model=List[Campaign])
async def get_campaigns():
    campaigns = await db.campaigns.find({}, {"_id": 0}).to_list(1000)
    for camp in campaigns:
        if isinstance(camp['created_at'], str):
            camp['created_at'] = datetime.fromisoformat(camp['created_at'])
        if camp.get('scheduled_for') and isinstance(camp['scheduled_for'], str):
            camp['scheduled_for'] = datetime.fromisoformat(camp['scheduled_for'])
    return campaigns

@api_router.post("/campaigns/{campaign_id}/send")
async def send_campaign(campaign_id: str, max_recipients: Optional[int] = None, background_tasks: BackgroundTasks = None):
    """
    Send campaign with advanced targeting options
    max_recipients: Maximum number of recipients (None = send to all)
    """
    campaign = await db.campaigns.find_one({"id": campaign_id}, {"_id": 0})
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    # Get all users who have phone numbers (potential recipients)
    all_users = await db.users.find({"phone": {"$exists": True, "$ne": ""}}, {"_id": 0, "phone": 1}).to_list(100000)
    
    # Get list of users who already received this campaign
    previous_recipients = campaign.get('sent_to_users', [])
    
    # Filter out users who already received this campaign
    available_users = [user for user in all_users if user['phone'] not in previous_recipients]
    
    # Determine how many users to send to
    if max_recipients and max_recipients < len(available_users):
        # Random selection of users
        import random
        selected_users = random.sample(available_users, max_recipients)
    else:
        # Send to all available users
        selected_users = available_users
    
    # Extract phone numbers
    phone_numbers = [user['phone'] for user in selected_users]
    
    if not phone_numbers:
        raise HTTPException(status_code=400, detail="لا يوجد مستخدمون جدد لإرسال الحملة إليهم")
    
    # Send push notification via OneSignal
    try:
        async with httpx.AsyncClient() as client:
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Basic {ONESIGNAL_REST_API_KEY}"
            }
            
            # إرسال للمستخدمين المحددين
            payload = {
                "app_id": ONESIGNAL_APP_ID,
                "included_segments": ["All"],
                "headings": {"en": campaign['title'], "ar": campaign['title']},
                "contents": {"en": campaign['message'], "ar": campaign['message']},
                "url": "https://dental-booking-app.preview.emergentagent.com/patient/dashboard"
            }
            
            response = await client.post(
                "https://onesignal.com/api/v1/notifications",
                headers=headers,
                json=payload,
                timeout=10.0
            )
            
            if response.status_code == 200:
                result = response.json()
                sent_count = result.get('recipients', 0)
                print(f"✅ Campaign sent to {sent_count} users")
                
                # Update campaign with new recipients
                updated_recipients = previous_recipients + phone_numbers
                total_sent = len(updated_recipients)
                
                await db.campaigns.update_one(
                    {"id": campaign_id},
                    {"$set": {
                        "status": "sent",
                        "sent_count": total_sent,
                        "sent_to_users": updated_recipients,
                        "last_sent_at": datetime.now(timezone.utc).isoformat()
                    }}
                )
                
                remaining = len(all_users) - total_sent
                
                return {
                    "message": f"تم إرسال الحملة إلى {len(phone_numbers)} مراجع جديد",
                    "total_sent_in_campaign": total_sent,
                    "remaining_users": remaining,
                    "can_send_more": remaining > 0
                }
            else:
                print(f"❌ Failed to send campaign: {response.text}")
                raise HTTPException(status_code=500, detail="فشل إرسال الحملة")
                
    except Exception as e:
        print(f"Error sending campaign: {e}")
        raise HTTPException(status_code=500, detail=f"خطأ في إرسال الحملة: {str(e)}")
    
    # Also save to database notifications (backup)
    users = await db.users.find({"role": "patient"}, {"_id": 0}).to_list(10000)
    for user in users:
        await send_notification(
            user['id'],
            campaign['title'],
            campaign['message'],
            "campaign"
        )
    
    return {"message": f"تم إرسال الحملة بنجاح"}

# Notification Routes
@api_router.get("/notifications", response_model=List[Notification])
async def get_notifications(user_id: str):
    notifications = await db.notifications.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    for notif in notifications:
        if isinstance(notif['created_at'], str):
            notif['created_at'] = datetime.fromisoformat(notif['created_at'])
    return notifications

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str):
    await db.notifications.update_one({"id": notification_id}, {"$set": {"read": True}})
    return {"message": "Notification marked as read"}

# Review Routes
@api_router.post("/reviews", response_model=Review)
async def create_review(review: ReviewCreate):
    review_obj = Review(**review.model_dump())
    doc = review_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.reviews.insert_one(doc)
    return review_obj

@api_router.get("/reviews", response_model=List[Review])
async def get_reviews(appointment_id: Optional[str] = None):
    query = {}
    if appointment_id:
        query["appointment_id"] = appointment_id
    reviews = await db.reviews.find(query, {"_id": 0}).to_list(1000)
    for review in reviews:
        if isinstance(review['created_at'], str):
            review['created_at'] = datetime.fromisoformat(review['created_at'])
    return reviews

# Stats Routes
@api_router.get("/stats", response_model=Stats)
async def get_stats():
    total_appointments = await db.appointments.count_documents({})
    pending = await db.appointments.count_documents({"status": "pending"})
    confirmed = await db.appointments.count_documents({"status": "confirmed"})
    completed = await db.appointments.count_documents({"status": "completed"})
    cancelled = await db.appointments.count_documents({"status": "cancelled"})
    total_patients = await db.users.count_documents({"role": "patient"})
    total_doctors = await db.doctors.count_documents({})
    
    # Calculate average rating
    reviews = await db.reviews.find({}, {"_id": 0, "rating": 1}).to_list(10000)
    avg_rating = sum(r['rating'] for r in reviews) / len(reviews) if reviews else 0
    
    return Stats(
        total_appointments=total_appointments,
        pending_appointments=pending,
        confirmed_appointments=confirmed,
        completed_appointments=completed,
        cancelled_appointments=cancelled,
        total_patients=total_patients,
        total_doctors=total_doctors,
        avg_rating=round(avg_rating, 2)
    )

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    scheduler.shutdown()
    client.close()

@app.on_event("startup")
async def startup_scheduler():
    """Start the automatic reminder scheduler"""
    # Run reminder check every 30 minutes
    scheduler.add_job(
        send_automatic_reminders,
        'interval',
        minutes=30,
        id='reminder_checker',
        replace_existing=True
    )
    scheduler.start()
    print("✅ Automatic reminder scheduler started (checks every 30 minutes)")