from asyncio.windows_events import NULL

from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, status, views, viewsets
from rest_framework.response import Response

from ..mixins import AdminWriteCompanyReadMixin, CreatedByMixin
from ..models import Event, EventsCompany, EventsStaff, Staff
from ..permissions import IsAdmin, IsCompanyOrAdmin
from ..serializers import (
    EventsCompanySerializer,
    EventSerializer,
    EventsStaffSerializer,
)
from ..utils import sanitize_digits


class EventViewSet(CreatedByMixin, AdminWriteCompanyReadMixin, viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["status"]
    search_fields = ["name"]

    def get_queryset(self):
        user = self.request.user
        if user.role in ["admin", "control"]:
            return Event.objects.all()
        return Event.objects.filter(project__company=user.company)

    def retrieve(self, request, pk=None):
        """Detalhes de um Evento"""
        try:
            if request.user.role in ["admin", "control"]:
                event = Event.objects.get(id=pk)
            else:
                event = Event.objects.get(id=pk, project__company=request.user.company)
        except Event.DoesNotExist:
            return Response(status=404)

        serializer = EventSerializer(event)
        return Response(serializer.data)


class EventOverviewView(generics.RetrieveAPIView):
    # Implementação simplificada do overview
    queryset = Event.objects.all()

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Lógica customizada de agregação aqui
        staff_count = instance.event_staffs.count()
        return Response(
            {
                "name": instance.name,
                "total_staff": staff_count,
                "status": instance.status,
            }
        )
