from socket import has_ipv6
from tabnanny import check

from django.db.models import Count, F, Q
from django.db.models.expressions import ResolvedOuterRef
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, viewsets
from rest_framework.response import Response
from rest_framework.views import PermissionDenied

from ..mixins import AdminWriteCompanyReadMixin, CreatedByMixin
from ..models import (
    Check,
    CheckAction,
    Company,
    Event,
    EventsCompany,
    EventsStaff,
    Staff,
)
from ..serializers import (
    CheckOverviewEventsTabSerializer,
    CompanySerializer,
    EventsCompanyOverviewEventsTabSerializer,
    EventSerializer,
    StaffSerializer,
)


class EventViewSet(CreatedByMixin, AdminWriteCompanyReadMixin, viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["status"]
    search_fields = ["name"]

    def get_queryset(self):
        user = self.request.user
        if user.role in ["admin", "control"]:
            return Event.objects.filter(project__isnull=True)
        return Event.objects.filter(
            Q(project__isnull=True),
            Q(participating_companies__company=user.company)
            | Q(project__company=user.company),
        ).distinct()

    def retrieve(self, request, pk=None):
        """Detalhes de um Evento"""
        try:
            if request.user.role in ["admin", "control"]:
                event = Event.objects.get(id=pk)
            else:
                event = Event.objects.get(
                    Q(id=pk),
                    Q(participating_companies__company=request.user.company)
                    | Q(project__company=request.user.company),
                )
        except Event.DoesNotExist:
            return Response(status=404)

        serializer = EventSerializer(event)
        return Response(serializer.data)


class EventOverviewView(generics.RetrieveAPIView):
    queryset = Event.objects.all()

    def _user_event_relation(self, event_id):
        user = self.request.user
        return EventsCompany.objects.filter(
            event=event_id, company=user.company
        ).first()

    def _has_permission(self, event_id):
        event_id = self.kwargs.get("pk")
        user = self.request.user
        user_event_relation = self._user_event_relation(event_id)

        # Define se é produção
        is_production = (
            user_event_relation and user_event_relation.role == "production"
        ) or Event.objects.filter(id=event_id, project__company=user.company).exists()
        return is_production or (user.role in ["admin", "control"])

    def get_queryset_empresas(self):
        event_id = self.kwargs.get("pk")
        condicao_empresa = Q(event__event_staffs__staff__company=F("company"))
        condicao_registration = Q(
            event__event_staffs__checks_history__action="registration"
        )
        condicao_checkin = Q(event__event_staffs__checks_history__action="check-in")
        condicao_out = Q(event__event_staffs__checks_history__action="check-out")
        return (
            EventsCompany.objects.filter(event=event_id)
            .annotate(
                checkin_count=Count(
                    "event__event_staffs__checks_history",
                    filter=condicao_empresa & condicao_checkin,
                    distinct=True,
                ),
                checkout_count=Count(
                    "event__event_staffs__checks_history",
                    filter=condicao_empresa & condicao_out,
                    distinct=True,
                ),
                registration_count=Count(
                    "event__event_staffs__checks_history",
                    filter=condicao_empresa & condicao_registration,
                    distinct=True,
                ),
            )
            .select_related("company")
        )

    def _get_metrics(self, event_id):
        """
        Obtém de acordo com as permições:
            - total_staffs
            - total_empresas
            - staff_limit
        """
        instance = self.get_object()
        staff_queryset = instance.event_staffs.all()
        has_permission = self._has_permission(event_id)
        user = self.request.user

        if not has_permission:
            # Se não for admin ou produção filtra staffs pela empresa.
            staff_queryset = staff_queryset.filter(staff__company=user.company)
            try:
                staff_limit = EventsCompany.objects.get(
                    event=event_id, company=user.company
                ).staff_limit
            except EventsCompany.DoesNotExist:
                staff_limit = "N/A"
        else:  # Se for admin ou produção
            companies_count = instance.participating_companies.count()

        data = {
            "metrics": {
                "total_staff": staff_queryset.count(),  # Staffs atribuídos para o evento
                **(
                    {"total_companies": companies_count}
                    if has_permission
                    else {"staff_limit": staff_limit}
                ),
            }
        }

        return data

    def retrieve(self, request, *args, **kwargs):
        event_id = self.kwargs.get("pk")

        if not self._has_permission(event_id) and not self._user_event_relation(
            event_id
        ):
            raise PermissionDenied("Você não possui autorização para acessar.")

        data = self._get_metrics(event_id)

        empresas_qs = self.get_queryset_empresas()
        serializer = EventsCompanyOverviewEventsTabSerializer(empresas_qs, many=True)
        data["companies"] = serializer.data

        return Response(data)


class EventStaffsTabView(viewsets.ReadOnlyModelViewSet):
    serializer_class = StaffSerializer

    def get_queryset(self):
        event_id = self.kwargs.get("event_id")
        user = self.request.user
        if event_id:
            if user.role in ["admin", "control"]:
                # Filtra os staffs que possuem uma entrada na tabela EventsStaff para o evento
                return Staff.objects.filter(eventsstaff__event=event_id).distinct()
            else:
                # Filtra os staffs que estão atribuídos para o evento pela empresa do user
                return Staff.objects.filter(
                    eventsstaff__event=event_id, company=user.company
                ).distinct()
        return Staff.objects.none()


class EventCompaniesTabView(viewsets.ReadOnlyModelViewSet):
    serializer_class = CompanySerializer

    def get_queryset(self):
        event_id = self.kwargs.get("event_id")
        user = self.request.user
        # Verificar se o usuário é de uma empresa cadastrada como produção no evento ou dona do projeto
        is_production = (
            EventsCompany.objects.filter(
                event=event_id, company=user.company, role="production"
            ).exists()
            # Verifica company_owner do projeto
            or Event.objects.filter(id=event_id, project__company=user.company).exists()
        )
        if event_id:
            if user.role in ["admin", "control"] or is_production:
                # Filtra os staffs que possuem uma entrada na tabela EventsStaff para o evento
                return Company.objects.filter(eventscompany__event=event_id).distinct()
            else:
                raise PermissionDenied("Você não possui autorização para essa ação.")
        return Company.objects.none()
