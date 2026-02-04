from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from v1.views import (
    AuthMe,
    CheckSearchStaffView,
    CheckViewSet,
    CompanySetView,
    DashboardMetricsView,
    EventCompaniesTabView,
    EventOverviewView,
    EventsCompanyView,
    EventsStaffView,
    EventStaffBulkView,
    EventStaffsTabView,
    EventViewSet,
    GoogleLoginView,
    InviteViewSet,
    ProjectViewSet,
    RegisterWithInviteView,
    StaffViewSet,
    UserSetView,
)

router = DefaultRouter()
router.register(r"staffs", StaffViewSet, basename="staff")
router.register(r"checks", CheckViewSet, basename="check")
router.register(r"events", EventViewSet, basename="event")
router.register(r"companies", CompanySetView, basename="company")
router.register(r"users", UserSetView, basename="user")
router.register(r"projects", ProjectViewSet, basename="project")
router.register(r"invites", InviteViewSet, basename="invite")
# Adicione ViewSets de Company, Project, Event conforme necessário para CRUD básico

urlpatterns = [
    path("", include(router.urls)),
    # Auth
    path("auth/google/login/", GoogleLoginView.as_view(), name="google-login"),
    path(
        "auth/google/register/",
        RegisterWithInviteView.as_view(),
        name="google-register",
    ),
    path("auth/me/", AuthMe.as_view(), name="auth-me"),
    # Dashboard
    path(
        "dashboard/metrics/", DashboardMetricsView.as_view(), name="dashboard-metrics"
    ),
    # Events
    path(
        "events/<int:pk>/overview/",
        EventOverviewView.as_view(),
        name="event-overview",
    ),
    path(
        "events/<int:event_id>/staffs/",
        EventStaffsTabView.as_view({"get": "list"}),
        name="event-staffs-tab",
    ),
    path(
        "events/<int:event_id>/companies/",
        EventCompaniesTabView.as_view({"get": "list"}),
        name="event-staffs-tab",
    ),
    path(  # Atribuir empresa a evento
        "events/<int:event_id>/company/<int:company_id>/",
        EventsCompanyView.as_view(),
        name="event-companies",
    ),
    path(  # Atribuir staff a evento
        "events/<int:event_id>/staff/<int:staff_id>/",
        EventsStaffView.as_view(),
        name="event-staffs",
    ),
    path(  # Atribuir lote de staffs a evento
        "events/<int:event_id>/staff/bulk/",
        EventStaffBulkView.as_view(),
        name="event-staff-bulk",
    ),
    # Project
    # Checks
    path(
        "checks/<int:event_id>/events-staff/",
        CheckSearchStaffView.as_view({"get": "list"}),
        name="list-events-staffs",
    ),
    # Router
    path("", include(router.urls)),
]
