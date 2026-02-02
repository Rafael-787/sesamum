from rest_framework import serializers

from ..models import Company, EventsCompany, EventsStaff
from ..serializers import CheckSerializer


class EventsCompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = EventsCompany
        fields = ["role", "staff_limit"]

    def create(self, validated_data):
        return EventsCompany.objects.create(**validated_data)


class EventsCompanyOverviewEventsTabSerializer(serializers.ModelSerializer):
    # Recebendo um EventsCompany instace da view
    # Usamos o Serializer de Company para expandir os dados básicos
    id = serializers.ReadOnlyField(
        source="company.id"
    )  # Source atravessa a relação e busca no model Company o id
    name = serializers.ReadOnlyField(source="company.name")
    # history = CheckSerializer(source="checks_history", many=True, read_only=True)
    #
    checkin_count = serializers.IntegerField(read_only=True)
    checkout_count = serializers.IntegerField(read_only=True)
    registration_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = EventsCompany
        fields = [
            "id",
            "name",
            "staff_limit",
            "checkin_count",
            "checkout_count",
            "registration_count",
        ]
