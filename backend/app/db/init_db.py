from backend.app.db.session import engine, Base, SessionLocal
from backend.app.models.models import CampusLocation

INITIAL_LOCATIONS = [
    # Academic Blocks
    {"name": "Block 14 (School of Computer Science & Engineering)", "category": "Academic blocks", "description": "CSE and IT labs, classrooms, and faculty offices"},
    {"name": "Block 28 (School of Electronics & Bioengineering)", "category": "Academic blocks", "description": "ECE, EE, and Biomedical engineering labs"},
    {"name": "Block 34 (School of Mechanical & Civil Engineering)", "category": "Academic blocks", "description": "Workshops, design studios, and lecture halls"},
    {"name": "Block 38 (Robotics, AI & Innovation Labs)", "category": "Academic blocks", "description": "Advanced research, incubation, and robotics facility"},
    {"name": "Block 55 (School of Business & Management)", "category": "Academic blocks", "description": "MBA and commerce department"},
    
    # Library
    {"name": "Central Library (Floors 1 & 2 - General Reading)", "category": "Library", "description": "Main reference desk, digital catalog, and study desks"},
    {"name": "Central Library (Floors 3 & 4 - Research & Periodicals)", "category": "Library", "description": "Quiet study zones, journal archives, and computers"},
    
    # Administrative & Services
    {"name": "Block 32 (Student Welfare & Services Division)", "category": "Administrative buildings", "description": "Student services, helpdesk, IDs, and lost & found office"},
    {"name": "Baldev Raj Mittal Unipolis", "category": "Administrative buildings", "description": "Open amphitheater, convocations, and cultural fests"},
    {"name": "Shanti Devi Mittal Auditorium", "category": "Administrative buildings", "description": "Main university indoor auditorium and event hall"},
    
    # Hostels
    {"name": "Boys Hostel 1-4 (North Campus)", "category": "Hostels", "description": "North campus residential complex, mess, and study rooms"},
    {"name": "Boys Hostel 5-8 (West Campus)", "category": "Hostels", "description": "West campus residential blocks and sports grounds"},
    {"name": "Girls Hostel 1-3 (Main Campus)", "category": "Hostels", "description": "Main campus residential halls and gardens"},
    {"name": "Girls Hostel 4-6 (East Campus)", "category": "Hostels", "description": "East campus residential towers and dining areas"},
    
    # Cafeteria & Food Courts
    {"name": "UniMall (Central Food Court & Commercial Center)", "category": "Cafeteria", "description": "Food court, stationery shops, printing centers, and ATMs"},
    {"name": "Block 34 Cafeteria & Refreshment Kiosk", "category": "Cafeteria", "description": "Outdoor food kiosks and seating lawn"},
    {"name": "Hospitality & Food Plaza (Near Central Library)", "category": "Cafeteria", "description": "Quick bite outlets and coffee stalls"},
    
    # Sports & Recreation
    {"name": "Main Sports Complex & Gymnasium", "category": "Sports complex", "description": "Indoor badminton, basketball courts, and fitness center"},
    {"name": "University Stadium & Athletic Ground", "category": "Sports complex", "description": "Running track, football field, and spectators stand"},
    
    # Parking & Gates
    {"name": "Multi-Level Vehicle Parking Area", "category": "Parking areas", "description": "Two-wheeler and four-wheeler multi-story parking"},
    {"name": "Main Entrance Gate & Visitor Arena", "category": "Parking areas", "description": "Main gate security checkpost and bus terminal"},
    
    # Other
    {"name": "Campus Medical Center & Hospital", "category": "Other", "description": "24/7 health center, emergency desk, and pharmacy"},
    {"name": "Other Campus Location", "category": "Other", "description": "Other unlisted university campus locations"}
]

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Seed locations if not present
        existing_count = db.query(CampusLocation).count()
        if existing_count == 0:
            for loc in INITIAL_LOCATIONS:
                db.add(CampusLocation(**loc))
            db.commit()
            print(f"Seeded {len(INITIAL_LOCATIONS)} campus locations.")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
    print("Database tables initialized successfully.")
