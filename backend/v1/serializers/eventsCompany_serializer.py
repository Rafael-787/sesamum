from rest_framework import serializers

from ..models import EventsCompany


class EventsCompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = EventsCompany
        fields = ["role", "staff_limit"]

    def create(self, validated_data):
        return EventsCompany.objects.create(**validated_data)
