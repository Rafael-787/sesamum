from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from v1.views import (
    CheckViewSet,
    CompanySetView,
    DashboardMetricsView,
    EventOverviewView,
    EventStaffBulkView,
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
    path("admin/", admin.site.urls),
    # Auth
    path("auth/google/login/", GoogleLoginView.as_view(), name="google-login"),
    path(
        "auth/google/register/",
        RegisterWithInviteView.as_view(),
        name="google-register",
    ),
    # Dashboard
    path(
        "dashboard/metrics/", DashboardMetricsView.as_view(), name="dashboard-metrics"
    ),
    # Events
    path(
        "events/<int:event_id>/staff/bulk/",
        EventStaffBulkView.as_view(),
        name="event-staff-bulk",
    ),
    path(
        "events/<int:pk>/overview/", EventOverviewView.as_view(), name="event-overview"
    ),
    # Router
    path("", include(router.urls)),
]
