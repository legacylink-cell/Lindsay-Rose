#!/usr/bin/env python3
"""
Backend API Test Suite for Bright at Home Cleaning
Tests all endpoints after email forwarding config change.
"""
import requests
import json
import os
import time
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / 'frontend' / '.env')
load_dotenv(ROOT_DIR / 'backend' / '.env')

# Configuration
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_BASE = f"{BASE_URL}/api"
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'brightadmin')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'Brighth4Dyvnjh')

# Test results tracking
test_results = []
admin_token = None
test_ids_to_cleanup = {"quotes": [], "applications": []}


def log_test(test_name, passed, details=""):
    """Log test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    result = f"{status} - {test_name}"
    if details:
        result += f"\n    Details: {details}"
    test_results.append((passed, result))
    print(result)


def test_1_valid_quote_submission():
    """Test 1: POST /api/quotes with valid data (check response time)"""
    print("\n=== Test 1: Valid Quote Submission (Response Time Check) ===")
    payload = {
        "name": "QA Test",
        "email": "qa@example.com",
        "phone": "469-111-2222",
        "city": "Denton",
        "service": "One-time cleaning",
        "details": "test"
    }
    
    try:
        start_time = time.time()
        response = requests.post(f"{API_BASE}/quotes", json=payload, timeout=15)
        elapsed = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and "id" in data:
                quote_id = data.get("id")
                test_ids_to_cleanup["quotes"].append(quote_id)
                
                # Check response time (should be well under 15s, email is background)
                if elapsed < 5.0:
                    log_test("Valid quote submission + response time", True, 
                            f"Status: {response.status_code}, Response time: {elapsed:.2f}s (fast, email not blocking ✓), ID: {quote_id}")
                else:
                    log_test("Valid quote submission + response time", False, 
                            f"Response time too slow: {elapsed:.2f}s (email may be blocking)")
                return quote_id
            else:
                log_test("Valid quote submission", False, f"Missing 'success' or 'id' in response: {data}")
                return None
        else:
            log_test("Valid quote submission", False, f"Expected 200, got {response.status_code}: {response.text}")
            return None
    except Exception as e:
        log_test("Valid quote submission", False, f"Exception: {str(e)}")
        return None


def test_2_valid_application_submission():
    """Test 2: POST /api/applications with valid data"""
    print("\n=== Test 2: Valid Application Submission ===")
    payload = {
        "name": "Jane Applicant",
        "email": "jane.applicant@example.com",
        "phone": "214-555-1234",
        "position": "Cleaning Specialist",
        "message": "Experienced professional seeking opportunity"
    }
    
    try:
        start_time = time.time()
        response = requests.post(f"{API_BASE}/applications", json=payload, timeout=15)
        elapsed = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and "id" in data:
                app_id = data.get("id")
                test_ids_to_cleanup["applications"].append(app_id)
                log_test("Valid application submission", True, 
                        f"Status: {response.status_code}, Response time: {elapsed:.2f}s, ID: {app_id}")
                return app_id
            else:
                log_test("Valid application submission", False, f"Missing 'success' or 'id' in response: {data}")
                return None
        else:
            log_test("Valid application submission", False, f"Expected 200, got {response.status_code}: {response.text}")
            return None
    except Exception as e:
        log_test("Valid application submission", False, f"Exception: {str(e)}")
        return None


def test_3_invalid_email_validation():
    """Test 3: POST /api/quotes with invalid email"""
    print("\n=== Test 3: Invalid Email Validation ===")
    payload = {
        "name": "QA Test",
        "email": "not-an-email",
        "phone": "469-111-2222",
        "city": "Denton",
        "service": "One-time cleaning",
        "details": "test"
    }
    
    try:
        response = requests.post(f"{API_BASE}/quotes", json=payload, timeout=10)
        
        if response.status_code == 422:
            log_test("Invalid email validation", True, f"Status: {response.status_code} (validation error as expected)")
            return True
        else:
            log_test("Invalid email validation", False, f"Expected 422, got {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("Invalid email validation", False, f"Exception: {str(e)}")
        return False


def test_4_honeypot_quote():
    """Test 4: POST /api/quotes with honeypot filled (should return 200 but NOT store)"""
    print("\n=== Test 4: Honeypot Quote Submission ===")
    
    payload = {
        "name": "QA Test",
        "email": "qa@example.com",
        "phone": "469-111-2222",
        "city": "Denton",
        "service": "One-time cleaning",
        "details": "test",
        "company": "bot"  # Honeypot field filled
    }
    
    try:
        response = requests.post(f"{API_BASE}/quotes", json=payload, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                log_test("Honeypot quote submission (returns 200)", True, 
                        f"Status: {response.status_code}, Response: {data}. Will verify it's NOT stored in admin list.")
                return True
            else:
                log_test("Honeypot quote submission", False, f"Expected success:true, got: {data}")
                return False
        else:
            log_test("Honeypot quote submission", False, f"Expected 200, got {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("Honeypot quote submission", False, f"Exception: {str(e)}")
        return False


def test_5_admin_login_wrong_credentials():
    """Test 5: POST /api/admin/login with wrong credentials"""
    print("\n=== Test 5: Admin Login - Wrong Credentials ===")
    payload = {
        "username": "wronguser",
        "password": "wrongpass"
    }
    
    try:
        response = requests.post(f"{API_BASE}/admin/login", json=payload, timeout=10)
        
        if response.status_code == 401:
            log_test("Admin login with wrong credentials", True, f"Status: {response.status_code} (unauthorized as expected)")
            return True
        else:
            log_test("Admin login with wrong credentials", False, f"Expected 401, got {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("Admin login with wrong credentials", False, f"Exception: {str(e)}")
        return False


def test_6_admin_login_correct_credentials():
    """Test 6: POST /api/admin/login with correct credentials"""
    print("\n=== Test 6: Admin Login - Correct Credentials ===")
    global admin_token
    
    payload = {
        "username": ADMIN_USERNAME,
        "password": ADMIN_PASSWORD
    }
    
    try:
        response = requests.post(f"{API_BASE}/admin/login", json=payload, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "token" in data:
                admin_token = data["token"]
                log_test("Admin login with correct credentials", True, f"Status: {response.status_code}, Token received")
                return admin_token
            else:
                log_test("Admin login with correct credentials", False, f"Missing 'token' in response: {data}")
                return None
        else:
            log_test("Admin login with correct credentials", False, f"Expected 200, got {response.status_code}: {response.text}")
            return None
    except Exception as e:
        log_test("Admin login with correct credentials", False, f"Exception: {str(e)}")
        return None


def test_7_admin_endpoints_without_token():
    """Test 7: GET /api/admin/quotes and /api/admin/applications without token"""
    print("\n=== Test 7: Admin Endpoints Without Token ===")
    
    all_passed = True
    
    # Test quotes endpoint
    try:
        response = requests.get(f"{API_BASE}/admin/quotes", timeout=10)
        if response.status_code == 401 or response.status_code == 403:
            log_test("Admin quotes without token", True, f"Status: {response.status_code} (unauthorized as expected)")
        else:
            log_test("Admin quotes without token", False, f"Expected 401/403, got {response.status_code}")
            all_passed = False
    except Exception as e:
        log_test("Admin quotes without token", False, f"Exception: {str(e)}")
        all_passed = False
    
    # Test applications endpoint
    try:
        response = requests.get(f"{API_BASE}/admin/applications", timeout=10)
        if response.status_code == 401 or response.status_code == 403:
            log_test("Admin applications without token", True, f"Status: {response.status_code} (unauthorized as expected)")
        else:
            log_test("Admin applications without token", False, f"Expected 401/403, got {response.status_code}")
            all_passed = False
    except Exception as e:
        log_test("Admin applications without token", False, f"Exception: {str(e)}")
        all_passed = False
    
    return all_passed


def test_8_admin_quotes_with_token(quote_id):
    """Test 8: GET /api/admin/quotes with valid token"""
    print("\n=== Test 8: Admin Quotes Endpoint With Valid Token ===")
    
    if not admin_token:
        log_test("Admin quotes with token", False, "No admin token available")
        return False
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    try:
        response = requests.get(f"{API_BASE}/admin/quotes", headers=headers, timeout=10)
        if response.status_code == 200:
            quotes = response.json()
            if isinstance(quotes, list):
                # Check if our test quote is in the list
                found_quote = any(q.get("id") == quote_id for q in quotes) if quote_id else False
                # Check that honeypot submission is NOT in the list (email: qa@example.com with company field)
                # Since honeypot uses same email, we check by counting - should only be 1 qa@example.com
                qa_quotes = [q for q in quotes if q.get("email") == "qa@example.com"]
                
                if found_quote and len(qa_quotes) == 1:
                    log_test("Admin quotes with token", True, 
                            f"Status: {response.status_code}, Found test quote (id: {quote_id}), Honeypot NOT stored ✓ (only 1 qa@example.com quote)")
                    return True
                elif not found_quote:
                    log_test("Admin quotes with token", False, 
                            f"Test quote (id: {quote_id}) not found in list. Total quotes: {len(quotes)}")
                    return False
                elif len(qa_quotes) > 1:
                    log_test("Admin quotes with token", False, 
                            f"CRITICAL: Found {len(qa_quotes)} quotes with qa@example.com (honeypot may have been stored)")
                    return False
            else:
                log_test("Admin quotes with token", False, f"Expected list, got: {type(quotes)}")
                return False
        else:
            log_test("Admin quotes with token", False, f"Expected 200, got {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("Admin quotes with token", False, f"Exception: {str(e)}")
        return False


def test_9_admin_applications_with_token(app_id):
    """Test 9: GET /api/admin/applications with valid token"""
    print("\n=== Test 9: Admin Applications Endpoint With Valid Token ===")
    
    if not admin_token:
        log_test("Admin applications with token", False, "No admin token available")
        return False
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    try:
        response = requests.get(f"{API_BASE}/admin/applications", headers=headers, timeout=10)
        if response.status_code == 200:
            applications = response.json()
            if isinstance(applications, list):
                # Check if our test application is in the list
                found_app = any(a.get("id") == app_id for a in applications) if app_id else False
                
                if found_app:
                    log_test("Admin applications with token", True, 
                            f"Status: {response.status_code}, Found test application (id: {app_id})")
                    return True
                else:
                    log_test("Admin applications with token", False, 
                            f"Test application (id: {app_id}) not found in list. Total applications: {len(applications)}")
                    return False
            else:
                log_test("Admin applications with token", False, f"Expected list, got: {type(applications)}")
                return False
        else:
            log_test("Admin applications with token", False, f"Expected 200, got {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("Admin applications with token", False, f"Exception: {str(e)}")
        return False


def test_10_admin_summary():
    """Test 10: GET /api/admin/summary with token"""
    print("\n=== Test 10: Admin Summary ===")
    
    if not admin_token:
        log_test("Admin summary", False, "No admin token available")
        return False
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    try:
        response = requests.get(f"{API_BASE}/admin/summary", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "quotes" in data and "applications" in data:
                if isinstance(data["quotes"], int) and isinstance(data["applications"], int):
                    log_test("Admin summary", True, 
                            f"Status: {response.status_code}, Quotes: {data['quotes']}, Applications: {data['applications']}")
                    return True
                else:
                    log_test("Admin summary", False, f"Counts are not integers: {data}")
                    return False
            else:
                log_test("Admin summary", False, f"Missing 'quotes' or 'applications' in response: {data}")
                return False
        else:
            log_test("Admin summary", False, f"Expected 200, got {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("Admin summary", False, f"Exception: {str(e)}")
        return False


def cleanup_test_data():
    """Clean up test submissions from database"""
    print("\n=== Cleanup: Deleting Test Submissions ===")
    
    if not admin_token:
        print("⚠️  Cannot cleanup: No admin token available")
        print(f"⚠️  Test data remains in database:")
        print(f"    Quotes: {test_ids_to_cleanup['quotes']}")
        print(f"    Applications: {test_ids_to_cleanup['applications']}")
        return False
    
    # Note: The API doesn't have delete endpoints, so we'll report what needs manual cleanup
    print(f"⚠️  API does not provide DELETE endpoints for cleanup.")
    print(f"⚠️  The following test records were created and remain in the database:")
    print(f"    Quote IDs: {test_ids_to_cleanup['quotes']}")
    print(f"    Application IDs: {test_ids_to_cleanup['applications']}")
    print(f"\n    To clean up manually, connect to MongoDB and delete these records:")
    print(f"    db.quotes.deleteMany({{id: {{$in: {test_ids_to_cleanup['quotes']}}}}});")
    print(f"    db.applications.deleteMany({{id: {{$in: {test_ids_to_cleanup['applications']}}}}});")
    
    return False


def main():
    """Run all backend tests"""
    print("=" * 80)
    print("BRIGHT AT HOME CLEANING - BACKEND API RE-TEST")
    print("After Email Forwarding Config Change")
    print("=" * 80)
    print(f"Base URL: {BASE_URL}")
    print(f"API Base: {API_BASE}")
    print(f"Admin Username: {ADMIN_USERNAME}")
    print(f"Email Config: Primary={os.environ.get('FORWARD_EMAIL')}, CC={os.environ.get('FORWARD_CC')}")
    print("=" * 80)
    
    # Run tests in sequence matching review request order
    quote_id = test_1_valid_quote_submission()  # Test 1
    app_id = test_2_valid_application_submission()  # Test 2
    test_3_invalid_email_validation()  # Test 3
    test_4_honeypot_quote()  # Test 4
    test_5_admin_login_wrong_credentials()  # Test 5a
    test_6_admin_login_correct_credentials()  # Test 5b
    test_7_admin_endpoints_without_token()  # Test 6a
    test_8_admin_quotes_with_token(quote_id)  # Test 6b
    test_9_admin_applications_with_token(app_id)  # Test 6c
    test_10_admin_summary()  # Test 7
    
    # Summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    
    passed = sum(1 for p, _ in test_results if p)
    total = len(test_results)
    
    for _, result in test_results:
        print(result)
    
    print("=" * 80)
    print(f"TOTAL: {passed}/{total} tests passed")
    
    if passed == total:
        print("✅ ALL TESTS PASSED - Email forwarding config change did NOT break anything")
    else:
        print(f"❌ {total - passed} TEST(S) FAILED")
    
    # Cleanup
    cleanup_test_data()
    
    return 0 if passed == total else 1


if __name__ == "__main__":
    exit(main())
