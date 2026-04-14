import csv
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils.timezone import localtime
from rest_framework import views
from rest_framework.permissions import IsAuthenticated

from ..models import Event, EventsStaff, EventsCompany, CompanyRole, UserRole

class EventExportReportView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, event_id):
        user = request.user
        event = get_object_or_404(Event, id=event_id)

        # Regras de acesso completo
        can_see_all = False
        if user.role == UserRole.ADMIN:
            can_see_all = True
        elif user.company:
            # É a empresa Owner do projeto?
            if event.project and event.project.company == user.company:
                can_see_all = True
            # É uma empresa participante como Production?
            elif EventsCompany.objects.filter(
                event=event, 
                company=user.company, 
                role=CompanyRole.PRODUCTION
            ).exists():
                can_see_all = True

        # Queryset base otimizado
        events_staffs_qs = EventsStaff.objects.filter(event=event).select_related(
            'staff', 'staff__company'
        ).prefetch_related(
            'checks_history'
        )

        # Aplica o filtro limitando à própria empresa caso não tenha acesso total
        if not can_see_all:
            if user.company:
                events_staffs_qs = events_staffs_qs.filter(staff__company=user.company)
            else:
                events_staffs_qs = events_staffs_qs.none()

        # Configura o response para forçar o download do arquivo CSV
        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = f'attachment; filename="relatorio_evento_{event.name}.csv"'

        # O uso de delimitador ';' facilita a abertura direta no Excel em português
        writer = csv.writer(response, delimiter=';')
        
        # Cabeçalho do CSV
        writer.writerow([
            'Nome', 
            'CPF', 
            'Empresa', 
            'Horário de Registro', 
            'Qtd Check-ins', 
            'Qtd Check-outs', 
            'Horários Check-ins', 
            'Horários Check-outs'
        ])

        # Processamento dos dados
        for es in events_staffs_qs:
            checks = es.checks_history.all().order_by('timestamp')
            
            registration_time = "-"
            checkins = []
            checkouts = []

            for check in checks:
                # Converte o timestamp UTC do banco para o fuso horário local
                local_time = localtime(check.timestamp).strftime('%d/%m/%Y %H:%M')
                
                if check.action == 'registration':
                    registration_time = local_time
                elif check.action == 'check-in':
                    checkins.append(local_time)
                elif check.action == 'check-out':
                    checkouts.append(local_time)

            # Escreve a linha do staff com os horários agregados
            cpf = "´" + es.staff.cpf
            writer.writerow([
                es.staff.name,
                cpf,
                es.staff.company.name,
                registration_time,
                len(checkins),
                len(checkouts),
                " | ".join(checkins),
                " | ".join(checkouts)
            ])

        return response