from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import mixins, viewsets

from ..mixins import CreatedByMixin
from ..models import UserInvite
from ..permissions import IsAdmin
from ..serializers import InviteSerializer


class InviteViewSet(
    CreatedByMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    # Retorna apenas os convites que não foram usados
    queryset = UserInvite.objects.filter(used_by__isnull=True)
    serializer_class = InviteSerializer
    permission_classes = [IsAdmin]
