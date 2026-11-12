import pytest
import io
import sys
import os
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from PIL import Image
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.db.session import Base, get_db
from backend.app.main import app
from backend.app.core.config import settings

# Test in-memory / temporary database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_back2you.db"
test_engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    from backend.app.db.init_db import INITIAL_LOCATIONS
    from backend.app.models.models import CampusLocation
    db = TestingSessionLocal()
    for loc in INITIAL_LOCATIONS:
        db.add(CampusLocation(**loc))
    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=test_engine)

client = TestClient(app)

def make_test_image(color="blue"):
    img = Image.new("RGB", (100, 100), color=color)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    return buf

def test_health_check():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_student_registration_and_validation():
    # 1. Invalid password (missing special char)
    bad_pwd = client.post("/api/v1/auth/register", json={
        "full_name": "Aarav Sharma",
        "account_type": "student",
        "mobile_number": "9876543210",
        "reg_number": "12001122",
        "password": "Password123",
        "confirm_password": "Password123",
        "academic_year": "3rd Year",
        "branch": "Computer Science & Engineering"
    })
    assert bad_pwd.status_code == 400

    # 2. Valid student registration
    reg_res = client.post("/api/v1/auth/register", json={
        "full_name": "Aarav Sharma",
        "account_type": "student",
        "mobile_number": "9876543210",
        "reg_number": "12001122",
        "password": "Password123!",
        "confirm_password": "Password123!",
        "academic_year": "3rd Year",
        "branch": "Computer Science & Engineering"
    })
    assert reg_res.status_code == 201
    data = reg_res.json()
    assert "access_token" in data
    assert data["user"]["reg_number"] == "12001122"
    assert data["user"]["account_type"] == "student"

    # 3. Duplicate registration number should fail
    dup_res = client.post("/api/v1/auth/register", json={
        "full_name": "Another User",
        "account_type": "student",
        "mobile_number": "9876543211",
        "reg_number": "12001122",
        "password": "Password123!",
        "confirm_password": "Password123!",
        "academic_year": "2nd Year",
        "branch": "Mechanical Engineering"
    })
    assert dup_res.status_code == 409

def test_staff_registration():
    reg_res = client.post("/api/v1/auth/register", json={
        "full_name": "Dr. Raman Verma",
        "account_type": "staff",
        "mobile_number": "9123456789",
        "reg_number": "EMP54321",
        "password": "SecureStaff99#",
        "confirm_password": "SecureStaff99#",
        "department": "School of Electronics",
        "designation": "Assistant Professor"
    })
    assert reg_res.status_code == 201
    data = reg_res.json()
    assert data["user"]["account_type"] == "staff"
    assert data["user"]["department"] == "School of Electronics"

