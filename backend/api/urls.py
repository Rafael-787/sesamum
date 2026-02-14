from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("api/admin/", admin.site.urls),
    # Prefixo
    path("api/v1/", include("v1.urls")),
]
