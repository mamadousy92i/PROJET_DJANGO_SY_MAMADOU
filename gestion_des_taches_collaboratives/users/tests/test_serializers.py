import pytest
from rest_framework.serializers import ValidationError
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIRequestFactory
from users.serializers import UserSerializer, RegisterSerializer, ProfileSerializer, CustomTokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

CustomUser = get_user_model()

@pytest.mark.django_db
def test_user_serializer_valid_data():
    """
    Teste la sérialisation d'un utilisateur existant avec UserSerializer.
    """
    user = CustomUser.objects.create_user(
        username="testuser",
        email="testuser@example.com",
        password="test123",
        nom="Dupont",
        prenom="Jean",
        role="etudiant",
        is_active=True
    )
    serializer = UserSerializer(user)
    data = serializer.data

    assert data["id"] == user.id
    assert data["username"] == "testuser"
    assert data["email"] == "testuser@example.com"
    assert data["nom"] == "Dupont"
    assert data["prenom"] == "Jean"
    assert data["role"] == "etudiant"
    assert data["is_active"] is True
    assert "avatar" in data  # Vérifie que le champ est présent


@pytest.mark.django_db
def test_register_serializer_create_etudiant():
    """
    Teste la création d'un étudiant avec RegisterSerializer (compte actif).
    """
    data = {
        "username": "etudiant1",
        "email": "etudiant1@example.com",
        "password": "test123",
        "nom": "Martin",
        "prenom": "Luc",
        "role": "etudiant"
    }
    serializer = RegisterSerializer(data=data)
    assert serializer.is_valid(), serializer.errors
    user = serializer.save()

    assert user.username == "etudiant1"
    assert user.email == "etudiant1@example.com"
    assert user.check_password("test123")
    assert user.nom == "Martin"
    assert user.prenom == "Luc"
    assert user.role == "etudiant"
    assert user.is_active is True  # Étudiant reste actif


@pytest.mark.django_db
def test_register_serializer_create_enseignant():
    """
    Teste la création d'un enseignant avec RegisterSerializer (compte désactivé).
    """
    data = {
        "username": "enseignant1",
        "email": "enseignant1@example.com",
        "password": "test123",
        "nom": "Dupond",
        "prenom": "Pierre",
        "role": "enseignant"
    }
    serializer = RegisterSerializer(data=data)
    assert serializer.is_valid(), serializer.errors
    user = serializer.save()

    assert user.username == "enseignant1"
    assert user.email == "enseignant1@example.com"
    assert user.check_password("test123")
    assert user.nom == "Dupond"
    assert user.prenom == "Pierre"
    assert user.role == "enseignant"
    assert user.is_active is False  # Enseignant désactivé par défaut


@pytest.mark.django_db
def test_register_serializer_create_admin():
    """
    Teste la création d'un admin avec RegisterSerializer (compte désactivé).
    """
    data = {
        "username": "admin1",
        "email": "admin1@example.com",
        "password": "test123",
        "nom": "Admin",
        "prenom": "Super",
        "role": "admin"
    }
    serializer = RegisterSerializer(data=data)
    assert serializer.is_valid(), serializer.errors
    user = serializer.save()

    assert user.username == "admin1"
    assert user.email == "admin1@example.com"
    assert user.check_password("test123")
    assert user.nom == "Admin"
    assert user.prenom == "Super"
    assert user.role == "admin"
    assert user.is_active is False  # Admin désactivé par défaut


@pytest.mark.django_db
def test_register_serializer_with_avatar():
    """
    Teste la création d'un utilisateur avec un avatar.
    """
    avatar_file = SimpleUploadedFile("avatar.jpg", b"file_content", content_type="image/jpeg")
    data = {
        "username": "avataruser",
        "email": "avataruser@example.com",
        "password": "test123",
        "nom": "Avatar",
        "prenom": "User",
        "role": "etudiant",
        "avatar": avatar_file
    }
    serializer = RegisterSerializer(data=data)
    assert serializer.is_valid(), serializer.errors
    user = serializer.save()

    assert user.avatar.name.startswith("avatars/avatar")
    assert user.avatar.name.endswith(".jpg")
    assert user.is_active is True


