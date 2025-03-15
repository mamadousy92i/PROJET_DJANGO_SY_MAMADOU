from django.contrib.auth.models import AbstractUser
from django.db import models
from rest_framework_simplejwt.tokens import RefreshToken

class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('enseignant', 'Enseignant'),
        ('etudiant', 'Étudiant'),
    ]

    nom = models.CharField(max_length=200)
    prenom = models.CharField(max_length=200)
    email = models.EmailField(unique=True)  # Email unique pour éviter les doublons
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True, verbose_name='Photo de profil')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='etudiant')  # Rôle par défaut : Étudiant
    is_active = models.BooleanField(default=True)  # Vérifie si le compte est actif

    def __str__(self):
        return f"{self.username} - {self.role}"

    def get_token(self):
        token = RefreshToken.for_user(self)
        token['role'] = self.role
        token['user_id'] = self.id
        return token

