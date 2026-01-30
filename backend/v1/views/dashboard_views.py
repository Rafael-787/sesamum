from rest_framework import views
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import Company, Event, Project, User


class DashboardMetricsView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = {
            "activeEvents": Event.objects.filter(status="open").count(),
            "totalProjects": Project.objects.count(),
            "totalCompanies": Company.objects.count(),
            "totalUsers": User.objects.count(),
        }
        return Response(data)
