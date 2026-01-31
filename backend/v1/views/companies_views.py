from rest_framework import viewsets

from ..mixins import CreatedByMixin
from ..models import Company
from ..permissions import IsControlOrAdmin
from ..serializers import CompanySerializer


class CompanySetView(CreatedByMixin, viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsControlOrAdmin]
