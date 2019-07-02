from django.urls import path

from users.api import RegisterView, LoginView, StatisticsView

app_name = 'users'

urlpatterns = [
    path('register', RegisterView.as_view(), name='register_user'),
    path('login', LoginView.as_view(), name='login_user'),
    path('<int:pk>', StatisticsView.as_view(), name='statistics')
]
