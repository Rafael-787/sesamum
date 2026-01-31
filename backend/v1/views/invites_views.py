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
    queryset = UserInvite.objects.all()
    serializer_class = InviteSerializer
    permission_classes = [IsAdmin]
