from django.db import transaction
from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator

from ..models import (
    Check,
    Company,
    Event,
    EventsStaff,
    Project,
    Staff,
    User,
    UserInvite,
)
from ..utils import sanitize_digits


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ["id", "name", "date_begin", "date_end", "location", "description"]
        read_only_fields = ["created_by", "created_at"]


class EventsStaffControlSerializer(serializers.ModelSerializer):
    """Serializer otimizado para a listagem operacional (Control)"""

    staff_name = serializers.CharField(source="staff.name", read_only=True)
    is_registered = serializers.SerializerMethodField()
    last_status = serializers.SerializerMethodField()

    class Meta:
        model = EventsStaff
        fields = [
            "id",
            "staff_name",
            "staff_cpf",
            "registration_check",
            "is_registered",
            "last_status",
        ]

    def get_is_registered(self, obj):
        return obj.registration_check_id is not None

    def get_last_status(self, obj):
        # Pega o último check para determinar estado atual (In/Out)
        last_check = obj.checks_history.order_by("-timestamp").first()
        return last_check.action if last_check else None
