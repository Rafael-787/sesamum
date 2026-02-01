from asyncio.windows_events import NULL

from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, status, views, viewsets
from rest_framework.response import Response

from ..mixins import AdminWriteCompanyReadMixin, CreatedByMixin
from ..models import Event, EventsCompany, EventsStaff, Staff
from ..permissions import IsAdmin, IsCompanyOrAdmin
from ..serializers import EventsCompanySerializer, EventSerializer
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


class EventsCompanyView(views.APIView):
    queryset = EventsCompany.objects.all()
    serializer_class = EventsCompanySerializer
    permission_classes = [IsAdmin]

    def get_object(self, event_id, company_id):
        return get_object_or_404(
            EventsCompany, event_id=event_id, company_id=company_id
        )

    def post(self, request, event_id, company_id):
        serializer = EventsCompanySerializer(data=request.data)

        if EventsCompany.objects.filter(
            event_id=event_id, company_id=company_id
        ).exists():
            return Response(
                {"detail": "Empresa já atribuída a esse evento."}, status=400
            )

        if serializer.is_valid():
            serializer.save(event_id=event_id, company_id=company_id)
            return Response(
                {"detail": "Empresa atribuída com sucesso."},
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, event_id, company_id):
        # Busca a relação entre event_id e company_id
        relacao = self.get_object(event_id, company_id)

        serializer = EventsCompanySerializer(relacao, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(
                {"detail": "Atualizado com sucesso."}, status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, event_id, company_id):
        # Aproveitando o padrão para deletar a relação
        relacao = self.get_object(event_id, company_id)
        relacao.delete()
        return Response(
            status=status.HTTP_204_NO_CONTENT,
        )


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
