from django.db.models import F, Q
from django.shortcuts import get_object_or_404
from rest_framework import status, views
from rest_framework.exceptions import PermissionDenied
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
        # Admin atribui sem nenhuma restrição (user.company é irrelevante para Admin)
        if request.user.role != "admin":
            # Se a empresa não for dona do projeto do qual o evento faz parte
            if not Event.objects.filter(project__company=request.user.company).exists():
                # Verifica se a empresa foi atribuída ao evento
                if not EventsCompany.objects.filter(
                    event=event_id, company=request.user.company
                ).exists():
                    raise PermissionDenied("Empresa não atribuída a esse evento.")

            if not Staff.objects.filter(
                pk=staff_id, company=request.user.company
            ).exists():
                raise PermissionDenied("Staff não existe nessa empresa.")

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

    def has_permission(self, request, event_id):
        # Admin atribui sem nenhuma restrição (user.company é irrelevante para Admin)
        if request.user.role != "admin":
            # Se a empresa não for dona do projeto do qual o evento faz parte
            if not Event.objects.filter(project__company=request.user.company).exists():
                # Verifica se a empresa foi atribuída ao evento
                if not EventsCompany.objects.filter(
                    event=event_id, company=request.user.company
                ).exists():
                    raise PermissionDenied("Empresa não atribuída a esse evento.")

    def post(self, request, event_id):
        """Bulk Upsert de Staffs para um evento"""
        try:
            event = Event.objects.get(id=event_id)
        except Event.DoesNotExist:
            return Response(status=404)

        # Validação de Permissão: A company do usuário deve ser dona ou participante
        self.has_permission(request, event_id)

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
            {"message": f"{created_count} staffs atribuídos ao evento."}, status=200
        )
