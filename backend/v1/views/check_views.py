from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from ..models import Check, Event, EventsStaff
from ..permissions import IsControlOrAdmin
from ..serializers import CheckSerializer, EventSerializer, EventsStaffControlSerializer
from ..zpl import generate_zpl_label


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
        return EventsStaff.objects.filter(event=event_id).select_related("staff")

class CheckSearchIDView(viewsets.ReadOnlyModelViewSet):
    """Endpoint para busca de staffs pelo id do eventsStaff (QRcode)."""

    queryset = EventsStaff.objects.all()
    serializer_class = EventsStaffControlSerializer
    permission_classes = [IsControlOrAdmin]

    lookup_field = "id"

    @action(detail=True, methods=['get'], url_path='print-label')
    def print_label(self, request, id=None, **kwargs):
        # Aqui get_object() retorna corretamente um EventsStaff
        event_staff = self.get_object()
        
        name = event_staff.staff.name
        # Como EventsStaff não tem 'role' no model, usar valor fixo ou buscar de EventsCompany se aplicável
        role = "Staff" 
        qr_data = str(event_staff.id)
        
        label_data = generate_zpl_label(name=name, role=role, qr_data=qr_data)
        
        return Response({"label_data": label_data})

class CheckEventsView(viewsets.ReadOnlyModelViewSet):
    queryset = Event.objects.filter(status="open")
    serializer_class = EventSerializer
    permission_classes = [IsControlOrAdmin]
