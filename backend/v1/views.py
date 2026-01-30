from rest_framework import viewsets, status, views, generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from django.db.models import Count
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.conf import settings

from .models import Company, User, UserInvite, Staff, Project, Event, EventsStaff, Check
from .serializers import (
    UserSerializer, InviteSerializer, StaffSerializer, 
    CheckSerializer, EventsStaffControlSerializer
)
from .permissions import IsAdmin, IsCompanyOrAdmin, IsControlOrAdmin
from .utils import sanitize_digits

# --- Auth Views ---

class GoogleLoginView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('token')
        try:
            idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), settings.GOOGLE_CLIENT_ID)
            email = idinfo['email']
        except ValueError:
            return Response({"error": "Invalid Google Token"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_403_FORBIDDEN)

        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        })

class RegisterWithInviteView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('invite_token') # O ID do UserInvite
        google_token = request.data.get('google_token')
        name = request.data.get('name')
        
        try:
            idinfo = id_token.verify_oauth2_token(google_token, google_requests.Request(), settings.GOOGLE_CLIENT_ID)
            email = idinfo['email']
        except ValueError:
            return Response({"error": "Invalid Google Token"}, status=status.HTTP_400_BAD_REQUEST) 

        try:
            invite = UserInvite.objects.get(id=token)
        except UserInvite.DoesNotExist:
            return Response({"error": "Invalid invite token"}, status=status.HTTP_404_NOT_FOUND)

        # Validação do Slot
        if invite.status != 'pending':
            return Response({"error": f"Invite is {invite.status}"}, status=status.HTTP_400_BAD_REQUEST)

        if invite.email and invite.email != email:
            return Response({"error": "Email does not match invite restriction"}, status=status.HTTP_400_BAD_REQUEST)

        # Criação do usuário
        user = User.objects.create_user(
            email=email,
            name=name,
            role=invite.role,
            company=invite.company,
            created_by=invite.created_by # Admin que gerou o convite
        )

        # Consome o slot
        invite.used_by = user
        invite.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)

# --- Business ViewSets ---

class StaffViewSet(viewsets.ModelViewSet):
    serializer_class = StaffSerializer
    permission_classes = [IsCompanyOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Staff.objects.all()
        return Staff.objects.filter(company=user.company)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, company=self.request.user.company)

class CheckViewSet(viewsets.ModelViewSet):
    """Endpoint principal para Credenciamento, Check-in e Check-out"""
    serializer_class = CheckSerializer
    permission_classes = [IsControlOrAdmin]
    http_method_names = ['post', 'get', 'head'] # Focado em ações

    def get_queryset(self):
        return Check.objects.all().order_by('-timestamp')

class EventStaffBulkView(views.APIView):
    permission_classes = [IsCompanyOrAdmin]

    def post(self, request, event_id):
        """Bulk Upsert de Staffs para um evento"""
        try:
            event = Event.objects.get(id=event_id)
        except Event.DoesNotExist:
            return Response(status=404)
        
        # Validação de Permissão: O evento deve pertencer à company do usuário
        if event.project.company != request.user.company:
            return Response({"error": "Permission denied for this event"}, status=status.HTTP_403_FORBIDDEN)
        
        staff_list = request.data.get('staffs', [])
        created_count = 0
        
        for item in staff_list:
            cpf = sanitize_digits(item.get('cpf'))
            name = item.get('name')
            
            # 1. Upsert Staff na Company do User
            staff, _ = Staff.objects.update_or_create(
                company=request.user.company,
                cpf=cpf,
                defaults={'name': name, 'created_by': request.user}
            )
            
            # 2. Vincular ao Evento
            _, created = EventsStaff.objects.get_or_create(
                event=event,
                staff_cpf=cpf,
                defaults={'staff': staff, 'created_by': request.user}
            )
            if created: created_count += 1

        return Response({"message": f"{created_count} staffs linked to event"}, status=200)

class DashboardMetricsView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = {
            "activeEvents": Event.objects.filter(status='open').count(),
            "totalProjects": Project.objects.count(),
            "totalCompanies": Company.objects.count(),
            "totalUsers": User.objects.count()
        }
        return Response(data)

class EventOverviewView(generics.RetrieveAPIView):
    # Implementação simplificada do overview
    queryset = Event.objects.all()
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Lógica customizada de agregação aqui
        staff_count = instance.event_staffs.count()
        return Response({
            "name": instance.name,
            "total_staff": staff_count,
            "status": instance.status
        })