def test_login_and_auto_role():
    # Login with ONLY reg_number and password
    login_res = client.post("/api/v1/auth/login", json={
        "reg_number": "12001122",
        "password": "Password123!"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    assert token is not None

    # Verify /me endpoint
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["full_name"] == "Aarav Sharma"

def test_lost_and_found_reporting_and_image_search():
    # Login Student
    student_token = client.post("/api/v1/auth/login", json={
        "reg_number": "12001122",
        "password": "Password123!"
    }).json()["access_token"]

    # Login Staff
    staff_token = client.post("/api/v1/auth/login", json={
        "reg_number": "EMP54321",
        "password": "SecureStaff99#"
    }).json()["access_token"]

    # 1. Report Lost Item (Student lost blue HP laptop)
    lost_res = client.post(
        "/api/v1/lost-reports",
        json={
            "item_name": "HP Pavilion Laptop 15",
            "category": "Laptops",
            "description": "Silver-blue HP laptop with university sticker on top cover",
            "lost_date": "2026-11-10",
            "approx_time": "2:30 PM",
            "location": "Central Library (Floors 3 & 4 - Research & Periodicals)",
            "colour": "Blue",
            "brand": "HP",
            "additional_details": "Has scratch on bottom edge"
        },
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert lost_res.status_code == 201
    lost_data = lost_res.json()
    lost_id = lost_data["id"]
    assert lost_data["report_id"].startswith("LOST-")

    # 2. Upload an image for Found Item
    img_buf = make_test_image("blue")
    upload_res = client.post(
        "/api/v1/uploads/image",
        files={"file": ("laptop.jpg", img_buf, "image/jpeg")},
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert upload_res.status_code == 200
    uploaded_img = upload_res.json()
    assert len(uploaded_img["embedding"]) == 128

    # 3. Report Found Item (Staff found laptop in library)
    found_res = client.post(
        "/api/v1/found-reports",
        json={
            "item_name": "HP Laptop Found at Library Desk",
            "category": "Laptops",
            "description": "Blue HP laptop left behind on table 14",
            "found_date": "2026-11-10",
            "approx_time": "3:00 PM",
            "location": "Central Library (Floors 3 & 4 - Research & Periodicals)",
            "colour": "Blue",
            "brand": "HP",
            "additional_observations": "Handed over to staff desk",
            "image_paths": [uploaded_img["file_path"]]
        },
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert found_res.status_code == 201
    found_data = found_res.json()
    found_id = found_data["id"]

    # 4. Image Similarity Search
    search_img_buf = make_test_image("blue")
    search_res = client.post(
        "/api/v1/search/by-image",
        data={"target_type": "found", "category": "Laptops", "colour": "Blue", "min_similarity": "30"},
        files={"file": ("query.jpg", search_img_buf, "image/jpeg")}
    )
    assert search_res.status_code == 200
    matches = search_res.json()
    assert len(matches) > 0
    assert matches[0]["item_id"] == found_id
    assert matches[0]["similarity_score"] >= 50.0

def test_locations_and_safety_blocking():
    student_token = client.post("/api/v1/auth/login", json={"reg_number": "12001122", "password": "Password123!"}).json()["access_token"]
    staff_token = client.post("/api/v1/auth/login", json={"reg_number": "EMP54321", "password": "SecureStaff99#"}).json()["access_token"]
    me_staff = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {staff_token}"}).json()

    # 1. Campus locations test
    loc_res = client.get("/api/v1/locations")
    assert loc_res.status_code == 200
    locations = loc_res.json()
    assert len(locations) >= 20
    assert any("Central Library" in l["name"] for l in locations)

    # 2. File Safety Report
    safety_res = client.post(
        "/api/v1/safety/report-user",
        json={
            "reported_user_id": me_staff["id"],
            "reason": "Suspicious communication",
            "details": "User requested outside campus meetup late night."
        },
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert safety_res.status_code == 201

    # 3. Block User
    block_res = client.post(
        "/api/v1/safety/block-user",
        json={"blocked_id": me_staff["id"]},
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert block_res.status_code == 200

    # 4. Unblock User
    unblock_res = client.delete(
        f"/api/v1/safety/unblock-user/{me_staff['id']}",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert unblock_res.status_code == 200

def test_report_withdrawal():
    student_token = client.post("/api/v1/auth/login", json={"reg_number": "12001122", "password": "Password123!"}).json()["access_token"]
    
    # Create another lost report to withdraw
    rep = client.post(
        "/api/v1/lost-reports",
        json={
            "item_name": "Keys with LPU lanyard",
            "category": "Keys",
            "description": "Room key attached to yellow lanyard",
            "lost_date": "2026-11-11",
            "approx_time": "10:00 AM",
            "location": "UniMall (Central Food Court & Commercial Center)",
            "colour": "Yellow"
        },
        headers={"Authorization": f"Bearer {student_token}"}
    ).json()
    
    # Withdraw report
    w_res = client.post(f"/api/v1/lost-reports/{rep['id']}/withdraw", headers={"Authorization": f"Bearer {student_token}"})
    assert w_res.status_code == 200
    assert w_res.json()["status"] == "withdrawn"


def test_recovery_lifecycle_and_contact_privacy():
    # Login tokens
    student_token = client.post("/api/v1/auth/login", json={"reg_number": "12001122", "password": "Password123!"}).json()["access_token"]
    staff_token = client.post("/api/v1/auth/login", json={"reg_number": "EMP54321", "password": "SecureStaff99#"}).json()["access_token"]

    lost_reports = client.get("/api/v1/lost-reports", headers={"Authorization": f"Bearer {student_token}"}).json()
    found_reports = client.get("/api/v1/found-reports", headers={"Authorization": f"Bearer {staff_token}"}).json()
    lost_id = lost_reports[0]["id"]
    found_id = found_reports[0]["id"]

    # 1. Student sends Recovery Request to Found item owner (Staff)
    req_res = client.post(
        "/api/v1/recovery",
        json={
            "lost_report_id": lost_id,
            "found_report_id": found_id,
            "message": "Hello, I believe this is my laptop! It has my project files on the desktop."
        },
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert req_res.status_code == 201
    req_data = req_res.json()
    req_code = req_data["request_code"]
    assert req_data["status"] == "pending"

    # Contact Privacy Check: before acceptance, partner profile MUST be None!
    assert req_data["partner_profile"] is None

    # Check recipient sees notification
    notifs = client.get("/api/v1/notifications", headers={"Authorization": f"Bearer {staff_token}"}).json()
    assert any(n["type"] == "recovery_request" for n in notifs)

    # 2. Staff accepts the recovery request
    accept_res = client.post(
        f"/api/v1/recovery/{req_code}/accept",
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert accept_res.status_code == 200
    accepted_data = accept_res.json()
    assert accepted_data["status"] == "accepted"

    # Contact Details now revealed to authorized participant
    assert accepted_data["partner_profile"] is not None
    assert accepted_data["partner_profile"]["full_name"] == "Aarav Sharma"
    assert accepted_data["partner_profile"]["mobile_number"] == "9876543210"
    assert accepted_data["partner_profile"]["branch"] == "Computer Science & Engineering"

    # 3. Private Messaging
    convs = client.get("/api/v1/messages/conversations", headers={"Authorization": f"Bearer {student_token}"}).json()
    assert len(convs) > 0
    conv_id = convs[0]["id"]

    # Send message from Student to Staff
    msg_send = client.post(
        f"/api/v1/messages/conversations/{conv_id}",
        json={"content": "Thank you for finding it! When and where can I meet you in Block 32?"},
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert msg_send.status_code == 201

    # Staff reads messages
    msg_list = client.get(
        f"/api/v1/messages/conversations/{conv_id}",
        headers={"Authorization": f"Bearer {staff_token}"}
    ).json()
    assert len(msg_list) == 1
    assert msg_list[0]["content"].startswith("Thank you for finding it!")

    # 4. Two-party Return Confirmation
    # Student confirms return
    conf1 = client.post(f"/api/v1/recovery/{req_code}/confirm-return", headers={"Authorization": f"Bearer {student_token}"}).json()
    assert conf1["status"] == "accepted"  # Not yet completed, waiting for second confirmation!
    assert conf1["lost_user_confirmed_return"] is True
    assert conf1["found_user_confirmed_return"] is False

    # Staff confirms return -> Becomes completed!
    conf2 = client.post(f"/api/v1/recovery/{req_code}/confirm-return", headers={"Authorization": f"Bearer {staff_token}"}).json()
    assert conf2["status"] == "completed"
    assert conf2["found_user_confirmed_return"] is True

    # 5. Feedback Submission
    fb_res = client.post(
        "/api/v1/feedback",
        json={
            "recovery_request_id": conf2["id"],
            "rating": 5,
            "comment": "Recovered my laptop within hours! Outstanding campus coordination.",
            "recovery_experience": "Excellent"
        },
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert fb_res.status_code == 201

    # Duplicate feedback prevention
    dup_fb = client.post(
        "/api/v1/feedback",
        json={
            "recovery_request_id": conf2["id"],
            "rating": 5,
            "comment": "Trying to submit twice",
            "recovery_experience": "Excellent"
        },
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert dup_fb.status_code == 409

    # 6. Check Dashboard Stats and Report History
    stats = client.get("/api/v1/users/stats", headers={"Authorization": f"Bearer {student_token}"}).json()
    assert stats["successfully_returned_items"] >= 1

    history = client.get("/api/v1/users/history", headers={"Authorization": f"Bearer {student_token}"}).json()
    assert len(history["lost_reports"]) >= 1
    assert any(r["status"] == "resolved" for r in history["lost_reports"])
    assert any(r["status"] == "withdrawn" for r in history["lost_reports"])
