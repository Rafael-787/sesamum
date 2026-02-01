from django.shortcuts import get_object_or_404
from rest_framework import status, views
from rest_framework.response import Response

from ..models import Event, EventsCompany, EventsStaff, Staff
from ..permissions import IsCompanyOrAdmin
from ..serializers import EventsStaffSerializer
from ..utils import sanitize_digits


class EventsStaffView(views.APIView):
    queryset = EventsStaff.objects.all()
    serializer_class = EventsStaffSerializer
    permission_classes = [IsCompanyOrAdmin]

    def get_object(self, event_id, staff_id):
        return get_object_or_404(EventsStaff, event_id=event_id, staff_id=staff_id)

    def _validate_staff_event_permissions(self, request, event_id, staff_id):
        """
        Verifica se o staff é pertencente a empresa e se a empresa foi convocada para o evento.
        """

        if request.user.role != "admin":
            if not EventsCompany.objects.filter(
                event=event_id, company=request.user.company
            ).exists():
                return Response(
                    {"detail": "Empresa não atribuída a esse evento."}, status=403
                )

            if not Staff.objects.filter(
                pk=staff_id, company=request.user.company
            ).exists():
                return Response(
                    {"detail": "Staff não existe nessa empresa."}, status=403
                )

    def post(self, request, event_id, staff_id):
        # verificação staff e event
        self._validate_staff_event_permissions(request, event_id, staff_id)

        serializer = EventsStaffSerializer(data=request.data)
        staff_cpf = get_object_or_404(Staff, pk=staff_id).cpf

        if EventsStaff.objects.filter(event_id=event_id, staff_id=staff_id).exists():
            return Response({"detail": "Staff já atribuído a esse evento."}, status=400)
        elif EventsStaff.objects.filter(
            event_id=event_id, staff_cpf=staff_cpf
        ).exists():
            return Response(
                {"detail": "Staff atribuído ao evento por outra empresa."}, status=400
            )

        if serializer.is_valid():
            serializer.save(
                event_id=event_id,
                staff_id=staff_id,
                staff_cpf=staff_cpf,
                created_by=request.user,
            )
            return Response(
                {"detail": "Staff atribuído com sucesso."},
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, event_id, staff_id):
        # verificação staff e event
        self._validate_staff_event_permissions(request, event_id, staff_id)

        relacao = get_object_or_404(EventsStaff, event_id=event_id, staff_id=staff_id)
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
