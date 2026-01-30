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
