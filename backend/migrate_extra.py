import os
import django
from dotenv import load_dotenv

load_dotenv()
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection

cursor = connection.cursor()

# 1. Update tasks table
task_cols = [
    ("status", "VARCHAR(30) DEFAULT 'Not Started'"),
    ("mentor_id", "INT NULL"),
    ("assigned_by_mentor", "TINYINT(1) DEFAULT 0"),
    ("submission_notes", "TEXT NULL"),
    ("submission_file", "VARCHAR(255) NULL"),
    ("mentor_feedback", "TEXT NULL"),
    ("submitted_at", "DATETIME NULL"),
]
for col, col_type in task_cols:
    try:
        cursor.execute(f"ALTER TABLE tasks ADD COLUMN {col} {col_type};")
        print(f"Added {col} to tasks")
    except Exception as e:
        print(f"tasks column {col}: {e}")

# 2. Update quiz_attempts table
quiz_cols = [
    ("is_time_bound", "TINYINT(1) DEFAULT 1"),
    ("time_taken_seconds", "INT UNSIGNED DEFAULT 0"),
]
for col, col_type in quiz_cols:
    try:
        cursor.execute(f"ALTER TABLE quiz_attempts ADD COLUMN {col} {col_type};")
        print(f"Added {col} to quiz_attempts")
    except Exception as e:
        print(f"quiz_attempts column {col}: {e}")

# 3. Create notifications table if not exists
try:\
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notifications (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'general',
        is_read TINYINT(1) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)
    print("notifications table checked/created")
except Exception as e:
    print(f"notifications table: {e}")

# 4. Create guidance_requests table if not exists
try:
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS guidance_requests (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        mentor_id INT NOT NULL,
        topic VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        goals TEXT NULL,
        status VARCHAR(30) DEFAULT 'pending',
        reply TEXT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    """)
    print("guidance_requests table checked/created")
except Exception as e:
    print(f"guidance_requests table: {e}")

print("Migration script completed successfully.")
