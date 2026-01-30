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


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "name", "email", "role", "company", "created_at"]
        read_only_fields = ["role", "company", "created_at", "email"]
