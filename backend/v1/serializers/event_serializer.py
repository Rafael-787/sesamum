from rest_framework import serializers
from ..models import Event, Project, EventsCompany

class EventSerializer(serializers.ModelSerializer):
    project = serializers.PrimaryKeyRelatedField(
        required=False,
        queryset=Project.objects.all(),
        error_messages={"does_not_exist": "O projeto não foi encontrado."},
    )
    status = serializers.CharField(required=False)
    
    # Novo campo calculado
    company_role = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "id",
            "name",
            "description",
            "date_begin",
            "date_end",
            "location",
            "project",
            "status",
            "company_role", # Adicionado aos fields
        ]
        read_only_fields = ["created_by", "created_at"]

    def get_company_role(self, obj):
        request = self.context.get('request')
        
        if not request or not hasattr(request, 'user') or not request.user.is_authenticated:
            return None
            
        user = request.user

        # Se a empresa do utilizador for a dona do projeto, assume automaticamente papel de produção
        if obj.project and obj.project.company == user.company:
            return "production"

        # Caso contrário, procura o papel na tabela que vincula a empresa ao evento
        relation = EventsCompany.objects.filter(event=obj, company=user.company).first()
        if relation:
            return relation.role

        return None