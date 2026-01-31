from django.db import transaction
from rest_framework import serializers, validators
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


class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(  # Impede usuários sem e-mail
        validators=[
            validators.UniqueValidator(
                queryset=User.objects.all(),
                message="Este e-mail já está cadastrado.",
            )
        ],
        required=True,
        allow_blank=False,
    )

    class Meta:
        model = User
        fields = ["id", "name", "email", "role", "company", "created_at"]
        read_only_fields = ["role", "company", "created_at", "email"]
