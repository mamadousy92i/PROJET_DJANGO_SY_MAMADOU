import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from rest_framework import status
from users.views import HomeView, user_login, RegisterView, ProfileView, UserListView, UserDetailView, \
    CustomTokenObtainPairView
from users.models import CustomUser

CustomUser = get_user_model()
pytestmark = pytest.mark.django_db


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def authenticated_client(api_client):
    user = CustomUser.objects.create_user(
        username="testuser",
        email="testuser@example.com",
        password="test123",
        nom="Test",
        prenom="User",
        role="etudiant",
        is_active=True
    )
    api_client.login(username="testuser", password="test123")
    api_client.force_authenticate(user=user)
    return api_client, user


@pytest.mark.django_db
def test_home_view(client):
    """
    Teste que HomeView rend le template home.html avec l'utilisateur connecté.
    """
    user = CustomUser.objects.create_user(
        username="homeuser",
        email="homeuser@example.com",
        password="test123",
        nom="Home",
        prenom="User",
        role="etudiant"
    )
    client.login(username="homeuser", password="test123")
    response = client.get(reverse('home'))

    assert response.status_code == 200
    assert "home.html" in [t.name for t in response.templates]
    assert response.context["user"] == user


@pytest.mark.django_db
def test_user_login_success(client):
    """
    Teste une connexion réussie via user_login.
    """
    CustomUser.objects.create_user(
        username="loginuser",
        email="loginuser@example.com",
        password="test123",
        nom="Login",
        prenom="User",
        role="etudiant",
        is_active=True
    )
    response = client.post(reverse('login'), {
        "username": "loginuser",
        "password": "test123"
    })

    assert response.status_code == 302  # Redirection après succès
    assert response.url == reverse('profile')


@pytest.mark.django_db
def test_user_login_inactive_account(client):
    """
    Teste une connexion avec un compte inactif.
    """
    CustomUser.objects.create_user(
        username="inactiveuser",
        email="inactiveuser@example.com",
        password="test123",
        nom="Inactive",
        prenom="User",
        role="enseignant",
        is_active=False
    )
    response = client.post(reverse('login'), {
        "username": "inactiveuser",
        "password": "test123"
    })

    assert response.status_code == 200
    assert "Votre compte est en attente d'approbation" in response.content.decode()


@pytest.mark.django_db
def test_user_login_invalid_credentials(client):
    """
    Teste une connexion avec des identifiants invalides.
    """
    response = client.post(reverse('login'), {
        "username": "nonexistent",
        "password": "wrongpass"
    })

    assert response.status_code == 200
    assert "Identifiants invalides" in response.content.decode()


@pytest.mark.django_db
def test_register_view(api_client):
    """
    Teste l'inscription d'un étudiant via RegisterView.
    """
    data = {
        "username": "newuser",
        "email": "newuser@example.com",
        "password": "test123",
        "nom": "New",
        "prenom": "User",
        "role": "etudiant"
    }
    response = api_client.post(reverse('register'), data, format='json')

    assert response.status_code == status.HTTP_201_CREATED
    assert CustomUser.objects.filter(username="newuser").exists()
    user = CustomUser.objects.get(username="newuser")
    assert user.is_active is True
    assert user.role == "etudiant"


@pytest.mark.django_db
def test_register_view_inactive_enseignant(api_client):
    """
    Teste l'inscription d'un enseignant (compte désactivé).
    """
    data = {
        "username": "newenseignant",
        "email": "newenseignant@example.com",
        "password": "test123",
        "nom": "New",
        "prenom": "Enseignant",
        "role": "enseignant"
    }
    response = api_client.post(reverse('register'), data, format='json')

    assert response.status_code == status.HTTP_201_CREATED
    user = CustomUser.objects.get(username="newenseignant")
    assert user.is_active is False
    assert user.role == "enseignant"


