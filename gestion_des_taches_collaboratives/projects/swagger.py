# projects/swagger.py
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema

# Documentation ProjetListCreateView - GET
projet_list_swagger = swagger_auto_schema(
    operation_description="Liste de tous les projets accessibles par l'utilisateur",
    manual_parameters=[
        openapi.Parameter(
            'Authorization',
            openapi.IN_HEADER,
            description="Token JWT (format: Bearer <token>)",
            type=openapi.TYPE_STRING,
            required=True
        )
    ],
    responses={
        200: 'Liste des projets récupérée avec succès',
        401: 'Non authentifié'
    }
)

# Documentation ProjetListCreateView - POST
projet_create_swagger = swagger_auto_schema(
    operation_description="Création d'un nouveau projet",
    manual_parameters=[
        openapi.Parameter(
            'Authorization',
            openapi.IN_HEADER,
            description="Token JWT (format: Bearer <token>)",
            type=openapi.TYPE_STRING,
            required=True
        )
    ],
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['titre', 'description'],
        properties={
            'titre': openapi.Schema(type=openapi.TYPE_STRING, description="Titre du projet"),
            'description': openapi.Schema(type=openapi.TYPE_STRING, description="Description détaillée du projet"),
            'date_debut': openapi.Schema(
                type=openapi.TYPE_STRING,
                format=openapi.FORMAT_DATE,
                description="Date de début du projet (format YYYY-MM-DD)"
            ),
            'date_fin': openapi.Schema(
                type=openapi.TYPE_STRING,
                format=openapi.FORMAT_DATE,
                description="Date de fin prévue du projet (format YYYY-MM-DD)"
            )
        }
    ),
    responses={
        201: 'Projet créé avec succès',
        400: 'Données invalides',
        401: 'Non authentifié'
    }
)

# Documentation ProjetDetailView - GET
projet_detail_swagger = swagger_auto_schema(
    operation_description="Récupération des détails d'un projet spécifique",
    manual_parameters=[
        openapi.Parameter(
            'pk',
            openapi.IN_PATH,
            description="ID du projet",
            type=openapi.TYPE_INTEGER,
            required=True
        ),
        openapi.Parameter(
            'Authorization',
            openapi.IN_HEADER,
            description="Token JWT (format: Bearer <token>)",
            type=openapi.TYPE_STRING,
            required=True
        )
    ],
    responses={
        200: 'Détails du projet récupérés avec succès',
        401: 'Non authentifié',
        403: 'Accès refusé',
        404: 'Projet non trouvé'
    }
)

# Documentation ProjetDetailView - PUT
projet_update_swagger = swagger_auto_schema(
    operation_description="Mise à jour d'un projet spécifique (propriétaire uniquement)",
    manual_parameters=[
        openapi.Parameter(
            'pk',
            openapi.IN_PATH,
            description="ID du projet",
            type=openapi.TYPE_INTEGER,
            required=True
        ),
        openapi.Parameter(
            'Authorization',
            openapi.IN_HEADER,
            description="Token JWT (format: Bearer <token>)",
            type=openapi.TYPE_STRING,
            required=True
        )
    ],
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'titre': openapi.Schema(type=openapi.TYPE_STRING, description="Titre du projet"),
            'description': openapi.Schema(type=openapi.TYPE_STRING, description="Description détaillée du projet"),
            'date_debut': openapi.Schema(
                type=openapi.TYPE_STRING,
                format=openapi.FORMAT_DATE,
                description="Date de début du projet (format YYYY-MM-DD)"
            ),
            'date_fin': openapi.Schema(
                type=openapi.TYPE_STRING,
                format=openapi.FORMAT_DATE,
                description="Date de fin prévue du projet (format YYYY-MM-DD)"
            )
        }
    ),
    responses={
        200: 'Projet mis à jour avec succès',
        400: 'Données invalides',
        401: 'Non authentifié',
        403: 'Accès refusé - Seul le propriétaire peut modifier un projet',
        404: 'Projet non trouvé'
    }
)

# Documentation ProjetDetailView - DELETE
projet_delete_swagger = swagger_auto_schema(
    operation_description="Suppression d'un projet spécifique (propriétaire uniquement)",
    manual_parameters=[
        openapi.Parameter(
            'pk',
            openapi.IN_PATH,
            description="ID du projet",
            type=openapi.TYPE_INTEGER,
            required=True
        ),
        openapi.Parameter(
            'Authorization',
            openapi.IN_HEADER,
            description="Token JWT (format: Bearer <token>)",
            type=openapi.TYPE_STRING,
            required=True
        )
    ],
    responses={
        204: 'Projet supprimé avec succès',
        401: 'Non authentifié',
        403: 'Accès refusé - Seul le propriétaire peut supprimer un projet',
        404: 'Projet non trouvé'
    }
)