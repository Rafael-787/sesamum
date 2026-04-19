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
    EventsCompany
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

        # Regra 2.C: Checks permitidos apenas em eventos abertos
        if events_staff.event.status != "open":
            raise serializers.ValidationError(
                "Ações de check só são permitidas em eventos abertos."
            )

        # Regra 2.B: Check-in/out só permitido se credenciado
        if action in ["check-in", "check-out"]:
            if not events_staff.registration_check_id:
                raise serializers.ValidationError(
                    "Staff não credenciado (Registration Required)."
                )

        # Regra 2.A: Registration só permitido se ainda não tiver check ID e não tiver atingido staff_limit
        if action == "registration":
           if action == "registration":
            if events_staff.registration_check_id:
                raise serializers.ValidationError("Staff já credenciado para este evento.")

            # 1. Identifica o evento e a empresa do staff
            event = events_staff.event
            company = events_staff.staff.company

            # 2. Busca o limite configurado para esta empresa no evento
            try:
                event_config = EventsCompany.objects.get(event=event, company=company)
                limit = event_config.staff_limit
            except EventsCompany.DoesNotExist:
                raise serializers.ValidationError("Esta empresa não possui permissão para este evento.")

            # 3. Conta quantos staffs desta empresa já foram credenciados no evento
            current_registered_count = EventsStaff.objects.filter(
                event=event,
                staff__company=company,
                registration_check__isnull=False
            ).count()

            # 4. Bloqueia se o limite for atingido
            if current_registered_count >= limit:
                raise serializers.ValidationError(
                    f"Limite de credenciamento atingido para a empresa {company.name} ({limit} vagas)."
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


class CheckOverviewEventsTabSerializer(serializers.ModelSerializer):
    class Meta:
        model = Check
        fields = ["action"]

    pass
