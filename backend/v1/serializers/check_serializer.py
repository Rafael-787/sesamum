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


class CheckSerializer(serializers.ModelSerializer):
    class Meta:
        model = Check
        fields = ["id", "action", "timestamp", "events_staff", "user_control"]
        read_only_fields = ["timestamp", "user_control"]

    def validate(self, data):
        action = data.get("action")
        events_staff = data.get("events_staff")

        # Regra 2.B: Check-in/out só permitido se credenciado
        if action in ["check-in", "check-out"]:
            if not events_staff.registration_check_id:
                raise serializers.ValidationError(
                    "Staff não credenciado (Registration Required)."
                )

        # Regra 2.A: Registration só permitido se ainda não tiver check ID
        if action == "registration":
            if events_staff.registration_check_id:
                raise serializers.ValidationError(
                    "Staff já credenciado para este evento."
                )

        return data

    def create(self, validated_data):
        user = self.context["request"].user
        validated_data["user_control"] = user

        action = validated_data["action"]
        events_staff = validated_data["events_staff"]

        # Atomicidade exigida na Regra 2.A
        with transaction.atomic():
            check = Check.objects.create(**validated_data)

            if action == "registration":
                events_staff.registration_check = check
                events_staff.save()

        return check
