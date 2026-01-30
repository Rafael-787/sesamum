from django.db import transaction
from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator

from ..models import Company
from ..utils import sanitize_digits


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ["id", "name", "cnpj", "created_at", "created_by"]
        read_only_fields = ["created_at", "created_by"]
