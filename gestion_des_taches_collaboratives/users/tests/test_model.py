import pytest
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.files.uploadedfile import SimpleUploadedFile

CustomUser = get_user_model()


@pytest.mark.django_db
def test_create_custom_user():
    """
    Teste la création d'un utilisateur avec des données valides.
    """
    user = CustomUser.objects.create_user(
        username="testuser",
        email="testuser@example.com",
        password="test123",
        nom="Dupont",
        prenom="Jean",
        role="etudiant"
    )
    assert user.username == "testuser"
    assert user.email == "testuser@example.com"
    assert user.check_password("test123")
    assert user.nom == "Dupont"
    assert user.prenom == "Jean"
    assert user.role == "etudiant"
    assert user.is_active is True
    assert user.avatar.name == ""  # Vérifie la propriété name de l'ImageField
    assert not user.is_staff
    assert not user.is_superuser


@pytest.mark.django_db
def test_create_superuser():
    """
    Teste la création d'un superutilisateur.
    """
    superuser = CustomUser.objects.create_superuser(
        username="admin",
        email="admin@example.com",
        password="admin123",
        nom="Admin",
        prenom="Super",
        role="admin"
    )
    assert superuser.username == "admin"
    assert superuser.email == "admin@example.com"
    assert superuser.check_password("admin123")
    assert superuser.nom == "Admin"
    assert superuser.prenom == "Super"
    assert superuser.role == "admin"
    assert superuser.is_active is True
    assert superuser.is_staff is True
    assert superuser.is_superuser is True


@pytest.mark.django_db
def test_duplicate_email_fails():
    """
    Teste que la création de deux utilisateurs avec le même email échoue.
    """
    CustomUser.objects.create_user(
        username="user1",
        email="duplicate@example.com",
        password="test123",
        nom="User",
        prenom="One",
        role="etudiant"
    )

    with pytest.raises(IntegrityError):
        CustomUser.objects.create_user(
            username="user2",
            email="duplicate@example.com",  # Même email
            password="test456",
            nom="User",
            prenom="Two",
            role="enseignant"
        )


@pytest.mark.django_db
def test_missing_required_fields():
    """
    Teste que la création échoue si des champs requis sont manquants.
    """
    # Test sans username
    with pytest.raises(ValueError, match="The given username must be set"):
        CustomUser.objects.create_user(
            username="",  # Username vide
            email="missing@example.com",
            password="test123",
            nom="Missing",
            prenom="User",
            role="etudiant"
        )

    # Test sans password
    with pytest.raises(ValueError, match="password"):
        CustomUser.objects.create_user(
            username="missingpass",
            email="missingpass@example.com",
            nom="Missing",
            prenom="Pass",
            role="etudiant",
            password=None  # Password explicitement None
        )

    # Test sans email
    with pytest.raises(IntegrityError):
        CustomUser.objects.create_user(
            username="noemail",
            email="",  # Email vide (violation de la contrainte NOT NULL)
            password="test123",
            nom="No",
            prenom="Email",
            role="etudiant"
        )


@pytest.mark.django_db
def test_default_role():
    """
    Teste que le rôle par défaut est 'etudiant' si non spécifié.
    """
    user = CustomUser.objects.create_user(
        username="defaultrole",
        email="defaultrole@example.com",
        password="test123",
        nom="Default",
        prenom="Role"
    )
    assert user.role == "etudiant"


@pytest.mark.django_db
def test_invalid_role_does_not_raise():
    """
    Teste qu'un rôle invalide est accepté car Django ne valide pas les choices par défaut.
    """
    user = CustomUser.objects.create_user(
        username="invalidrole",
        email="invalidrole@example.com",
        password="test123",
        nom="Invalid",
        prenom="Role",
        role="invalide"  # Rôle non dans ROLE_CHOICES
    )
    assert user.role == "invalide"  # Django accepte sans valider


@pytest.mark.django_db
def test_string_representation():
    """
    Teste la représentation sous forme de chaîne de l'utilisateur.
    """
    user = CustomUser.objects.create_user(
        username="stringuser",
        email="stringuser@example.com",
        password="test123",
        nom="String",
        prenom="User",
        role="enseignant"
    )
    assert str(user) == "stringuser - enseignant"


@pytest.mark.django_db
def test_create_user_with_avatar():
    """
    Teste la création d'un utilisateur avec un avatar.
    """
    avatar_file = SimpleUploadedFile("avatar.jpg", b"file_content", content_type="image/jpeg")
    user = CustomUser.objects.create_user(
        username="avataruser",
        email="avataruser@example.com",
        password="test123",
        nom="Avatar",
        prenom="User",
        role="etudiant",
        avatar=avatar_file
    )
    assert user.avatar.name.startswith("avatars/avatar")
    assert user.avatar.name.endswith(".jpg")


@pytest.mark.django_db
def test_get_token():
    """
    Teste la génération d'un token JWT avec les champs personnalisés.
    """
    user = CustomUser.objects.create_user(
        username="tokenuser",
        email="tokenuser@example.com",
        password="test123",
        nom="Token",
        prenom="User",
        role="enseignant"
    )
    token = user.get_token()
    token_payload = token.payload  # Accéder au payload du token

    assert token_payload["role"] == "enseignant"
    assert token_payload["user_id"] == user.id
    assert "exp" in token_payload  # Vérifie que le token a une expiration
    assert str(token.access_token)  # Vérifie que le token d'accès est généré


@pytest.mark.django_db
def test_is_active_default():
    """
    Teste que is_active est True par défaut.
    """
    user = CustomUser.objects.create_user(
        username="activeuser",
        email="activeuser@example.com",
        password="test123",
        nom="Active",
        prenom="User"
    )
    assert user.is_active is True


@pytest.mark.django_db
def test_create_inactive_user():
    """
    Teste la création d'un utilisateur inactif.
    """
    user = CustomUser.objects.create_user(
        username="inactiveuser",
        email="inactiveuser@example.com",
        password="test123",
        nom="Inactive",
        prenom="User",
        role="etudiant",
        is_active=False
    )
    assert user.is_active is False