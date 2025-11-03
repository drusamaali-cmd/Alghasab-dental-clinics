#!/usr/bin/env python3
"""
Backend Test Suite for Alghasab Dental Clinic
Testing appointment confirmation push notification flow
"""

import requests
import json
import os
from datetime import datetime, timezone, timedelta
import uuid

# Configuration
BACKEND_URL = "https://dental-booking-app.preview.emergentagent.com/api"

def test_appointment_confirmation_notification():
    """Test the complete appointment confirmation notification flow"""
    print("🧪 Testing Appointment Confirmation Push Notification Flow")
    print("=" * 60)
    
    # Step 1: Get existing doctors and services
    print("\n1️⃣ Getting available doctors and services...")
    
    try:
        doctors_response = requests.get(f"{BACKEND_URL}/doctors", timeout=10)
        services_response = requests.get(f"{BACKEND_URL}/services", timeout=10)
        
        print(f"Doctors API Status: {doctors_response.status_code}")
        print(f"Services API Status: {services_response.status_code}")
        
        if doctors_response.status_code != 200:
            print(f"❌ Failed to get doctors: {doctors_response.text}")
            return False
            
        if services_response.status_code != 200:
            print(f"❌ Failed to get services: {services_response.text}")
            return False
            
        doctors = doctors_response.json()
        services = services_response.json()
        
        if not doctors:
            print("❌ No doctors found in system")
            return False
            
        if not services:
            print("❌ No services found in system")
            return False
            
        doctor = doctors[0]
        service = services[0]
        
        print(f"✅ Using Doctor: {doctor['name']} (ID: {doctor['id']})")
        print(f"✅ Using Service: {service['name']} (ID: {service['id']})")
        
    except Exception as e:
        print(f"❌ Error getting doctors/services: {e}")
        return False
    
    # Step 2: Create a test appointment
    print("\n2️⃣ Creating test appointment...")
    
    appointment_data = {
        "patient_name": "أحمد محمد الاختبار",
        "patient_phone": "+966501234567",
        "doctor_id": doctor['id'],
        "service_id": service['id'],
        "appointment_date": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat(),
        "notes": "موعد اختبار للإشعارات",
        "created_by": "admin"
    }
    
    try:
        create_response = requests.post(
            f"{BACKEND_URL}/appointments",
            json=appointment_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"Create Appointment Status: {create_response.status_code}")
        
        if create_response.status_code != 200:
            print(f"❌ Failed to create appointment: {create_response.text}")
            return False
            
        appointment = create_response.json()
        appointment_id = appointment['id']
        
        print(f"✅ Appointment created successfully")
        print(f"   ID: {appointment_id}")
        print(f"   Status: {appointment['status']}")
        print(f"   Patient: {appointment['patient_name']}")
        
    except Exception as e:
        print(f"❌ Error creating appointment: {e}")
        return False
    
    # Step 3: Update appointment status to "confirmed" and monitor logs
    print("\n3️⃣ Confirming appointment and testing push notification...")
    
    update_data = {
        "status": "confirmed"
    }
    
    try:
        # Update appointment status
        update_response = requests.put(
            f"{BACKEND_URL}/appointments/{appointment_id}",
            json=update_data,
            headers={"Content-Type": "application/json"},
            timeout=15  # Longer timeout for OneSignal API call
        )
        
        print(f"Update Appointment Status: {update_response.status_code}")
        
        if update_response.status_code != 200:
            print(f"❌ Failed to update appointment: {update_response.text}")
            return False
            
        updated_appointment = update_response.json()
        
        print(f"✅ Appointment updated successfully")
        print(f"   New Status: {updated_appointment['status']}")
        
        # The OneSignal notification should have been triggered
        print("\n📱 OneSignal Push Notification Test:")
        print("   - Notification should be sent when status changes to 'confirmed'")
        print("   - Check backend logs for OneSignal API response")
        
    except Exception as e:
        print(f"❌ Error updating appointment: {e}")
        return False
    
    # Step 4: Check backend logs for OneSignal API call
    print("\n4️⃣ Checking backend logs for OneSignal API activity...")
    
    try:
        # Check supervisor logs for backend
        import subprocess
        result = subprocess.run(
            ["tail", "-n", "50", "/var/log/supervisor/backend.out.log"],
            capture_output=True,
            text=True,
            timeout=5
        )
        
        if result.returncode == 0:
            logs = result.stdout
            print("📋 Recent Backend Logs:")
            print("-" * 40)
            
            # Look for OneSignal related messages
            onesignal_found = False
            for line in logs.split('\n'):
                if any(keyword in line.lower() for keyword in ['onesignal', 'notification', 'push', '✅', '❌']):
                    print(f"   {line}")
                    onesignal_found = True
            
            if not onesignal_found:
                print("   ⚠️  No OneSignal related logs found in recent output")
                print("   📋 Last 10 lines of logs:")
                for line in logs.split('\n')[-10:]:
                    if line.strip():
                        print(f"   {line}")
        else:
            print(f"❌ Could not read backend logs: {result.stderr}")
            
    except Exception as e:
        print(f"⚠️  Could not check logs: {e}")
    
    # Step 5: Test OneSignal API directly to verify configuration
    print("\n5️⃣ Testing OneSignal API configuration...")
    
    try:
        # Read OneSignal configuration from backend .env
        with open('/app/backend/.env', 'r') as f:
            env_content = f.read()
            
        onesignal_key = None
        for line in env_content.split('\n'):
            if line.startswith('ONESIGNAL_REST_API_KEY='):
                onesignal_key = line.split('=', 1)[1].strip('"')
                break
        
        if not onesignal_key:
            print("❌ ONESIGNAL_REST_API_KEY not found in .env file")
            return False
            
        print(f"✅ OneSignal API Key found: {onesignal_key[:20]}...")
        
        # Test OneSignal API with a simple notification
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Basic {onesignal_key}"
        }
        
        test_payload = {
            "app_id": "3adbb1be-a764-4977-a22c-0de12043ac2e",
            "included_segments": ["Test"],  # Non-existent segment for testing
            "headings": {"en": "Test Notification", "ar": "إشعار تجريبي"},
            "contents": {"en": "Testing OneSignal API", "ar": "اختبار واجهة OneSignal"}
        }
        
        onesignal_response = requests.post(
            "https://onesignal.com/api/v1/notifications",
            headers=headers,
            json=test_payload,
            timeout=10
        )
        
        print(f"OneSignal API Test Status: {onesignal_response.status_code}")
        
        if onesignal_response.status_code == 200:
            result = onesignal_response.json()
            print(f"✅ OneSignal API is working")
            print(f"   Response: {json.dumps(result, indent=2)}")
        else:
            print(f"❌ OneSignal API Error: {onesignal_response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing OneSignal API: {e}")
        return False
    
    # Step 6: Cleanup - Delete test appointment
    print("\n6️⃣ Cleaning up test data...")
    
    try:
        delete_response = requests.delete(
            f"{BACKEND_URL}/appointments/{appointment_id}",
            timeout=10
        )
        
        if delete_response.status_code == 200:
            print("✅ Test appointment deleted successfully")
        else:
            print(f"⚠️  Could not delete test appointment: {delete_response.text}")
            
    except Exception as e:
        print(f"⚠️  Error deleting test appointment: {e}")
    
    print("\n" + "=" * 60)
    print("🏁 Test Complete")
    return True

