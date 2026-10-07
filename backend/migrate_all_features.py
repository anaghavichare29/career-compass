import os
import django
from dotenv import load_dotenv

load_dotenv()
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection

cursor = connection.cursor()

# 1. users: status column
try:
    cursor.execute("ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'Active';")
    print("Added status to users")
except Exception as e:
    print(f"users status: {e}")

# 2. platform_reports
try:
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS platform_reports (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        reporter_user_id INT NOT NULL,
        reported_user_id INT NULL,
        content_type VARCHAR(50) DEFAULT 'general',
        content_id INT NULL,
        reason VARCHAR(255) NOT NULL,
        description TEXT NULL,
        status VARCHAR(30) DEFAULT 'pending',
        admin_action TEXT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)
    print("platform_reports table ready")
except Exception as e:
    print(f"platform_reports: {e}")

# 3. platform_announcements
try:
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS platform_announcements (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        admin_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        target_role VARCHAR(30) DEFAULT 'ALL',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)
    print("platform_announcements table ready")
except Exception as e:
    print(f"platform_announcements: {e}")

# 4. platform_feedback
try:
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS platform_feedback (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        category VARCHAR(50) DEFAULT 'Platform Experience',
        rating INT DEFAULT 5,
        feedback_text TEXT NOT NULL,
        status VARCHAR(30) DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)
    print("platform_feedback table ready")
except Exception as e:
    print(f"platform_feedback: {e}")

# 5. learning_resources
try:
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS learning_resources (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        skill VARCHAR(100) NOT NULL,
        resource_type VARCHAR(50) DEFAULT 'Course',
        url VARCHAR(255) NOT NULL,
        provider VARCHAR(100) DEFAULT 'Coursera',
        level VARCHAR(30) DEFAULT 'Beginner',
        description TEXT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)
    print("learning_resources table ready")
except Exception as e:
    print(f"learning_resources: {e}")

# 6. Seed default learning resources if empty
cursor.execute("SELECT COUNT(*) FROM learning_resources")
if cursor.fetchone()[0] == 0:
    resources = [
        ("Python for Data Science and Machine Learning Bootcamp", "Python", "Course", "https://www.coursera.org/specializations/python", "Coursera", "Beginner", "Comprehensive Python programming for data science and analysis."),
        ("SQL Fundamentals & Advanced Querying Masterclass", "SQL", "Course", "https://www.udemy.com/course/the-complete-sql-bootcamp", "Udemy", "Beginner", "Master relational databases, complex joins, and window functions."),
        ("Machine Learning Specialization by Andrew Ng", "Machine Learning", "Specialization", "https://www.deeplearning.ai/program/machine-learning-specialization/", "DeepLearning.AI", "Intermediate", "Foundational ML algorithms, gradient descent, neural networks, and decision trees."),
        ("Full-Stack React & Node.js Developer Guide", "React", "Course", "https://fullstackopen.com/en/", "FullStackOpen", "Intermediate", "Build modern single-page web applications with React, Redux, and Node."),
        ("AWS Certified Solutions Architect Associate Prep", "AWS", "Certification Course", "https://aws.amazon.com/training/learn-about/architect/", "AWS Training", "Intermediate", "Cloud computing architecture, IAM, VPC, EC2, S3, and serverless architectures."),
        ("Google Cybersecurity Professional Certificate", "Cybersecurity", "Certificate", "https://grow.google/certificates/cybersecurity/", "Google / Coursera", "Beginner", "Hands-on threat analysis, SIEM tools, network security, and risk frameworks."),
        ("Product Management Foundations & Metrics", "Product Management", "Guide", "https://www.productplan.com/learn/", "ProductPlan", "All Levels", "Core product discovery, agile roadmapping, and KPI metrics tracking."),
    ]
    for r in resources:
        cursor.execute("""
            INSERT INTO learning_resources (title, skill, resource_type, url, provider, level, description)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, r)
    print("Seeded learning_resources")

# 7. Seed sample platform feedback if empty
cursor.execute("SELECT COUNT(*) FROM platform_feedback")
if cursor.fetchone()[0] == 0:
    sample_feedbacks = [
        (1, "Career Recommendations", 5, "The career assessment helped me discover Data Analyst paths that fit my background!"),
        (2, "Quizzes & Practice", 5, "The time-bound quizzes really helped simulate real technical screening tests."),
        (11, "Mentorship Experience", 5, "I love being able to review student submissions and provide actionable feedback on their code!"),
    ]
    for fb in sample_feedbacks:
        cursor.execute("""
            INSERT INTO platform_feedback (user_id, category, rating, feedback_text, status)
            VALUES (%s, %s, %s, %s, 'reviewed')
        """, fb)
    print("Seeded platform_feedback")

print("Migration completed successfully!")
