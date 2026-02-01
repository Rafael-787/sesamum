from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets

from ..models import Staff
from ..permissions import IsCompanyOrAdmin
from ..serializers import (
    StaffSerializer,
)


class StaffViewSet(viewsets.ModelViewSet):
    serializer_class = StaffSerializer
    permission_classes = [IsCompanyOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ["name", "cpf"]

    def get_queryset(self):
        user = self.request.user
        if user.role == "admin":
            return Staff.objects.all()
        return Staff.objects.filter(company=user.company)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, company=self.request.user.company)
