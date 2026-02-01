from .permissions import IsAdmin, IsCompanyOrAdmin, IsControlOrAdmin


class AdminWriteCompanyReadMixin:
    """
    Mixin para garantir que apenas Admins escrevam e alterem,
    mas usuários da empresa ou controle possam ler.
    """

    def get_permissions(self):
        # Ações de escrita
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdmin()]

        # Ações de leitura (list, retrieve)
        return [(IsCompanyOrAdmin | IsControlOrAdmin)()]


class CreatedByMixin:
    """Adiciona o id do usuário extraído do JWT como criador (created_by)"""

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
