import os
import pandas as pd
from datetime import datetime
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import (
    User, UserRole, UserStatus,
    Voter, VerificationStatus,
    Election, ElectionStatus,
    Candidate,
    Vote, VoteStatus,
    AuditLog, ActorType, AuditStatus,
    BiometricRecord, BiometricMethod, BiometricSourceType, BiometricRecordStatus
)
from services.auth import hash_password

DEFAULT_DEMO_PASSWORD = "password123"

def find_data_dir():
    # Allow override via environment variable
    env_path = os.getenv("DATABASE_DATA_DIR")
    if env_path and os.path.exists(env_path):
        return env_path

    # Try finding database directory relative to workspace or file location
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(current_dir, "..", ".."))

    possible_paths = [
        os.path.join(project_root, "database"),
        os.path.abspath(os.path.join(current_dir, "..", "..", "database")),
        os.path.abspath(os.path.join(current_dir, "..", "database")),
        "database"
    ]
    for p in possible_paths:
        if os.path.exists(p) and os.path.isfile(os.path.join(p, "users.csv")):
            return p
    return None

def seed_database(db: Session = None):
    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True

    try:
        # Create all tables first
        Base.metadata.create_all(bind=engine)

        # Check if DB is already seeded
        if db.query(Election).first() is not None:
            print("Database already contains data. Skipping seed.")
            return

        db_path = find_data_dir()
        if not db_path:
            print("Warning: database/ CSV directory not found. Skipping data seeding.")
            return

        print(f"Seeding database from: {db_path}")

        # 1. Seed Voters
        voters_file = os.path.join(db_path, "voters.csv")
        if os.path.exists(voters_file):
            voters_df = pd.read_csv(voters_file)
            for _, row in voters_df.iterrows():
                # Cast bools safely
                eligible = str(row['eligible']).strip().lower() in ['true', '1', 'yes']
                has_voted = str(row['has_voted']).strip().lower() in ['true', '1', 'yes']
                
                voter_obj = Voter(
                    voter_id=str(row['voter_id']),
                    name=str(row['name']),
                    email=str(row['email']),
                    phone=str(row['phone']) if pd.notna(row['phone']) else None,
                    eligible=eligible,
                    verification_status=VerificationStatus(str(row['verification_status']).upper()),
                    has_voted=has_voted,
                    role=str(row.get('role', 'VOTER'))
                )
                db.add(voter_obj)
            db.commit()
            print(f"Seeded {len(voters_df)} voters.")

        # 2. Seed Users
        users_file = os.path.join(db_path, "users.csv")
        if os.path.exists(users_file):
            users_df = pd.read_csv(users_file)
            hashed_pwd = hash_password(DEFAULT_DEMO_PASSWORD)
            for _, row in users_df.iterrows():
                voter_id = str(row['voter_id']) if pd.notna(row['voter_id']) and str(row['voter_id']).strip() else None
                user_obj = User(
                    user_id=str(row['user_id']),
                    voter_id=voter_id,
                    name=str(row['name']),
                    email=str(row['email']),
                    password_hash=hashed_pwd,
                    role=UserRole(str(row['role']).upper()),
                    status=UserStatus(str(row['status']).upper())
                )
                db.add(user_obj)
            db.commit()
            print(f"Seeded {len(users_df)} users (Default password: {DEFAULT_DEMO_PASSWORD}).")

        # 3. Seed Elections
        elections_file = os.path.join(db_path, "elections.csv")
        if os.path.exists(elections_file):
            elections_df = pd.read_csv(elections_file)
            today = datetime.now().date()
            for _, row in elections_df.iterrows():
                start_dt = datetime.strptime(str(row['start_date']), "%Y-%m-%d").date()
                end_dt = datetime.strptime(str(row['end_date']), "%Y-%m-%d").date()
                # For demo elections marked ACTIVE, ensure start_date <= today
                status_val = ElectionStatus(str(row['status']).upper())
                if status_val == ElectionStatus.ACTIVE and start_dt > today:
                    start_dt = today
                    if end_dt < today:
                        end_dt = today
                election_obj = Election(
                    election_id=str(row['election_id']),
                    title=str(row['title']),
                    description=str(row['description']) if pd.notna(row['description']) else None,
                    start_date=start_dt,
                    end_date=end_dt,
                    status=status_val,
                    rules_version=str(row.get('rules_version', '1.0'))
                )
                db.add(election_obj)
            db.commit()
            print(f"Seeded {len(elections_df)} elections.")

        # 4. Seed Candidates
        candidates_file = os.path.join(db_path, "candidates.csv")
        if os.path.exists(candidates_file):
            candidates_df = pd.read_csv(candidates_file)
            for _, row in candidates_df.iterrows():
                candidate_obj = Candidate(
                    candidate_id=str(row['candidate_id']),
                    election_id=str(row['election_id']),
                    name=str(row['name']),
                    department=str(row['department']),
                    symbol=str(row['symbol']),
                    manifesto=str(row['manifesto']) if pd.notna(row['manifesto']) else None
                )
                db.add(candidate_obj)
            db.commit()
            print(f"Seeded {len(candidates_df)} candidates.")

        # 5. Seed Votes
        votes_file = os.path.join(db_path, "seed_votes_for_demo.csv")
        if os.path.exists(votes_file):
            votes_df = pd.read_csv(votes_file)
            for _, row in votes_df.iterrows():
                cast_at_dt = datetime.fromisoformat(str(row['cast_at'])) if 'T' in str(row['cast_at']) else datetime.strptime(str(row['cast_at']), "%Y-%m-%d %H:%M:%S")
                voter_id = str(row['voter_id']) if 'voter_id' in row and pd.notna(row['voter_id']) else None
                vote_obj = Vote(
                    vote_id=str(row['vote_id']),
                    election_id=str(row['election_id']),
                    candidate_id=str(row['candidate_id']),
                    voter_id=voter_id,
                    cast_at=cast_at_dt,
                    vote_status=VoteStatus(str(row['vote_status']).upper())
                )
                db.add(vote_obj)
            db.commit()
            print(f"Seeded {len(votes_df)} demo votes.")

        # 6. Seed Audit Logs
        audit_file = os.path.join(db_path, "audit_logs.csv")
        if os.path.exists(audit_file):
            audit_df = pd.read_csv(audit_file)
            for _, row in audit_df.iterrows():
                ts = datetime.fromisoformat(str(row['timestamp'])) if 'T' in str(row['timestamp']) else datetime.strptime(str(row['timestamp']), "%Y-%m-%d %H:%M:%S")
                election_id = str(row['election_id']) if pd.notna(row['election_id']) else None
                audit_obj = AuditLog(
                    log_id=str(row['log_id']),
                    actor_type=ActorType(str(row['actor_type']).upper()),
                    actor_id=str(row['actor_id']),
                    action=str(row['action']),
                    election_id=election_id,
                    timestamp=ts,
                    status=AuditStatus(str(row['status']).upper())
                )
                db.add(audit_obj)
            db.commit()
            print(f"Seeded {len(audit_df)} audit logs.")

        print("Database seeding completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        if should_close:
            db.close()

if __name__ == "__main__":
    seed_database()
