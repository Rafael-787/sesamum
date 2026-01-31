from rest_framework import generics, status, views, viewsets
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from ..mixins import AdminWriteCompanyReadMixin, CreatedByMixin
from ..models import Event, EventsStaff, Staff
from ..permissions import IsAdmin, IsCompanyOrAdmin, IsControlOrAdmin
from ..serializers import EventSerializer
from ..utils import sanitize_digits


class EventViewSet(CreatedByMixin, AdminWriteCompanyReadMixin, viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

    def list(self, request):
        """Lista de Eventos"""
        if request.user.role == "admin" or request.user.role == "control":
            events = Event.objects
        else:
            events = Event.objects.filter(project__company=request.user.company)
        serializer = EventSerializer(events, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        """Detalhes de um Evento"""
        try:
            if request.user.role == "admin" or request.user.role == "control":
                event = Event.objects.get(id=pk)
            else:
                event = Event.objects.get(id=pk, project__company=request.user.company)
        except Event.DoesNotExist:
            return Response(status=404)

        serializer = EventSerializer(event)
        return Response(serializer.data)


class EventStaffBulkView(views.APIView):
    permission_classes = [IsCompanyOrAdmin]

    def post(self, request, event_id):
        """Bulk Upsert de Staffs para um evento"""
        try:
            event = Event.objects.get(id=event_id)
        except Event.DoesNotExist:
            return Response(status=404)

        # Validação de Permissão: O evento deve pertencer à company do usuário
        if event.project.company != request.user.company:
            return Response(
                {"error": "Permission denied for this event"},
                status=status.HTTP_403_FORBIDDEN,
            )

        staff_list = request.data.get("staffs", [])
        created_count = 0

        for item in staff_list:
            cpf = sanitize_digits(item.get("cpf"))
            name = item.get("name")

            # 1. Upsert Staff na Company do User
            staff, _ = Staff.objects.update_or_create(
                company=request.user.company,
                cpf=cpf,
                defaults={"name": name, "created_by": request.user},
            )

            # 2. Vincular ao Evento
            _, created = EventsStaff.objects.get_or_create(
                event=event,
                staff_cpf=cpf,
                defaults={"staff": staff, "created_by": request.user},
            )
            if created:
                created_count += 1

        return Response(
            {"message": f"{created_count} staffs linked to event"}, status=200
        )


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
