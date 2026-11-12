import datetime
import io
import json
import os
from PIL import Image, ImageDraw
from backend.app.db.session import SessionLocal, Base, engine
from backend.app.models.models import (
    User,
    LostReport,
    FoundReport,
    ItemImage,
    ImageEmbedding,
    RecoveryRequest,
    Conversation,
    Message,
    Notification,
    Feedback,
    CampusLocation
)
from backend.app.core.security import get_password_hash
from backend.app.core.config import settings
from backend.app.services.vision_service import extract_image_embedding
from backend.app.db.init_db import init_db

def create_color_image(color, label, filename):
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    target_path = os.path.join(settings.UPLOAD_DIR, filename)
    
    # 256x256 image with gradient and text box
    img = Image.new("RGB", (256, 256), color=color)
    draw = ImageDraw.Draw(img)
    # Draw simple geometric emblem
    draw.rectangle([32, 32, 224, 224], outline="white", width=4)
    draw.rectangle([64, 64, 192, 192], outline="white", width=2)
    
    img.save(target_path, format="JPEG")
    
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    emb = extract_image_embedding(buf.getvalue())
    return f"/api/v1/uploads/files/{filename}", emb

def seed_demo():
    init_db()
    db = SessionLocal()
    try:
        if db.query(User).count() > 0:
            print("Demo data already seeded.")
            return

        print("Seeding realistic demo LPU campus data...")

        # 1. Users
        pwd = get_password_hash("Campus@2026!")

        user_aarav = User(
            reg_number="12001122",
            full_name="Aarav Sharma",
            account_type="student",
            mobile_number="9876543210",
            password_hash=pwd,
            academic_year="3rd Year",
            branch="Computer Science & Engineering",
            is_active=True
        )

        user_priya = User(
            reg_number="12104567",
            full_name="Priya Patel",
            account_type="student",
            mobile_number="9812345678",
            password_hash=pwd,
            academic_year="2nd Year",
            branch="Electronics & Communication Engineering",
            is_active=True
        )

        user_raman = User(
            reg_number="EMP54321",
            full_name="Dr. Raman Verma",
            account_type="staff",
            mobile_number="9123456789",
            password_hash=pwd,
            department="School of Computer Science",
            designation="Assistant Professor",
            is_active=True
        )

        user_gurpreet = User(
            reg_number="EMP10982",
            full_name="Gurpreet Singh",
            account_type="staff",
            mobile_number="9765432109",
            password_hash=pwd,
            department="Student Welfare Division",
            designation="Hostel Warden",
            is_active=True
        )

        db.add_all([user_aarav, user_priya, user_raman, user_gurpreet])
        db.commit()
        db.refresh(user_aarav)
        db.refresh(user_priya)
        db.refresh(user_raman)
        db.refresh(user_gurpreet)

        # 2. Images & Embeddings
        img1_path, emb1 = create_color_image("#1e3a8a", "Blue Dell Laptop", "demo_dell_laptop.jpg")
        img2_path, emb2 = create_color_image("#1e3a8a", "Found Blue Laptop", "demo_found_laptop.jpg")
        img3_path, emb3 = create_color_image("#7c2d12", "Brown Leather Wallet", "demo_wallet.jpg")
        img4_path, emb4 = create_color_image("#047857", "Green Water Bottle", "demo_bottle.jpg")
        img5_path, emb5 = create_color_image("#b91c1c", "Red Backpack", "demo_backpack.jpg")

        # 3. Lost Reports
        today = datetime.date.today()

        lost_laptop = LostReport(
            report_id="LOST-2026-A19F",
            user_id=user_aarav.id,
            item_name="Dell Inspiron 15 Laptop",
            category="Laptops",
            description="Dark blue Dell laptop with an LPU Coding Club sticker on top right corner and minor scratch near trackpad.",
            lost_date=today - datetime.timedelta(days=2),
            approx_time="2:30 PM",
            location="Central Library (Floors 3 & 4 - Research & Periodicals)",
            colour="Dark Blue",
            brand="Dell",
            additional_details="Contains university project files on desktop",
            status="active"
        )

        lost_wallet = LostReport(
            report_id="LOST-2026-B82C",
            user_id=user_priya.id,
            item_name="Brown Leather Wallet",
            category="Wallets",
            description="Brown Titan leather wallet containing LPU Student ID card, metro card, and cash.",
            lost_date=today - datetime.timedelta(days=1),
            approx_time="1:15 PM",
            location="UniMall (Central Food Court & Commercial Center)",
            colour="Brown",
            brand="Titan",
            additional_details="Student ID name: Priya Patel (12104567)",
            status="active"
        )

        lost_bottle = LostReport(
            report_id="LOST-2026-C44D",
            user_id=user_aarav.id,
            item_name="Milton Thermosteel Water Bottle",
            category="Water bottles",
            description="Matte green insulated bottle with black carrying strap.",
            lost_date=today - datetime.timedelta(days=3),
            approx_time="11:00 AM",
            location="Main Sports Complex & Gymnasium",
            colour="Green",
            brand="Milton",
            status="active"
        )

        db.add_all([lost_laptop, lost_wallet, lost_bottle])
        db.commit()
        db.refresh(lost_laptop)
        db.refresh(lost_wallet)
        db.refresh(lost_bottle)

        # Lost Images
        im_lost_1 = ItemImage(
            lost_report_id=lost_laptop.id,
            file_path=img1_path,
            filename="demo_dell_laptop.jpg",
            file_size=1024,
            mime_type="image/jpeg",
            is_primary=True
        )
        db.add(im_lost_1)
        db.flush()
        db.add(ImageEmbedding(item_image_id=im_lost_1.id, lost_report_id=lost_laptop.id, embedding_json=json.dumps(emb1), vector_dim=128))

        im_lost_2 = ItemImage(
            lost_report_id=lost_wallet.id,
            file_path=img3_path,
            filename="demo_wallet.jpg",
            file_size=1024,
            mime_type="image/jpeg",
            is_primary=True
        )
        db.add(im_lost_2)
        db.flush()
        db.add(ImageEmbedding(item_image_id=im_lost_2.id, lost_report_id=lost_wallet.id, embedding_json=json.dumps(emb3), vector_dim=128))

        # 4. Found Reports
        found_laptop = FoundReport(
            report_id="FOUND-2026-F104",
            user_id=user_raman.id,
            item_name="Blue Dell Laptop at Study Table 22",
            category="Laptops",
            description="Found left on study table 22 in research section. Dark blue color, in sleep mode.",
            found_date=today - datetime.timedelta(days=2),
            approx_time="3:15 PM",
            location="Central Library (Floors 3 & 4 - Research & Periodicals)",
            colour="Dark Blue",
            brand="Dell",
            additional_observations="Handed over to staff desk for safekeeping.",
            status="recovery_pending"
        )

        found_bottle = FoundReport(
            report_id="FOUND-2026-F299",
            user_id=user_gurpreet.id,
            item_name="Green Insulated Flask",
            category="Water bottles",
            description="Found near badminton court bleachers in sports arena.",
            found_date=today - datetime.timedelta(days=3),
            approx_time="12:30 PM",
            location="Main Sports Complex & Gymnasium",
            colour="Green",
            brand="Milton",
            additional_observations="Currently kept at hostel security reception.",
            status="active"
        )

        found_bag = FoundReport(
            report_id="FOUND-2026-F388",
            user_id=user_priya.id,
            item_name="Red Wildcraft Backpack",
            category="Bags",
            description="Red Wildcraft college backpack left in Block 14 room 204.",
            found_date=today - datetime.timedelta(days=4),
            approx_time="5:00 PM",
            location="Block 14 (School of Computer Science & Engineering)",
            colour="Red",
            brand="Wildcraft",
            additional_observations="Contains notebooks and pencil box.",
            status="returned"
        )

        db.add_all([found_laptop, found_bottle, found_bag])
        db.commit()
        db.refresh(found_laptop)
        db.refresh(found_bottle)
        db.refresh(found_bag)

        # Found Images
        im_found_1 = ItemImage(
            found_report_id=found_laptop.id,
            file_path=img2_path,
            filename="demo_found_laptop.jpg",
            file_size=1024,
            mime_type="image/jpeg",
            is_primary=True
        )
        db.add(im_found_1)
        db.flush()
        db.add(ImageEmbedding(item_image_id=im_found_1.id, found_report_id=found_laptop.id, embedding_json=json.dumps(emb2), vector_dim=128))

        im_found_2 = ItemImage(
            found_report_id=found_bottle.id,
            file_path=img4_path,
            filename="demo_bottle.jpg",
            file_size=1024,
            mime_type="image/jpeg",
            is_primary=True
        )
        db.add(im_found_2)
        db.flush()
        db.add(ImageEmbedding(item_image_id=im_found_2.id, found_report_id=found_bottle.id, embedding_json=json.dumps(emb4), vector_dim=128))

        im_found_3 = ItemImage(
            found_report_id=found_bag.id,
            file_path=img5_path,
            filename="demo_backpack.jpg",
            file_size=1024,
            mime_type="image/jpeg",
            is_primary=True
        )
        db.add(im_found_3)
        db.flush()
        db.add(ImageEmbedding(item_image_id=im_found_3.id, found_report_id=found_bag.id, embedding_json=json.dumps(emb5), vector_dim=128))

        # 5. Recovery Requests & Conversation
        rec_active = RecoveryRequest(
            request_code="REC-2026-X891",
            lost_report_id=lost_laptop.id,
            found_report_id=found_laptop.id,
            requesting_user_id=user_aarav.id,
            receiving_user_id=user_raman.id,
            message="Hello Professor Raman, I left my Dell laptop on table 22. It has an LPU Coding Club sticker on top right.",
            status="accepted",
            lost_user_confirmed_return=False,
            found_user_confirmed_return=False
        )
        db.add(rec_active)
        db.commit()
        db.refresh(rec_active)

        # Conversation for active recovery
        conv = Conversation(
            recovery_request_id=rec_active.id,
            user1_id=user_aarav.id,
            user2_id=user_raman.id
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)

        m1 = Message(
            conversation_id=conv.id,
            sender_id=user_aarav.id,
            content="Thank you for keeping it safe, Professor! When can I meet you to pick it up?",
            is_read=True
        )
        m2 = Message(
            conversation_id=conv.id,
            sender_id=user_raman.id,
            content="Hello Aarav. I have deposited it at Block 32 Student Services Lost & Found desk. Please present your student ID card to collect it.",
            is_read=True
        )
        db.add_all([m1, m2])

        # 6. Completed Recovery and Feedback
        rec_completed = RecoveryRequest(
            request_code="REC-2026-Y402",
            lost_report_id=lost_bottle.id,
            found_report_id=found_bottle.id,
            requesting_user_id=user_aarav.id,
            receiving_user_id=user_gurpreet.id,
            message="Hi Warden sir, this matches my Milton flask left after football practice.",
            status="completed",
            lost_user_confirmed_return=True,
            found_user_confirmed_return=True
        )
        db.add(rec_completed)
        db.commit()
        db.refresh(rec_completed)

        fb = Feedback(
            recovery_request_id=rec_completed.id,
            user_id=user_aarav.id,
            rating=5,
            comment="Retrieved my water bottle from hostel reception within an hour. Smooth and polite handoff!",
            recovery_experience="Quick Campus Coordination"
        )
        db.add(fb)

        # 7. Notifications
        n1 = Notification(
            user_id=user_aarav.id,
            title="Recovery Request Accepted",
            message="Dr. Raman Verma accepted your recovery request for Dell Inspiron 15 Laptop. Contact details are now unlocked.",
            type="request_accepted",
            link=f"/recovery/{rec_active.request_code}",
            is_read=False
        )
        n2 = Notification(
            user_id=user_aarav.id,
            title="New Chat Message",
            message="Dr. Raman Verma: Hello Aarav. I have deposited it at Block 32...",
            type="new_message",
            link=f"/messages?conv={conv.id}",
            is_read=False
        )
        db.add_all([n1, n2])

        db.commit()
        print("Demo LPU campus data seeded successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_demo()
