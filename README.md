# Back2You — LPU Campus Lost & Found Platform

> **"Lost something? Found something? Let's bring it Back2You."**

Back2You is a modern, secure, and fully functional Lost & Found web platform engineered for the **Lovely Professional University (LPU)** campus community. It enables students and faculty members to report lost and found items, upload photographs, discover matches using computer vision vector embeddings, coordinate recovery requests, privately communicate in-app, exchange verified contact details upon mutual acceptance, track report history, and submit verified feedback.

---

## 🏛️ Academic Branding & Independent Status

Back2You features an **LPU-inspired academic portal appearance** featuring navy blue (`#0f172a`, `#1e385a`), crisp white, and subtle blue accents (`#2563eb`, `#38bdf8`), professional typography, clean responsive layouts, and transparent security disclosures.

> [!NOTE]
> **Independent Portal Notice**: Back2You is an independent community platform built specifically for the Lovely Professional University campus community. It is not officially owned, operated, or endorsed by university administration. Official physical drop-offs and administrative verifications are coordinated through the LPU Student Services Division.

---

## 🚀 Key Features & Architectural Modules

### 1. Two-Tier Authentication & Strict Privacy
- **Create Account**:
  - **Student**: Full Name, University Registration Number, Mobile Number, Password, Academic Year (1st–4th Year / Post-Graduate), Branch.
  - **Staff**: Full Name, Employee ID / Reg Number, Mobile Number, Password, Department, Designation.
  - **Security**: Argon2id password hashing (`time_cost=3`, `memory_cost=64MB`, `parallelism=4`), secure JWT tokens, and strict password complexity validation (min 8 chars, uppercase, lowercase, number, special character).
- **Log In**:
  - **ONLY 2 fields**: Registration Number and Password.
  - Automatically identifies account type (Student vs Staff) without asking for redundant profile details.
- **Forgot Password**:
  - Displays clear guidance directing the user to LPU Student Services (Room 302, Block 32). Automated OTP recovery is omitted to prevent identity spoofing.

### 2. Lost & Found Reporting with Real Photographs
- **Lost Item Reporting**: Categorized under 16 realistic campus classifications (Electronics, Laptops, Mobile phones, Chargers, Wallets, Bags, Books, ID cards, Keys, Watches, Jewellery, Clothing, Water bottles, Stationery, Sports equipment, Other), approximate time, campus location, colour, brand, and optional photograph uploads.
- **Found Item Reporting**: **Photograph upload is an essential, enforced requirement**. Validates formats (JPEG, PNG, WebP), dimensions, and file size (under 10MB). Automatically generates a unique report ID (`FOUND-2026-XXXX`).

### 3. Actual Image Similarity Search & Computer Vision
- Users can upload any reference photo to search the database visually.
- **Computer Vision Embeddings**:
  - 128-dimensional perceptual feature vectors extracted via PIL and NumPy:
    - **64 dims**: Soft-binned HSV (circular Hue, Saturation, Value) & YCbCr perceptual color distributions and channel moments.
    - **48 dims**: Spatial 4x4 luminance blocks and directional gradients (Sobel filters capturing edge layout and texture).
    - **16 dims**: Geometric moments, aspect ratio, contour contrast, and edge density.
  - **Vector Similarity Search**: Exact Cosine Vector Similarity:
    $$\cos(\theta) = \frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\|_2 \|\mathbf{v}\|_2}$$
  - **Multi-Factor Score**: Combines visual cosine similarity (55%), category match (18%), color consistency (12%), campus location proximity (9%), and date proximity (6%).
  - **Ownership Disclaimer**: Clearly informs users that a visual image match provides similarity assistance only and *never automatically establishes ownership*. Keyword search fallback is provided when no image is uploaded.

### 4. Recovery Request & Two-Party Return Confirmation
- When a user identifies an item that belongs to them (or finds an item belonging to someone), they initiate a recovery request.
- **Contact Confidentiality**:
  - Before acceptance, mobile numbers and personal profile fields are **strictly concealed** on the backend.
  - Upon acceptance by the recipient, both participants gain access to each other's full names, mobile numbers, and academic branch/department.
- **Two-Party Return Confirmation**:
  - An item is **never** marked completed unilaterally. Both the finder and the loser must confirm handoff from their respective accounts before recovery is closed.
  - Report statuses transition securely: Lost items become `resolved`, Found items become `returned`.

### 5. Private In-App Messaging
- Unlocked exclusively between the two authorized participants of an accepted recovery request.
- Unread message counters, timestamps, read receipts, and real-time polling.
- Comprehensive backend permission checks prevent any unauthorized access.

### 6. Campus Location System
- 23 pre-seeded, realistic LPU campus zones categorized under Academic Blocks (Block 14, Block 28, Block 34, Block 38, Block 55), Central Library, Hostels (Boys Hostels 1–8, Girls Hostels 1–6), UniMall Food Court, Sports Complex, and Parking Areas.

