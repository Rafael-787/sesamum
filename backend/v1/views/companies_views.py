from models import Company
from rest_framework import viewsets

from ..permissions import IsAdmin
from ..serializers import CompanySerializer


class CompanySetView(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAdmin]
