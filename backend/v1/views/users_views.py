from rest_framework import viewsets

from ..mixins import CreatedByMixin
from ..models import User
from ..permissions import IsAdmin
from ..serializers import UserSerializer


class UserSetView(CreatedByMixin, viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
