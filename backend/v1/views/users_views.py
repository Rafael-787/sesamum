from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets

from ..mixins import CreatedByMixin
from ..models import User
from ..permissions import IsAdmin
from ..serializers import UserSerializer


class UserSetView(CreatedByMixin, viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["role"]
    search_fields = ["name", "email"]
