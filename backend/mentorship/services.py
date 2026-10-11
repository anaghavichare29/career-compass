"""
Who is whose mentor?

A student is connected to a mentor when they have a guidance request to that
mentor that has not been rejected. `guidance_requests.mentor_id` normally holds
the mentor's professional_id, but older rows may hold the mentor's user_id, so
both are understood here.
"""
from django.db import connection

from .models import GuidanceRequest


def mentor_identifiers(mentor_user_id):
    """All ids a mentor can appear under in guidance_requests.mentor_id."""
    ids = {int(mentor_user_id)}
    with connection.cursor() as cursor:
        cursor.execute("SELECT professional_id FROM professionals WHERE user_id = %s", [mentor_user_id])
        row = cursor.fetchone()
        if row:
            ids.add(int(row[0]))
    return ids


def student_ids_for_mentor(mentor_user_id):
    """User ids of the students connected to this mentor."""
    ids = mentor_identifiers(mentor_user_id)
    return set(
        GuidanceRequest.objects.filter(mentor_id__in=ids)
        .exclude(status="rejected")
        .values_list("student_id", flat=True)
    )


def mentors_for_student(student_id):
    """
    Mentors connected to a student:
    [{userId, professionalId, name, company, designation, status}]
    """
    requests = list(
        GuidanceRequest.objects.filter(student_id=student_id)
        .exclude(status="rejected")
        .order_by("-created_at")
    )
    mentors, seen = [], set()
    with connection.cursor() as cursor:
        for req in requests:
            cursor.execute(
                """
                SELECT p.professional_id, p.user_id, u.first_name, u.last_name, p.company, p.designation
                FROM professionals p JOIN users u ON u.user_id = p.user_id
                WHERE p.professional_id = %s
                """,
                [req.mentor_id],
            )
            row = cursor.fetchone()
            if not row:  # legacy rows that stored the mentor's user_id
                cursor.execute(
                    """
                    SELECT p.professional_id, p.user_id, u.first_name, u.last_name, p.company, p.designation
                    FROM professionals p JOIN users u ON u.user_id = p.user_id
                    WHERE p.user_id = %s
                    """,
                    [req.mentor_id],
                )
                row = cursor.fetchone()
            if not row or row[1] in seen:
                continue
            seen.add(row[1])
            mentors.append({
                "professionalId": row[0],
                "userId": row[1],
                "name": f"{row[2]} {row[3] or ''}".strip(),
                "company": row[4] or "",
                "designation": row[5] or "",
                "status": req.status,
            })
    return mentors


def notify(user_id, title, message, kind):
    """Best-effort in-app notification (never breaks the calling request)."""
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO notifications (user_id, title, message, type) VALUES (%s, %s, %s, %s)",
                [user_id, title, message, kind],
            )
    except Exception:
        pass


def notify_student_mentors(student_id, title, message, kind):
    """Notify every connected mentor. Returns how many mentors were notified."""
    mentors = mentors_for_student(student_id)
    for m in mentors:
        notify(m["userId"], title, message, kind)
    return len(mentors)
