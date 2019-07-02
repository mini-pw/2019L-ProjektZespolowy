from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.serializers import AuthTokenSerializer
from rest_framework.generics import CreateAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from users.permissions import AnonymousOnly
from users.serializers import UserSerializer, DetailedUserSerializer


class RegisterView(CreateAPIView):
    """
    Create new user
    """
    permission_classes = (AnonymousOnly,)
    serializer_class = UserSerializer


class LoginView(APIView):
    """
    Login user and return Auth Token
    """
    permission_classes = (AnonymousOnly,)
    serializer_class = AuthTokenSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=self.request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        data = UserSerializer(user).data
        data['token'] = token.key
        return Response(data)


class StatisticsView(RetrieveAPIView):
    serializer_class = DetailedUserSerializer
    queryset = User.objects.all()
