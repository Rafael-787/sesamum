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


"""
def get_permissions(self):

        Libera o 'retrieve' para qualquer pessoa (público)
        e restringe o restante para Admins.

        if self.action == 'retrieve':
            # Retornar uma lista vazia desativa as restrições para esta action
            # O DRF interpreta isso como "acesso livre"
            return []

        # Para todas as outras ações (list, create, destroy), exige Admin
        return [IsAdmin()]
        """