### 7. Feedback & Trust Ratings
- Only participants of completed recoveries can leave feedback.
- 1 to 5 star ratings, recovery experience tags, and written testimonials. Duplicate submissions are prevented on the database level via a unique constraint.

### 8. Student Services & Moderation
- Dedicated Student Services information portal with room location, phone, email, working hours, and physical locker custody procedures.
- In-app User Reporting and Blocking capabilities to prevent spam or harassment.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide React, React Router v7 |
| **Backend** | Python 3.13, FastAPI, Uvicorn, Pydantic v2 |
| **Database** | SQLite (zero-setup local default) / PostgreSQL + psycopg2, SQLAlchemy 2.0 |
| **Migrations**| Alembic (complete autogenerated schema versions) |
| **Security** | Argon2id password hashing (`argon2-cffi`), PyJWT (HS256 tokens) |
| **Vision / AI**| PIL (Pillow), NumPy, SciPy (128-dimensional perceptual feature vectors) |
| **Testing** | Pytest, FastAPI TestClient, HTTPX |

---

## 🗄️ Normalized Database Schema (13 Tables)

```mermaid
erDiagram
    USERS ||--o{ LOST_REPORTS : reports
    USERS ||--o{ FOUND_REPORTS : reports
    USERS ||--o{ RECOVERY_REQUESTS : initiates_or_receives
    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ FEEDBACK : submits
    USERS ||--o{ USER_REPORTS : files
    USERS ||--o{ BLOCKS : blocks

    LOST_REPORTS ||--o{ ITEM_IMAGES : contains
    LOST_REPORTS ||--o{ RECOVERY_REQUESTS : matched_in

    FOUND_REPORTS ||--o{ ITEM_IMAGES : contains
    FOUND_REPORTS ||--o{ RECOVERY_REQUESTS : matched_in

    ITEM_IMAGES ||--o| IMAGE_EMBEDDINGS : has

    RECOVERY_REQUESTS ||--o| CONVERSATIONS : unlocks
    RECOVERY_REQUESTS ||--o{ FEEDBACK : receives

    CONVERSATIONS ||--o{ MESSAGES : contains

    CAMPUS_LOCATIONS {
        int id PK
        string name UK
        string category
        string description
    }
```

---

## ⚙️ Quick Start & Running the Application

### Option A: Unified Full-Stack Server (Recommended)

The FastAPI server serves both the backend REST API (`/api/v1`) and the compiled production React application on the exact same port:

```bash
# 1. Activate Python virtual environment
.venv\Scripts\activate   # Windows
# or: source .venv/bin/activate

# 2. Seed realistic demo data (Students, Staff, Reports, Photographs, Embeddings)
python -m backend.app.db.seed_demo

# 3. Launch the full application
python run.py
```
Open your browser to: **`http://localhost:8000`**

---

### Option B: Independent Development Servers

If you are developing frontend components with live HMR:

**Terminal 1 — Backend (Port 8000)**:
```bash
.venv\Scripts\activate
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 — Frontend (Port 5173)**:
```bash
cd frontend
npm run dev
```
Open your browser to: **`http://localhost:5173`** (Vite proxies all `/api` requests to port 8000 automatically).

---

## 🔑 Pre-Seeded Demo Campus Accounts

You can immediately sign in using any of the following accounts:

| Role | University Registration No. | Password | Full Name & Details |
|---|---|---|---|
| **Student** | `12001122` | `Campus@2026!` | Aarav Sharma (3rd Year, Computer Science) |
| **Student** | `12104567` | `Campus@2026!` | Priya Patel (2nd Year, ECE) |
| **Staff** | `EMP54321` | `Campus@2026!` | Dr. Raman Verma (Asst. Prof, School of Computer Science) |
| **Staff** | `EMP10982` | `Campus@2026!` | Gurpreet Singh (Warden, Boys Hostel 3) |

---

## 🧪 Running Automated Test Suite

Back2You includes automated tests covering authentication, password hashing, lost/found reporting, image embedding extraction, cosine similarity ranking, contact privacy controls, two-party return confirmation, feedback deduplication, and safety moderation:

```bash
.venv\Scripts\pytest backend\tests\test_back2you.py -v
```

All 8 comprehensive test cases pass with 100% success rate:
- `test_health_check`
- `test_student_registration_and_validation`
- `test_staff_registration`
- `test_login_and_auto_role`
- `test_lost_and_found_reporting_and_image_search`
- `test_locations_and_safety_blocking`
- `test_report_withdrawal`
- `test_recovery_lifecycle_and_contact_privacy`

---

## 🐘 Production PostgreSQL & Alembic Migrations

To switch from SQLite to PostgreSQL:

1. Update `DATABASE_URL` in `.env`:
   ```env
   DATABASE_URL=postgresql+psycopg2://username:password@localhost:5432/back2you
   ```
2. Run database migrations:
   ```bash
   cd backend
   alembic upgrade head
   ```

---

## 📄 License
MIT License. Built for the Lovely Professional University campus community.
