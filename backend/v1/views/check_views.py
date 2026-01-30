from rest_framework import viewsets

from ..models import Check
from ..permissions import IsControlOrAdmin
from ..serializers import (
    CheckSerializer,
)


class CheckViewSet(viewsets.ModelViewSet):
    """Endpoint principal para Credenciamento, Check-in e Check-out"""

    serializer_class = CheckSerializer
    permission_classes = [IsControlOrAdmin]
    http_method_names = ["post", "get", "head"]  # Focado em ações

    def get_queryset(self):
        return Check.objects.all().order_by("-timestamp")
