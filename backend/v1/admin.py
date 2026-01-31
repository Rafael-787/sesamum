from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import (
    Check,
    Company,
    Event,
    EventsCompany,
    EventsStaff,
    Project,
    Staff,
    UserInvite,
)

User = get_user_model()


# Customize User Admin to handle custom fields and password
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("email", "name", "role", "company", "is_active")
    list_filter = ("role", "is_active", "company")
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("name",)}),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Important dates", {"fields": ("last_login", "created_at")}),
        ("Custom Fields", {"fields": ("role", "company", "created_by")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "name", "password", "role", "company"),
            },
        ),
    )
    search_fields = ("email", "name")
    ordering = ("email",)
    readonly_fields = ("created_at",)


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ("name", "cnpj", "created_at")
    search_fields = ("name", "cnpj")


@admin.register(UserInvite)
class UserInviteAdmin(admin.ModelAdmin):
    list_display = ("email", "role", "company", "status", "expires_at")
    list_filter = ("role", "company")


@admin.register(Staff)
class StaffAdmin(admin.ModelAdmin):
    list_display = ("name", "cpf", "company")
    search_fields = ("name", "cpf")
    list_filter = ("company",)


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("name", "company", "status", "date_begin", "date_end")
    list_filter = ("company", "status")


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("name", "project", "status", "date_begin")
    list_filter = ("status",)


@admin.register(EventsCompany)
class EventsCompanyAdmin(admin.ModelAdmin):
    list_display = ("event", "company", "role")
    list_filter = ("role",)


@admin.register(EventsStaff)
class EventsStaffAdmin(admin.ModelAdmin):
    list_display = ("event", "staff", "staff_cpf")
    search_fields = ("staff__name", "staff_cpf")


@admin.register(Check)
class CheckAdmin(admin.ModelAdmin):
    list_display = ("action", "get_staff_name", "timestamp")
    list_filter = ("action",)

    def get_staff_name(self, obj):
        return obj.events_staff.staff.name

    get_staff_name.short_description = "Staff Name"
