# projects/tests/test_views.py
import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from datetime import date, timedelta
from projects.models import Projet, EtatProjet


@pytest.mark.django_db
class TestProjetViews:
    @pytest.fixture
    def api_client(self):
        return APIClient()

    @pytest.fixture
    def user_etudiant(self):
        User = get_user_model()
        return User.objects.create_user(
            username='etudiant1',
            password='password123',
            email='etudiant1@test.com',
            role='etudiant'
        )

    @pytest.fixture
    def user_professeur(self):
        User = get_user_model()
        return User.objects.create_user(
            username='prof1',
            password='password123',
            email='prof1@test.com',
            role='enseignant'
        )

    @pytest.fixture
    def projet_data(self):
        return {
            'nom': 'Projet Test',
            'description': 'Description du projet test',
            'date_fin': (date.today() + timedelta(days=30)).isoformat(),
            'etat': EtatProjet.EN_ATTENTE,
            'membres': []
        }

    @pytest.fixture
    def projet(self, user_etudiant):
        return Projet.objects.create(
            nom='Projet Existant',
            description='Description du projet existant',
            date_fin=date.today() + timedelta(days=30),
            etat=EtatProjet.EN_ATTENTE,
            proprietaire=user_etudiant
        )

    def test_creation_projet(self, api_client, user_etudiant, projet_data):
        """Test la création d'un nouveau projet"""
        api_client.force_authenticate(user=user_etudiant)
        url = reverse('projet-list')
        response = api_client.post(url, projet_data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['nom'] == projet_data['nom']
        assert response.data['proprietaire']['id'] == user_etudiant.id

    def test_liste_projets(self, api_client, user_etudiant, projet):
        """Test la récupération de la liste des projets"""
        api_client.force_authenticate(user=user_etudiant)
        url = reverse('projet-list')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1

    def test_detail_projet(self, api_client, user_etudiant, projet):
        """Test la récupération des détails d'un projet"""
        api_client.force_authenticate(user=user_etudiant)
        url = reverse('projet-detail', kwargs={'pk': projet.id})
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['nom'] == projet.nom

    def test_modification_projet_proprietaire(self, api_client, user_etudiant, projet):
        """Test la modification d'un projet par son propriétaire"""
        api_client.force_authenticate(user=user_etudiant)
        url = reverse('projet-detail', kwargs={'pk': projet.id})
        donnees_modif = {'nom': 'Nouveau Nom'}
        response = api_client.patch(url, donnees_modif, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['nom'] == 'Nouveau Nom'

    def test_modification_projet_non_proprietaire(self, api_client, user_professeur, projet):
        """Test la modification d'un projet par un non-propriétaire"""
        api_client.force_authenticate(user=user_professeur)
        url = reverse('projet-detail', kwargs={'pk': projet.id})
        donnees_modif = {'nom': 'Nouveau Nom'}
        response = api_client.patch(url, donnees_modif, format='json')

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_suppression_projet_proprietaire(self, api_client, user_etudiant, projet):
        """Test la suppression d'un projet par son propriétaire"""
        api_client.force_authenticate(user=user_etudiant)
        url = reverse('projet-detail', kwargs={'pk': projet.id})
        response = api_client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Projet.objects.filter(id=projet.id).exists()

    def test_suppression_projet_non_proprietaire(self, api_client, user_professeur, projet):
        """Test la suppression d'un projet par un non-propriétaire"""
        api_client.force_authenticate(user=user_professeur)
        url = reverse('projet-detail', kwargs={'pk': projet.id})
        response = api_client.delete(url)

        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert Projet.objects.filter(id=projet.id).exists()

    def test_ajout_membre_etudiant(self, api_client, user_etudiant, projet):
        """Test l'ajout d'un membre étudiant à un projet"""
        autre_etudiant = get_user_model().objects.create_user(
            username='etudiant2',
            password='password123',
            role='etudiant'
        )

        api_client.force_authenticate(user=user_etudiant)
        url = reverse('projet-detail', kwargs={'pk': projet.id})
        data = {'membres': [autre_etudiant.id]}
        response = api_client.patch(url, data, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert autre_etudiant.id in response.data['membres']

    def test_etudiant_ne_peut_pas_ajouter_professeur(self, api_client, user_etudiant, projet):
        """Test qu'un étudiant ne peut pas ajouter un professeur comme membre"""
        professeur = get_user_model().objects.create_user(
            username='prof2',
            password='password123',
            role='enseignant'
        )

        api_client.force_authenticate(user=user_etudiant)
        url = reverse('projet-detail', kwargs={'pk': projet.id})
        data = {'membres': [professeur.id]}
        response = api_client.patch(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_projet_sans_authentification(self, api_client, projet_data):
        """Test l'accès aux projets sans authentification"""
        url = reverse('projet-list')

        # Test GET
        response_get = api_client.get(url)
        assert response_get.status_code == status.HTTP_401_UNAUTHORIZED

        # Test POST
        response_post = api_client.post(url, projet_data, format='json')
        assert response_post.status_code == status.HTTP_401_UNAUTHORIZED