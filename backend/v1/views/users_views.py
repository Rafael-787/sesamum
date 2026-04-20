from django.db.models import Count, F
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from ..mixins import CreatedByMixin
from ..models import User, Check
from ..permissions import IsAdmin
from ..serializers import UserSerializer


class UserSetView(CreatedByMixin, viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["role"]
    search_fields = ["name", "email"]

    @action(detail=False, methods=['get'], url_path='checks-count')
    def checks_count(self, request):
        """
        Retorna a contagem de checks realizados agrupados por usuário.
        Obrigatório: ?event=<event_id>
        Opcional: ?action=<action_type>
        """
        event_id = request.query_params.get("event")
        action_type = request.query_params.get("action")

        if not event_id:
            return Response(
                {"detail": "O parâmetro 'event' é obrigatório para esta busca."}, 
                status=400
            )

        # Inicia a query nos checks filtrando pelo evento
        checks_query = Check.objects.filter(events_staff__event_id=event_id)

        # Filtra pelo tipo de ação (registration, check-in, check-out), se fornecido
        if action_type:
            checks_query = checks_query.filter(action=action_type)

        # Agrupa pelo nome do usuário responsável pela ação (user_control) 
        # e conta quantos checks ele fez.
        data = checks_query.values(
            user=F('user_control__name')  # Renomeia a coluna para 'user' no JSON final
        ).annotate(
            quantidade=Count('id')
        ).order_by('-quantidade')  # Ordena dos usuários que mais fizeram checks para os que menos fizeram

        # Converte o QuerySet avaliado para uma lista padrão do Python e retorna
        return Response(list(data))