from rest_framework import viewsets

from ..mixins import AdminWriteCompanyReadMixin, CreatedByMixin
from ..models import Project
from ..serializers import ProjectSerializer


class ProjectViewSet(CreatedByMixin, AdminWriteCompanyReadMixin, viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
