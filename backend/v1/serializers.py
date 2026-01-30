from django.db import transaction
from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator

from .models import Check, Company, Event, EventsStaff, Project, Staff, User, UserInvite
from .utils import sanitize_digits


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "name", "email", "role", "company", "created_at"]
        read_only_fields = ["role", "company", "created_at", "email"]


class InviteSerializer(serializers.ModelSerializer):
    status = serializers.ReadOnlyField()
    invite_url = serializers.SerializerMethodField()

    class Meta:
        model = UserInvite
        fields = [
            "id",
            "company",
            "email",
            "role",
            "expires_at",
            "status",
            "invite_url",
        ]
        read_only_fields = ["id", "created_by", "used_by"]

    def get_invite_url(self, obj):
        # Exemplo de URL de frontend
        return f"https://app.sesamum.com/register/{obj.id}"


class StaffSerializer(serializers.ModelSerializer):
    # Mantemos como read_only para proteção da API
    company = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Staff
        fields = "__all__"
        read_only_fields = ["created_by", "created_at"]
        # Removemos o UniqueTogetherValidator daqui, pois ele ignora campos read_only

    def validate_cpf(self, value):
        return sanitize_digits(value)

    def validate(self, attrs):
        request = self.context.get("request")
        user = request.user if request else None

        # 1. Pegamos o CPF já sanitizado (ou do attrs ou do objeto existente)
        cpf = attrs.get("cpf")
        company = user.company if user else None

        # 2. Verificação manual de unicidade
        # Verificamos se já existe um Staff com esse CPF na mesma empresa
        queryset = Staff.objects.filter(cpf=cpf, company=company)

        # Se for uma atualização (PUT/PATCH), ignoramos o próprio objeto da busca
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError(
                {"cpf": "Esse CPF já está cadastrado nessa empresa."}
            )

        # Injetamos a empresa nos atributos para o perform_create
        attrs["company"] = company
        return super().validate(attrs)


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