@pytest.mark.django_db
def test_register_serializer_missing_fields():
    """
    Teste que RegisterSerializer rejette les données incomplètes.
    """
    data = {
        "username": "incomplete",
        "password": "test123",
        # Manque email, nom, prenom
    }
    serializer = RegisterSerializer(data=data)
    assert not serializer.is_valid()
    assert "email" in serializer.errors
    assert "nom" in serializer.errors
    assert "prenom" in serializer.errors


@pytest.mark.django_db
def test_profile_serializer_serialization():
    """
    Teste la sérialisation d'un profil avec ProfileSerializer.
    """
    user = CustomUser.objects.create_user(
        username="profileuser",
        email="profileuser@example.com",
        password="test123",
        nom="Profil",
        prenom="User",
        role="etudiant"
    )
    serializer = ProfileSerializer(user)
    data = serializer.data

    assert data["username"] == "profileuser"
    assert data["email"] == "profileuser@example.com"
    assert data["nom"] == "Profil"
    assert data["prenom"] == "User"
    assert data["role"] == "etudiant"
    assert "id" in data
    assert "avatar" in data


@pytest.mark.django_db
def test_profile_serializer_read_only_fields():
    """
    Teste que username et role sont en lecture seule dans ProfileSerializer.
    """
    user = CustomUser.objects.create_user(
        username="readonlyuser",
        email="readonlyuser@example.com",
        password="test123",
        nom="Read",
        prenom="Only",
        role="etudiant"
    )
    data = {
        "username": "newusername",  # Ne doit pas être modifié
        "email": "newemail@example.com",
        "nom": "Nouveau",
        "prenom": "Nom",
        "role": "enseignant"  # Ne doit pas être modifié
    }
    serializer = ProfileSerializer(instance=user, data=data, partial=True)
    assert serializer.is_valid(), serializer.errors
    updated_user = serializer.save()

    assert updated_user.username == "readonlyuser"  # Pas modifié
    assert updated_user.email == "newemail@example.com"
    assert updated_user.nom == "Nouveau"
    assert updated_user.prenom == "Nom"
    assert updated_user.role == "etudiant"  # Pas modifié


@pytest.mark.django_db
def test_custom_token_obtain_pair_serializer():
    """
    Teste la génération de tokens avec CustomTokenObtainPairSerializer.
    """
    user = CustomUser.objects.create_user(
        username="tokenuser",
        email="tokenuser@example.com",
        password="test123",
        nom="Token",
        prenom="User",
        role="enseignant"
    )
    serializer = CustomTokenObtainPairSerializer(data={
        "username": "tokenuser",
        "password": "test123"
    })
    assert serializer.is_valid(), serializer.errors
    data = serializer.validated_data

    refresh_token = RefreshToken(data["refresh"])
    access_token = data["access"]

    assert "access" in data
    assert "refresh" in data
    assert refresh_token["role"] == "enseignant"
    assert refresh_token["user_id"] == user.id
    assert str(refresh_token.access_token) == access_token


@pytest.mark.django_db
def test_custom_token_obtain_pair_serializer_invalid_credentials():
    """
    Teste que CustomTokenObtainPairSerializer rejette les mauvaises informations d'identification.
    """
    CustomUser.objects.create_user(
        username="wronguser",
        email="wronguser@example.com",
        password="test123",
        nom="Wrong",
        prenom="User",
        role="etudiant"
    )
    serializer = CustomTokenObtainPairSerializer(data={
        "username": "wronguser",
        "password": "wrongpassword"  # Mot de passe incorrect
    })
    with pytest.raises(ValidationError) as exc_info:
        serializer.is_valid(raise_exception=True)
    assert "No active account found" in str(exc_info.value)