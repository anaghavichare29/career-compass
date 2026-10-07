from django.db import connection
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


class NotificationListView(APIView):
    """GET /api/notifications/?user_id=X"""

    def get(self, request):
        user_id = request.query_params.get("user_id")
        if not user_id:
            return Response({"detail": "user_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as cursor:
            cursor.execute("SELECT id, title, message, type, is_read, created_at FROM notifications WHERE user_id = %s ORDER BY created_at DESC", [user_id])
            rows = cursor.fetchall()

            if not rows:
                # Add default welcoming notifications
                defaults = [
                    (user_id, "Welcome to CareerCompass!", "Begin by taking your common career assessment to get tailored recommendations and roadmaps.", "system"),
                    (user_id, "Explore Industry Mentors", "Connect with verified software engineers, data scientists, and product leaders for guidance.", "mentorship"),
                ]
                for d in defaults:
                    cursor.execute("INSERT INTO notifications (user_id, title, message, type, is_read) VALUES (%s, %s, %s, %s, 0)", list(d))

                cursor.execute("SELECT id, title, message, type, is_read, created_at FROM notifications WHERE user_id = %s ORDER BY created_at DESC", [user_id])
                rows = cursor.fetchall()

        results = []
        for r in rows:
            results.append({
                "id": r[0],
                "title": r[1],
                "message": r[2],
                "type": r[3],
                "isRead": bool(r[4]),
                "createdAt": r[5].strftime("%d %b %Y, %I:%M %p") if r[5] else "",
            })

        return Response(results, status=status.HTTP_200_OK)


class NotificationMarkReadView(APIView):
    """POST /api/notifications/<id>/read/"""

    def post(self, request, pk):
        with connection.cursor() as cursor:
            cursor.execute("UPDATE notifications SET is_read = 1 WHERE id = %s", [pk])
        return Response({"detail": "Notification marked as read."}, status=status.HTTP_200_OK)


class NotificationMarkAllReadView(APIView):
    """POST /api/notifications/read-all/ body: { user_id }"""

    def post(self, request):
        user_id = request.data.get("user_id")
        if not user_id:
            return Response({"detail": "user_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as cursor:
            cursor.execute("UPDATE notifications SET is_read = 1 WHERE user_id = %s", [user_id])
        return Response({"detail": "All notifications marked as read."}, status=status.HTTP_200_OK)
