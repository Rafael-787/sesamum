from rest_framework import serializers

from ..models import (
    Event,
    EventsStaff,
    Staff,
    User,
)


class EventsStaffSerializer(serializers.ModelSerializer):
    # Campos não obrigatórios (não pode ter field vazio no serializer)
    event = serializers.PrimaryKeyRelatedField(
        queryset=Event.objects.all(), required=False
    )
    staff = serializers.PrimaryKeyRelatedField(
        queryset=Staff.objects.all(), required=False
    )
    created_by = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), required=False
    )
    # -----
    staff_cpf = serializers.CharField(source="staff.cpf", read_only=True)

    class Meta:
        model = EventsStaff
        fields = ["event", "staff", "staff_cpf", "created_by"]

    def create(self, validated_data):
        return EventsStaff.objects.create(**validated_data)


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
        data = {"action": last_check.action, "timestamp": last_check.timestamp}
        return data if last_check else None
