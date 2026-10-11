"""Real numbers for the admin dashboard and reports (replaces hardcoded values)."""
import datetime
from collections import Counter

from django.utils import timezone

from accounts.models import User
from assessments.models import AssessmentSubmission
from careers.models import CareerRecommendation
from mentorship.models import GuidanceRequest
from quizzes.models import QuizAttempt


def weekly_activity(days=7):
    """New sign-ups and completed assessments for each of the last `days` days."""
    today = timezone.localdate()
    out = []
    for offset in range(days - 1, -1, -1):
        d = today - datetime.timedelta(days=offset)
        out.append({
            "day": d.strftime("%a"),
            "signups": User.objects.filter(created_at__date=d).count(),
            "assessments": AssessmentSubmission.objects.filter(submitted_at__date=d).count(),
        })
    return out


def stat_hints(pending_experts):
    """Short, truthful sub-labels for the four dashboard stat cards."""
    week_ago = timezone.now() - datetime.timedelta(days=7)
    new_students = User.objects.filter(role="STUDENT", created_at__gte=week_ago).count()
    assessed = AssessmentSubmission.objects.values("user_id").distinct().count()
    return {
        "students": f"{new_students} new this week",
        "experts": f"{pending_experts} pending verification",
        "quizzes": f"{QuizAttempt.objects.count()} attempts taken",
        "assessments": f"{assessed} student{'' if assessed == 1 else 's'} assessed",
    }


def career_distribution(limit=5):
    """Share of students per top career match (each student counted once)."""
    top = {}
    for rec in CareerRecommendation.objects.order_by("user_id", "-match_percent", "id"):
        top.setdefault(rec.user_id, rec.career_name)
    if not top:
        return []
    counts = Counter(top.values()).most_common(limit)
    total = len(top)
    return [{"domain": name, "percentage": round(n / total * 100)} for name, n in counts]


def monthly_engagement(months=4):
    """Assessments, quiz attempts and guidance requests per calendar month."""
    now = timezone.localdate().replace(day=1)
    starts = []
    y, m = now.year, now.month
    for _ in range(months):
        starts.append(datetime.date(y, m, 1))
        m -= 1
        if m == 0:
            y, m = y - 1, 12
    starts.reverse()

    def bucket(qs, field):
        c = Counter()
        for dt in qs.values_list(field, flat=True):
            if dt:
                c[(dt.year, dt.month)] += 1
        return c

    a = bucket(AssessmentSubmission.objects.all(), "submitted_at")
    q = bucket(QuizAttempt.objects.all(), "completed_at")
    g = bucket(GuidanceRequest.objects.all(), "created_at")
    return [{
        "month": s.strftime("%b %Y"),
        "assessments": a[(s.year, s.month)],
        "quizzes": q[(s.year, s.month)],
        "guidance": g[(s.year, s.month)],
    } for s in starts]