@pytest.mark.django_db
def test_profile_view_get(authenticated_client):
    """
    Teste la récupération du profil de l'utilisateur connecté.
    """
    client, user = authenticated_client
    response = client.get(reverse('profile'))

    assert response.status_code == status.HTTP_200_OK
    assert response.data["username"] == "testuser"
    assert response.data["email"] == "testuser@example.com"
    assert response.data["nom"] == "Test"
    assert response.data["prenom"] == "User"
    assert response.data["role"] == "etudiant"


@pytest.mark.django_db
def test_profile_view_update(authenticated_client):
    """
    Teste la mise à jour du profil de l'utilisateur connecté.
    """
    client, user = authenticated_client
    data = {
        "email": "updated@example.com",
        "nom": "Updated",
        "prenom": "User",
        "username": "newusername",  # Ne doit pas être modifié (read_only)
        "role": "enseignant"  # Ne doit pas être modifié (read_only)
    }
    response = client.put(reverse('profile'), data, format='json')

    assert response.status_code == status.HTTP_200_OK
    user.refresh_from_db()
    assert user.email == "updated@example.com"
    assert user.nom == "Updated"
    assert user.prenom == "User"
    assert user.username == "testuser"  # Pas modifié
    assert user.role == "etudiant"  # Pas modifié


@pytest.mark.django_db
def test_user_list_view(authenticated_client):
    """
    Teste la liste des utilisateurs (accessible aux utilisateurs authentifiés).
    """
    client, user = authenticated_client
    CustomUser.objects.create_user(
        username="otheruser",
        email="otheruser@example.com",
        password="test123",
        nom="Other",
        prenom="User",
        role="etudiant"
    )
    response = client.get(reverse('user-list'))

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) >= 2  # Au moins l'utilisateur authentifié + otheruser


@pytest.mark.django_db
def test_user_list_view_unauthenticated(api_client):
    """
    Teste que UserListView est inaccessible sans authentification.
    """
    response = api_client.get(reverse('user-list'))

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_user_detail_view_get(authenticated_client):
    """
    Teste la récupération des détails de l'utilisateur connecté uniquement.
    """
    client, user = authenticated_client
    response = client.get(reverse('user-detail', kwargs={'pk': user.id}))

    assert response.status_code == status.HTTP_200_OK
    assert response.data["username"] == "testuser"
    assert response.data["email"] == "testuser@example.com"


@pytest.mark.django_db
def test_user_detail_view_other_user(authenticated_client):
    """
    Teste que l'utilisateur ne peut pas voir les détails d'un autre utilisateur.
    """
    client, user = authenticated_client
    other_user = CustomUser.objects.create_user(
        username="otheruser",
        email="otheruser@example.com",
        password="test123",
        nom="Other",
        prenom="User",
        role="etudiant"
    )
    response = client.get(reverse('user-detail', kwargs={'pk': other_user.id}))

    assert response.status_code == status.HTTP_404_NOT_FOUND  # Filtré par get_queryset


@pytest.mark.django_db
def test_custom_token_obtain_pair_view(api_client):
    """
    Teste l'obtention d'un token via CustomTokenObtainPairView.
    """
    CustomUser.objects.create_user(
        username="tokenuser",
        email="tokenuser@example.com",
        password="test123",
        nom="Token",
        prenom="User",
        role="etudiant",
        is_active=True
    )
    response = api_client.post(reverse('token_obtain_pair'), {
        "username": "tokenuser",
        "password": "test123"
    }, format='json')

    assert response.status_code == status.HTTP_200_OK
    assert "access" in response.data
    assert "refresh" in response.data


@pytest.mark.django_db
def test_custom_token_obtain_pair_view_invalid_credentials(api_client):
    """
    Teste l'échec de l'obtention d'un token avec des identifiants invalides.
    """
    response = api_client.post(reverse('token_obtain_pair'), {
        "username": "nonexistent",
        "password": "wrongpass"
    }, format='json')

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "No active account found" in response.data["detail"]