"""
URL configuration for api project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from v1.views import (
    GoogleLoginView, RegisterWithInviteView, 
    StaffViewSet, CheckViewSet, DashboardMetricsView, 
    EventStaffBulkView, EventOverviewView
)

router = DefaultRouter()
router.register(r'staffs', StaffViewSet, basename='staff')
router.register(r'checks', CheckViewSet, basename='check')
# Adicione ViewSets de Company, Project, Event conforme necessário para CRUD básico

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Auth
    path('auth/google/login/', GoogleLoginView.as_view(), name='google-login'),
    path('auth/google/register/', RegisterWithInviteView.as_view(), name='google-register'),
    
    # Dashboard
    path('dashboard/metrics/', DashboardMetricsView.as_view(), name='dashboard-metrics'),
    
    # Specifics
    path('events/<int:event_id>/staff/bulk/', EventStaffBulkView.as_view(), name='event-staff-bulk'),
    path('events/<int:pk>/overview/', EventOverviewView.as_view(), name='event-overview'),
    
    # Router
    path('', include(router.urls)),
]
