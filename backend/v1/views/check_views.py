from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets

from ..models import Check, Event, EventsStaff
from ..permissions import IsControlOrAdmin
from ..serializers import CheckSerializer, EventSerializer, EventsStaffControlSerializer


class CheckViewSet(viewsets.ModelViewSet):
    """Endpoint principal para Credenciamento, Check-in e Check-out"""

    serializer_class = CheckSerializer
    permission_classes = [IsControlOrAdmin]
    http_method_names = ["post", "get", "head"]  # Focado em ações

    def get_queryset(self):
        return Check.objects.all().order_by("-timestamp")


class CheckSearchStaffView(viewsets.ReadOnlyModelViewSet):
    """Endpoint para busca de staffs pelo nome ou cpf."""

    queryset = EventsStaff.objects.all()
    serializer_class = EventsStaffControlSerializer
    permission_classes = [IsControlOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = []
    search_fields = ["staff__name", "staff__cpf"]

    def get_queryset(self):
        event_id = self.kwargs.get("event_id")
        get_object_or_404(Event, id=event_id)
        return EventsStaff.objects.filter(event=event_id)


class CheckEventsView(viewsets.ReadOnlyModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsControlOrAdmin]
