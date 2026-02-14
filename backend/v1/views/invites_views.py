from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import mixins, viewsets

from ..mixins import CreatedByMixin
from ..models import UserInvite
from ..permissions import IsAdmin, AllowAny
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

"""
    def get_permissions(self):
        
        Instancia e retorna a lista de permissões que esta view requer.
        
        if self.action == 'retrieve':
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdmin]
        
        return [permission() for permission in permission_classes]
"""