import csv
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils.timezone import localtime
from rest_framework import views
from rest_framework.permissions import IsAuthenticated

from ..models import Event, EventsStaff

class EventExportReportView(views.APIView):
    permission_classes = [IsAuthenticated] # Ajuste para a sua permissão (ex: IsAdmin ou a sua lógica customizada)

    def get(self, request, event_id):
        # Valida a existência do evento
        event = get_object_or_404(Event, id=event_id)

        # Busca os staffs otimizando as queries com select_related e prefetch_related
        events_staffs = EventsStaff.objects.filter(event=event).select_related(
            'staff', 'staff__company'
        ).prefetch_related(
            'checks_history'
        )

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
        for es in events_staffs:
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