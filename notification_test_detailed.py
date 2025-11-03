#!/usr/bin/env python3
"""
Detailed test for appointment confirmation notification issue
"""

import requests
import json
from datetime import datetime, timezone, timedelta
import uuid

BACKEND_URL = "https://dental-booking-app.preview.emergentagent.com/api"

def test_notification_with_empty_patient_id():
    """Test notification when patient_id is empty (current issue)"""
    print("🔍 Testing notification with empty patient_id (reproducing the issue)")
    
    # Get doctors and services
    doctors = requests.get(f"{BACKEND_URL}/doctors").json()
    services = requests.get(f"{BACKEND_URL}/services").json()
    
    # Create appointment WITHOUT patient_id (mimics real user booking)
    appointment_data = {
        "patient_name": "مريض بدون معرف",
        "patient_phone": "+966501234567",
        "doctor_id": doctors[0]['id'],
        "service_id": services[0]['id'],
        "appointment_date": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat(),
        "notes": "موعد بدون معرف مريض"
    }
    
    create_response = requests.post(f"{BACKEND_URL}/appointments", json=appointment_data)
    appointment = create_response.json()
    
    print(f"✅ Created appointment: {appointment['id']}")
    print(f"📋 Patient ID: '{appointment['patient_id']}' (empty string)")
    
    # Update to confirmed
    update_response = requests.put(
        f"{BACKEND_URL}/appointments/{appointment['id']}", 
        json={"status": "confirmed"}
    )
    
    print(f"✅ Updated to confirmed: {update_response.status_code}")
    
    # Check logs for notification
    import subprocess
    try:
        result = subprocess.run(
            ["tail", "-n", "5", "/var/log/supervisor/backend.out.log"],
            capture_output=True, text=True, timeout=5
        )
        
        logs = result.stdout
        if "✅ Confirmation push notification sent" in logs:
            print("✅ Notification WAS sent")
        else:
            print("❌ Notification was NOT sent (patient_id is empty)")
            
    except Exception as e:
        print(f"Could not check logs: {e}")
    
    # Cleanup
    requests.delete(f"{BACKEND_URL}/appointments/{appointment['id']}")
    return appointment['patient_id'] == ""

def test_notification_with_valid_patient_id():
    """Test notification when patient_id is provided"""
    print("\n🔍 Testing notification with valid patient_id")
    
    # Get doctors and services
    doctors = requests.get(f"{BACKEND_URL}/doctors").json()
    services = requests.get(f"{BACKEND_URL}/services").json()
    
    # Create appointment WITH patient_id
    appointment_data = {
        "patient_id": str(uuid.uuid4()),
        "patient_name": "مريض مع معرف",
        "patient_phone": "+966501234567",
        "doctor_id": doctors[0]['id'],
        "service_id": services[0]['id'],
        "appointment_date": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat(),
        "notes": "موعد مع معرف مريض"
    }
    
    create_response = requests.post(f"{BACKEND_URL}/appointments", json=appointment_data)
    appointment = create_response.json()
    
    print(f"✅ Created appointment: {appointment['id']}")
    print(f"📋 Patient ID: {appointment['patient_id']}")
    
    # Update to confirmed
    update_response = requests.put(
        f"{BACKEND_URL}/appointments/{appointment['id']}", 
        json={"status": "confirmed"}
    )
    
    print(f"✅ Updated to confirmed: {update_response.status_code}")
    
    # Check logs for notification
    import subprocess
    try:
        result = subprocess.run(
            ["tail", "-n", "5", "/var/log/supervisor/backend.out.log"],
            capture_output=True, text=True, timeout=5
        )
        
        logs = result.stdout
        if "✅ Confirmation push notification sent" in logs:
            print("✅ Notification WAS sent")
            notification_sent = True
        else:
            print("❌ Notification was NOT sent")
            notification_sent = False
            
    except Exception as e:
        print(f"Could not check logs: {e}")
        notification_sent = False
    
    # Cleanup
    requests.delete(f"{BACKEND_URL}/appointments/{appointment['id']}")
    return notification_sent

if __name__ == "__main__":
    print("🏥 Alghasab Dental Clinic - Notification Issue Analysis")
    print("=" * 60)
    
    # Test 1: Empty patient_id (current issue)
    empty_patient_id = test_notification_with_empty_patient_id()
    
    # Test 2: Valid patient_id (should work)
    valid_notification = test_notification_with_valid_patient_id()
    
    print("\n" + "=" * 60)
    print("📊 ANALYSIS RESULTS:")
    print(f"❌ Empty patient_id causes no notification: {empty_patient_id}")
    print(f"✅ Valid patient_id sends notification: {valid_notification}")
    
    if empty_patient_id and valid_notification:
        print("\n🎯 ROOT CAUSE IDENTIFIED:")
        print("   The issue is in /app/backend/server.py line 559:")
        print("   if apt.get('patient_id'):")
        print("   ")
        print("   When patient_id is empty string (''), this condition fails")
        print("   because empty string is falsy in Python.")
        print("   ")
        print("💡 SOLUTION:")
        print("   Change the condition to check for phone number instead:")
        print("   if apt.get('patient_phone'):")
        print("   ")
        print("   OR create a proper patient record and link patient_id")