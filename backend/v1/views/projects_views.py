from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from ..mixins import AdminWriteCompanyReadMixin, CreatedByMixin
from ..models import Project
from ..serializers import ProjectSerializer


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
            # Busca o projeto pelo ID, garantindo que a empresa seja detentora OU participante
            project = Project.objects.distinct().get(
                Q(id=pk)
                & (
                    Q(company=request.user.company)
                    | Q(events__participating_companies__company=request.user.company)
                )
            )
        except Project.DoesNotExist:
            raise PermissionDenied(
                "Projeto não encontrado ou você não tem permissão de acesso."
            )

        serializer = ProjectSerializer(project)
        return Response(serializer.data)
