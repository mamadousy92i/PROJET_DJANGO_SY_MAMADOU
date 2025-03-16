# users/views.py
from django.contrib.auth import authenticate, login
from django.contrib.auth.forms import AuthenticationForm
from django.contrib import messages
from django.shortcuts import render, redirect
from django.views.generic import TemplateView
from rest_framework import generics, permissions
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView

from .forms import CustomUserCreationForm, CustomUserUpdateForm
from .models import CustomUser
from .serializers import (
    RegisterSerializer, 
    ProfileSerializer, 
    UserSerializer,
    CustomTokenObtainPairSerializer
)
from .swagger import (
    login_swagger,
    register_swagger,
    profile_get_swagger,
    profile_update_swagger,
    user_list_swagger,
    user_detail_swagger
)

class HomeView(TemplateView):
    template_name = 'home.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['user'] = self.request.user
        return context

def user_login(request):
    if request.method == "POST":
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                if user.is_active:
                    login(request, user)
                    return redirect('profile')
                else:
                    messages.error(request, "Votre compte est en attente d'approbation par un administrateur.")
            else:
                messages.error(request, "Identifiants invalides.")
        else:
            messages.error(request, "Identifiants invalides.")
    else:
        form = AuthenticationForm()
    return render(request, 'users/login.html', {'form': form})

class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    @register_swagger
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

class ProfileView(generics.RetrieveUpdateAPIView):
    """Récupérer et modifier son propre profil"""
    queryset = CustomUser.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        """Retourne uniquement l'utilisateur connecté"""
        return self.request.user

    @profile_get_swagger
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @profile_update_swagger
    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)

class UserListView(generics.ListAPIView):
    # Liste des utilisateurs (nécessite une authentification)
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    @user_list_swagger
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

class UserDetailView(generics.RetrieveUpdateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
    #Un utilisateur ne peut voir que son propre profil
        return CustomUser.objects.filter(id=self.request.user.id)

    @user_detail_swagger
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @user_detail_swagger
    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    @login_swagger
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)