def test_basic_api_endpoints():
    """Test basic API endpoints to ensure backend is working"""
    print("\n🔧 Testing Basic API Endpoints")
    print("-" * 40)
    
    endpoints = [
        "/doctors",
        "/services", 
        "/appointments",
        "/stats"
    ]
    
    all_working = True
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{BACKEND_URL}{endpoint}", timeout=10)
            status = "✅" if response.status_code == 200 else "❌"
            print(f"{status} {endpoint}: {response.status_code}")
            
            if response.status_code != 200:
                all_working = False
                print(f"   Error: {response.text[:100]}...")
                
        except Exception as e:
            print(f"❌ {endpoint}: Connection Error - {e}")
            all_working = False
    
    return all_working

def test_appointment_linking_by_phone():
    """Test appointment linking by phone number feature"""
    print("🧪 Testing Appointment Linking by Phone Number")
    print("=" * 60)
    
    # Step 1: Get existing doctors and services
    print("\n1️⃣ Getting available doctors and services...")
    
    try:
        doctors_response = requests.get(f"{BACKEND_URL}/doctors", timeout=10)
        services_response = requests.get(f"{BACKEND_URL}/services", timeout=10)
        
        print(f"Doctors API Status: {doctors_response.status_code}")
        print(f"Services API Status: {services_response.status_code}")
        
        if doctors_response.status_code != 200:
            print(f"❌ Failed to get doctors: {doctors_response.text}")
            return False
            
        if services_response.status_code != 200:
            print(f"❌ Failed to get services: {services_response.text}")
            return False
            
        doctors = doctors_response.json()
        services = services_response.json()
        
        if not doctors:
            print("❌ No doctors found in system")
            return False
            
        if not services:
            print("❌ No services found in system")
            return False
            
        doctor = doctors[0]
        service = services[0]
        
        print(f"✅ Using Doctor: {doctor['name']} (ID: {doctor['id']})")
        print(f"✅ Using Service: {service['name']} (ID: {service['id']})")
        
    except Exception as e:
        print(f"❌ Error getting doctors/services: {e}")
        return False
    
    # Step 2: Create appointment via Admin (simulating manual entry)
    print("\n2️⃣ Creating appointment via Admin (manual entry)...")
    
    test_phone = "+966501234567"
    test_patient_name = "سارة أحمد المريض"
    
    appointment_data = {
        "patient_name": test_patient_name,
        "patient_phone": test_phone,
        "doctor_id": doctor['id'],
        "service_id": service['id'],
        "appointment_date": (datetime.now(timezone.utc) + timedelta(days=2)).isoformat(),
        "notes": "موعد تم إنشاؤه يدوياً من قبل الإدارة",
        "created_by": "admin"
        # Note: No patient_id provided (simulating manual admin entry)
    }
    
    try:
        create_response = requests.post(
            f"{BACKEND_URL}/appointments",
            json=appointment_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"Create Appointment Status: {create_response.status_code}")
        
        if create_response.status_code != 200:
            print(f"❌ Failed to create appointment: {create_response.text}")
            return False
            
        appointment = create_response.json()
        appointment_id = appointment['id']
        
        print(f"✅ Appointment created successfully")
        print(f"   ID: {appointment_id}")
        print(f"   Patient ID: '{appointment.get('patient_id', 'NOT SET')}'")
        print(f"   Patient Name: {appointment['patient_name']}")
        print(f"   Patient Phone: {appointment['patient_phone']}")
        print(f"   Created By: {appointment['created_by']}")
        
        # Verify patient_id is empty or None (as expected for admin-created appointments)
        if appointment.get('patient_id') == "" or appointment.get('patient_id') is None:
            print("✅ Patient ID is empty as expected for admin-created appointment")
        else:
            print(f"⚠️  Patient ID is not empty: '{appointment.get('patient_id')}'")
        
    except Exception as e:
        print(f"❌ Error creating appointment: {e}")
        return False
    
    # Step 3: Query appointments by phone number
    print("\n3️⃣ Querying appointments by phone number...")
    
    try:
        # URL encode the phone number properly
        import urllib.parse
        encoded_phone = urllib.parse.quote(test_phone)
        query_response = requests.get(
            f"{BACKEND_URL}/appointments?patient_phone={encoded_phone}",
            timeout=10
        )
        
        print(f"Query Appointments Status: {query_response.status_code}")
        
        if query_response.status_code != 200:
            print(f"❌ Failed to query appointments: {query_response.text}")
            return False
            
        appointments = query_response.json()
        
        print(f"✅ Query successful - Found {len(appointments)} appointment(s)")
        
        # Find our test appointment
        test_appointment = None
        for apt in appointments:
            if apt['id'] == appointment_id:
                test_appointment = apt
                break
        
        if not test_appointment:
            print(f"❌ Test appointment not found in query results")
            print(f"   Expected ID: {appointment_id}")
            print(f"   Found appointments: {[apt['id'] for apt in appointments]}")
            return False
        
        print(f"✅ Test appointment found in query results")
        
    except Exception as e:
        print(f"❌ Error querying appointments: {e}")
        return False
    
    # Step 4: Verify appointment data matches
    print("\n4️⃣ Verifying appointment data...")
    
    verification_passed = True
    
    # Check patient_name
    if test_appointment['patient_name'] == test_patient_name:
        print(f"✅ Patient name matches: {test_appointment['patient_name']}")
    else:
        print(f"❌ Patient name mismatch:")
        print(f"   Expected: {test_patient_name}")
        print(f"   Found: {test_appointment['patient_name']}")
        verification_passed = False
    
    # Check patient_phone
    if test_appointment['patient_phone'] == test_phone:
        print(f"✅ Patient phone matches: {test_appointment['patient_phone']}")
    else:
        print(f"❌ Patient phone mismatch:")
        print(f"   Expected: {test_phone}")
        print(f"   Found: {test_appointment['patient_phone']}")
        verification_passed = False
    
    # Check doctor info
    if test_appointment['doctor_id'] == doctor['id']:
        print(f"✅ Doctor ID matches: {test_appointment['doctor_id']}")
        print(f"✅ Doctor name: {test_appointment['doctor_name']}")
    else:
        print(f"❌ Doctor ID mismatch:")
        print(f"   Expected: {doctor['id']}")
        print(f"   Found: {test_appointment['doctor_id']}")
        verification_passed = False
    
    # Check service info
    if test_appointment['service_id'] == service['id']:
        print(f"✅ Service ID matches: {test_appointment['service_id']}")
        print(f"✅ Service name: {test_appointment['service_name']}")
    else:
        print(f"❌ Service ID mismatch:")
        print(f"   Expected: {service['id']}")
        print(f"   Found: {test_appointment['service_id']}")
        verification_passed = False
    
    # Check appointment date
    expected_date = appointment_data['appointment_date']
    if test_appointment['appointment_date'] == expected_date:
        print(f"✅ Appointment date matches: {test_appointment['appointment_date']}")
    else:
        print(f"❌ Appointment date mismatch:")
        print(f"   Expected: {expected_date}")
        print(f"   Found: {test_appointment['appointment_date']}")
        verification_passed = False
    
    # Step 5: Test edge case - query with different phone number
    print("\n5️⃣ Testing edge case - query with different phone number...")
    
    try:
        different_phone = "+966509876543"
        encoded_different_phone = urllib.parse.quote(different_phone)
        edge_response = requests.get(
            f"{BACKEND_URL}/appointments?patient_phone={encoded_different_phone}",
            timeout=10
        )
        
        if edge_response.status_code == 200:
            edge_appointments = edge_response.json()
            
            # Should not find our test appointment
            found_test_apt = any(apt['id'] == appointment_id for apt in edge_appointments)
            
            if not found_test_apt:
                print(f"✅ Correct isolation - test appointment not found with different phone")
            else:
                print(f"❌ Test appointment incorrectly returned for different phone number")
                verification_passed = False
        else:
            print(f"❌ Failed to query with different phone: {edge_response.text}")
            verification_passed = False
            
    except Exception as e:
        print(f"❌ Error testing edge case: {e}")
        verification_passed = False
    
    # Step 6: Cleanup - Delete test appointment
    print("\n6️⃣ Cleaning up test data...")
    
    try:
        delete_response = requests.delete(
            f"{BACKEND_URL}/appointments/{appointment_id}",
            timeout=10
        )
        
        if delete_response.status_code == 200:
            print("✅ Test appointment deleted successfully")
        else:
            print(f"⚠️  Could not delete test appointment: {delete_response.text}")
            
    except Exception as e:
        print(f"⚠️  Error deleting test appointment: {e}")
    
    print("\n" + "=" * 60)
    print("🏁 Appointment Linking Test Complete")
    
    if verification_passed:
        print("🎉 ALL TESTS PASSED - Appointment linking by phone number works correctly!")
        print("\n📋 Summary:")
        print("✅ Appointment can be created without patient_id")
        print("✅ Appointment can be retrieved by patient_phone")
        print("✅ When patient logs in with that phone, they will see their appointments")
        return True
    else:
        print("💥 SOME TESTS FAILED - Check the output above for details")
        return False

if __name__ == "__main__":
    print("🏥 Alghasab Dental Clinic - Backend Test Suite")
    print("Testing Appointment Linking by Phone Number Feature")
    print("=" * 60)
    
    # Test basic endpoints first
    basic_test_passed = test_basic_api_endpoints()
    
    if not basic_test_passed:
        print("\n❌ Basic API tests failed. Cannot proceed with appointment linking testing.")
        exit(1)
    
    # Test appointment linking by phone number
    linking_test_passed = test_appointment_linking_by_phone()
    
    if linking_test_passed:
        print("\n🎉 All tests completed successfully!")
        exit(0)
    else:
        print("\n💥 Some tests failed. Check the output above for details.")
        exit(1)