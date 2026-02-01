from django.db.models.functions.math import Power
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
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
        return Project.objects.filter(company=user.company)

    def retrieve(self, request, pk=None):
        """Detalhes de um Projeto"""
        try:
            if request.user.role in ["admin", "control"]:
                event = Project.objects.get(id=pk)
            else:
                event = Project.objects.get(
                    id=pk, project__company=request.user.company
                )
        except Project.DoesNotExist:
            return Response(status=404)

        serializer = ProjectSerializer(event)
        return Response(serializer.data)
