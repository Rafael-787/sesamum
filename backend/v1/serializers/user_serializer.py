from rest_framework import serializers, validators

from ..models import Company, User


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
    company = serializers.CharField(source="company.name", read_only=True)

    # Campo de escrita que recebe o ID e salva na FK 'company' do Model
    company_id = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(),
        source="company",
        required=False,
        allow_null=True,
    )

    class Meta:
        model = User
        fields = ["id", "name", "email", "role", "company", "company_id", "created_at"]
        read_only_fields = ["created_at"]

    def to_representation(self, instance):
        # Chamamos a representação padrão (que traria o ID)
        representation = super().to_representation(instance)

        # Substituímos o valor do ID pelo nome do fornecedor apenas no JSON de saída
        if instance.company:
            representation["company"] = instance.company.name

        return representation
