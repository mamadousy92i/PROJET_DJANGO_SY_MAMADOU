import pytest
from rest_framework.exceptions import ValidationError
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory
from projects.serializer import ProjetSerializer
from projects.models import Projet

# Obtenez le modèle CustomUser
CustomUser = get_user_model()


@pytest.mark.django_db
def test_projet_serializer_valid_data():
    """
    Teste la sérialisation avec des données valides pour un projet.
    """
    # Créer un utilisateur propriétaire (enseignant)
    proprietaire = CustomUser.objects.create_user(
        username="prof1",
        password="test123",
        role="enseignant"
    )

    # Créer un membre étudiant
    etudiant = CustomUser.objects.create_user(
        username="etu1",
        password="test123",
        role="etudiant"
    )

    # Données valides pour le serializer
    data = {
        "nom": "Projet Test",
        "description": "Un projet de test",
        "date_fin": "2025-12-31",
        "etat": "EN_ATTENTE",
        "membres": [etudiant.id]
    }

    # Simuler une requête avec un contexte utilisateur
    factory = APIRequestFactory()
    request = factory.post('/api/projets/', data)
    request.user = proprietaire

    # Instancier le serializer avec le contexte
    serializer = ProjetSerializer(data=data, context={'request': request})
    assert serializer.is_valid(), serializer.errors
    projet = serializer.save(proprietaire=proprietaire)

    # Vérifier les données sérialisées
    assert projet.nom == "Projet Test"
    assert projet.description == "Un projet de test"
    assert projet.etat == "EN_ATTENTE"
    assert projet.proprietaire == proprietaire
    assert etudiant in projet.membres.all()


@pytest.mark.django_db
def test_projet_serializer_etudiant_cannot_add_enseignant():
    """
    Teste que les étudiants ne peuvent pas ajouter des enseignants ou admins comme membres.
    """
    # Créer un utilisateur étudiant (qui fait la requête)
    etudiant_requete = CustomUser.objects.create_user(
        username="etu2",
        password="test123",
        role="etudiant"
    )

    # Créer un enseignant
    enseignant = CustomUser.objects.create_user(
        username="prof2",
        password="test123",
        role="enseignant"
    )

    # Données avec un enseignant comme membre
    data = {
        "nom": "Projet Etudiant",
        "description": "Projet étudiant",
        "date_fin": "2025-12-31",
        "etat": "EN_ATTENTE",
        "membres": [enseignant.id]
    }

    # Simuler une requête avec un étudiant comme utilisateur
    factory = APIRequestFactory()
    request = factory.post('/api/projets/', data)
    request.user = etudiant_requete

    # Instancier le serializer
    serializer = ProjetSerializer(data=data, context={'request': request})

    # Vérifier que la validation échoue
    with pytest.raises(ValidationError) as exc_info:
        serializer.is_valid(raise_exception=True)

    assert "Vous ne pouvez ajouter que des étudiants à un projet." in str(exc_info.value)


@pytest.mark.django_db
def test_projet_serializer_etudiant_can_add_etudiant():
    """
    Teste qu'un étudiant peut ajouter un autre étudiant comme membre.
    """
    # Créer un utilisateur étudiant (qui fait la requête)
    etudiant_requete = CustomUser.objects.create_user(
        username="etu3",
        password="test123",
        role="etudiant"
    )

    # Créer un autre étudiant
    etudiant_membre = CustomUser.objects.create_user(
        username="etu4",
        password="test123",
        role="etudiant"
    )

    # Données avec un étudiant comme membre
    data = {
        "nom": "Projet Etudiant",
        "description": "Projet étudiant",
        "date_fin": "2025-12-31",
        "etat": "EN_ATTENTE",
        "membres": [etudiant_membre.id]
    }

    # Simuler une requête avec un étudiant comme utilisateur
    factory = APIRequestFactory()
    request = factory.post('/api/projets/', data)
    request.user = etudiant_requete

    # Instancier le serializer
    serializer = ProjetSerializer(data=data, context={'request': request})
    assert serializer.is_valid(), serializer.errors
    projet = serializer.save(proprietaire=etudiant_requete)

    # Vérifier que le projet est créé avec le bon membre
    assert etudiant_membre in projet.membres.all()


@pytest.mark.django_db
def test_projet_serializer_serialization():
    """
    Teste la sérialisation d'un projet existant avec ses détails.
    """
    # Créer un utilisateur propriétaire
    proprietaire = CustomUser.objects.create_user(
        username="prof3",
        password="test123",
        role="enseignant"
    )

    # Créer un membre étudiant
    etudiant = CustomUser.objects.create_user(
        username="etu5",
        password="test123",
        role="etudiant"
    )

    # Créer un projet
    projet = Projet.objects.create(
        nom="Projet Existant",
        description="Description existante",
        date_fin="2025-12-31",
        etat="EN_COURS",
        proprietaire=proprietaire
    )
    projet.membres.add(etudiant)

    # Sérialiser le projet
    serializer = ProjetSerializer(projet)
    serialized_data = serializer.data

    # Vérifier les champs sérialisés
    assert serialized_data["nom"] == "Projet Existant"
    assert serialized_data["description"] == "Description existante"
    assert serialized_data["etat"] == "EN_COURS"
    assert serialized_data["proprietaire"]["username"] == "prof3"
    assert serialized_data["membres"] == [etudiant.id]
    assert len(serialized_data["membres_details"]) == 1
    assert serialized_data["membres_details"][0]["username"] == "etu5"


@pytest.mark.django_db
def test_projet_serializer_missing_required_fields():
    """
    Teste que le serializer rejette les données sans champs requis.
    """
    # Données incomplètes (manque nom et description)
    data = {
        "date_fin": "2025-12-31",
        "etat": "EN_ATTENTE",
        "membres": []
    }

    # Simuler une requête
    factory = APIRequestFactory()
    request = factory.post('/api/projets/', data)
    request.user = CustomUser.objects.create_user(username="user1", password="test123", role="enseignant")

    # Instancier le serializer
    serializer = ProjetSerializer(data=data, context={'request': request})
    assert not serializer.is_valid()
    assert "nom" in serializer.errors
    assert "description" in serializer.errors