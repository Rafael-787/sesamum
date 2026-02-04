from imaplib import Commands
from multiprocessing import Event

from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from ..mixins import AdminWriteCompanyReadMixin, CreatedByMixin
from ..models import Company, Event, Project
from ..serializers import CompanySerializer, EventSerializer, ProjectSerializer


class ProjectViewSet(CreatedByMixin, AdminWriteCompanyReadMixin, viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["status"]
    search_fields = ["name"]

    def get_queryset(self):
        user = self.request.user
        if user.role in ["admin", "control"]:
            return Project.objects.all()
        return Project.objects.filter(
            # Projetos que a empresa detém
            Q(company=user.company)
            | Q(
                # Projetos com eventos onde a empresa participa
                events__participating_companies__company=user.company
            )
        ).distinct()

    def retrieve(self, request, pk=None):
        """Detalhes de um Projeto"""
        try:
            # Libera todos os projetos para admin ou control
            if request.user.role in ["admin", "control"]:
                project = Project.objects.distinct().get(id=pk)
            else:
                # Busca o projeto pelo ID, garantindo que a empresa seja detentora OU participante
                project = Project.objects.distinct().get(
                    Q(id=pk)
                    & (
                        Q(company=request.user.company)
                        | Q(
                            events__participating_companies__company=request.user.company
                        )
                    )
                )
        except Project.DoesNotExist:
            raise PermissionDenied(
                "Projeto não encontrado ou você não tem permissão de acesso."
            )

        serializer = ProjectSerializer(project)
        return Response(serializer.data)


class ProjectEventsTabView(viewsets.ReadOnlyModelViewSet):
    serializer_class = EventSerializer

    def _has_permission(self, user, project_id):

        # Define se é owner do projeto
        is_owner = Project.objects.filter(id=project_id, company=user.company).exists()
        return is_owner or (user.role in ["admin", "control"])

    def get_queryset(self):
        project_id = self.kwargs.get("project_id")
        user = self.request.user
        if project_id:
            if self._has_permission(user, project_id):
                # Filtra todo os eventos que estão atrelados ao projeto
                return Event.objects.filter(project=project_id)
            else:
                # Filtra os eventos que estão no evento e a empresa do usuário está atribuída
                return Event.objects.filter(
                    project=project_id, participating_companies__company=user.company
                )
        return Event.objects.none()


class ProjectCompaniesTabView(viewsets.ReadOnlyModelViewSet):
    serializer_class = CompanySerializer

    def _has_permission(self, user, project_id):

        # Define se é owner do projeto
        is_owner = Project.objects.filter(id=project_id, company=user.company).exists()
        return is_owner or (user.role in ["admin", "control"])

    def get_queryset(self):
        project_id = self.kwargs.get("project_id")
        user = self.request.user
        if project_id:
            if self._has_permission(user, project_id):
                # Filtra todas as empresas que fazem parte de algum evento do projeto
                return Company.objects.filter(
                    eventscompany__event__project=project_id
                ).distinct()
            else:
                # se não admin,control ou owner, acesso proibido
                raise PermissionDenied("Você não tem permissão de acessar essa seção.")

        return Company.objects.none()
