from django.conf import settings
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from rest_framework import status, views
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from ..models import User, UserInvite
from ..serializers import (
    UserSerializer,
)

# --- Auth Views ---


class GoogleLoginView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("token")
        try:
            idinfo = id_token.verify_oauth2_token(
                token, google_requests.Request(), settings.GOOGLE_CLIENT_ID
            )
            email = idinfo["email"]
        except ValueError:
            return Response(
                {"error": "Invalid Google Token"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_403_FORBIDDEN
            )

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": UserSerializer(user).data,
            }
        )


class RegisterWithInviteView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("invite_token")  # O ID do UserInvite
        google_token = request.data.get("google_token")
        name = request.data.get("name")

        try:
            idinfo = id_token.verify_oauth2_token(
                google_token, google_requests.Request(), settings.GOOGLE_CLIENT_ID
            )
            email = idinfo["email"]
        except ValueError:
            return Response(
                {"error": "Invalid Google Token"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            invite = UserInvite.objects.get(id=token)
        except UserInvite.DoesNotExist:
            return Response(
                {"error": "Invalid invite token"}, status=status.HTTP_404_NOT_FOUND
            )

        # Validação do Slot
        if invite.status != "pending":
            return Response(
                {"error": f"Invite is {invite.status}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if invite.email and invite.email != email:
            return Response(
                {"error": "Email does not match invite restriction"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Criação do usuário
        user = User.objects.create_user(
            email=email,
            name=name,
            role=invite.role,
            company=invite.company,
            created_by=invite.created_by,  # Admin que gerou o convite
        )

        # Consome o slot
        invite.used_by = user
        invite.save()

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )
