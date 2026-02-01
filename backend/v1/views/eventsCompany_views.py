from django.shortcuts import get_object_or_404
from rest_framework import status, views
from rest_framework.response import Response

from ..models import EventsCompany
from ..permissions import IsAdmin
from ..serializers import EventsCompanySerializer


class EventsCompanyView(views.APIView):
    queryset = EventsCompany.objects.all()
    serializer_class = EventsCompanySerializer
    permission_classes = [IsAdmin]

    def get_object(self, event_id, company_id):
        return get_object_or_404(
            EventsCompany, event_id=event_id, company_id=company_id
        )

    def post(self, request, event_id, company_id):
        serializer = EventsCompanySerializer(data=request.data)

        if EventsCompany.objects.filter(
            event_id=event_id, company_id=company_id
        ).exists():
            return Response(
                {"detail": "Empresa já atribuída a esse evento."}, status=400
            )

        if serializer.is_valid():
            serializer.save(event_id=event_id, company_id=company_id)
            return Response(
                {"detail": "Empresa atribuída com sucesso."},
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, event_id, company_id):
        # Busca a relação entre event_id e company_id
        relacao = self.get_object(event_id, company_id)

        serializer = EventsCompanySerializer(relacao, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(
                {"detail": "Atualizado com sucesso."}, status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, event_id, company_id):
        # Aproveitando o padrão para deletar a relação
        relacao = self.get_object(event_id, company_id)
        relacao.delete()
        return Response(
            status=status.HTTP_204_NO_CONTENT,
        )
