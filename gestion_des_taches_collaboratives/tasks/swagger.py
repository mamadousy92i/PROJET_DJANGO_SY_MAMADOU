# tasks/swagger.py
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema

# Documentation TacheListCreateView - GET
tache_list_swagger = swagger_auto_schema(
    operation_description="Liste des tâches, avec possibilité de filtrer par projet",
    manual_parameters=[
        # Paramètre dans l'en-tête pour l'authentification
        openapi.Parameter(
            'Authorization',
            openapi.IN_HEADER,
            description="Token JWT (format: Bearer <token>)",
            type=openapi.TYPE_STRING,
            required=True
        )
    ],
    responses={
        200: 'Liste des tâches récupérée avec succès',
        401: 'Non authentifié'
    }
)

# Documentation TacheListCreateView - GET avec ID de projet
tache_list_by_project_swagger = swagger_auto_schema(
    operation_description="Liste des tâches d'un projet spécifique",
    manual_parameters=[
        # Paramètre de chemin pour l'ID du projet (doit être obligatoire)
        openapi.Parameter(
            'projet_id',
            openapi.IN_PATH,
            description="ID du projet pour filtrer les tâches",
            type=openapi.TYPE_INTEGER,
            required=True
        ),
        # Paramètre dans l'en-tête pour l'authentification
        openapi.Parameter(
            'Authorization',
            openapi.IN_HEADER,
            description="Token JWT (format: Bearer <token>)",
            type=openapi.TYPE_STRING,
            required=True
        )
    ],
    responses={
        200: 'Liste des tâches du projet récupérée avec succès',
        401: 'Non authentifié',
        404: 'Projet non trouvé'
    }
)

# Documentation TacheListCreateView - POST
tache_create_swagger = swagger_auto_schema(
    operation_description="Création d'une nouvelle tâche dans un projet",
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
        required=['titre', 'description', 'projet', 'statut', 'date_limite'],
        properties={
            'titre': openapi.Schema(type=openapi.TYPE_STRING, description="Titre de la tâche"),
            'description': openapi.Schema(type=openapi.TYPE_STRING, description="Description détaillée de la tâche"),
            'projet': openapi.Schema(type=openapi.TYPE_INTEGER, description="ID du projet associé"),
            'statut': openapi.Schema(
                type=openapi.TYPE_STRING,
                description="Statut de la tâche",
                enum=['A_FAIRE', 'EN_COURS', 'TERMINE']
            ),
            'date_limite': openapi.Schema(
                type=openapi.TYPE_STRING,
                format=openapi.FORMAT_DATE,
                description="Date limite (format YYYY-MM-DD)"
            ),
            'assigne_a': openapi.Schema(
                type=openapi.TYPE_ARRAY,
                items=openapi.Schema(type=openapi.TYPE_INTEGER),
                description="Liste des IDs d'utilisateurs assignés à la tâche"
            )
        }
    ),
    responses={
        201: 'Tâche créée avec succès',
        400: 'Données invalides',
        401: 'Non authentifié',
        403: 'Vous n\'êtes pas autorisé à ajouter une tâche à ce projet'
    }
)

# Documentation TacheDetailView - GET
tache_detail_swagger = swagger_auto_schema(
    operation_description="Récupération des détails d'une tâche spécifique",
    manual_parameters=[
        openapi.Parameter(
            'pk',
            openapi.IN_PATH,
            description="ID de la tâche",
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
        200: 'Détails de la tâche récupérés avec succès',
        401: 'Non authentifié',
        403: 'Accès refusé',
        404: 'Tâche non trouvée'
    }
)

# Documentation TacheDetailView - PUT
tache_update_swagger = swagger_auto_schema(
    operation_description="Mise à jour d'une tâche spécifique",
    manual_parameters=[
        openapi.Parameter(
            'pk',
            openapi.IN_PATH,
            description="ID de la tâche",
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
            'titre': openapi.Schema(type=openapi.TYPE_STRING, description="Titre de la tâche"),
            'description': openapi.Schema(type=openapi.TYPE_STRING, description="Description détaillée de la tâche"),
            'statut': openapi.Schema(
                type=openapi.TYPE_STRING,
                description="Statut de la tâche",
                enum=['A_FAIRE', 'EN_COURS', 'TERMINE']
            ),
            'date_limite': openapi.Schema(
                type=openapi.TYPE_STRING,
                format=openapi.FORMAT_DATE,
                description="Date limite (format YYYY-MM-DD)"
            ),
            'assigne_a': openapi.Schema(
                type=openapi.TYPE_ARRAY,
                items=openapi.Schema(type=openapi.TYPE_INTEGER),
                description="Liste des IDs d'utilisateurs assignés à la tâche"
            )
        }
    ),
    responses={
        200: 'Tâche mise à jour avec succès',
        400: 'Données invalides ou un étudiant ne peut pas assigner une tâche à un enseignant',
        401: 'Non authentifié',
        403: 'Accès refusé',
        404: 'Tâche non trouvée'
    }
)

# Documentation TacheDetailView - DELETE
tache_delete_swagger = swagger_auto_schema(
    operation_description="Suppression d'une tâche spécifique",
    manual_parameters=[
        openapi.Parameter(
            'pk',
            openapi.IN_PATH,
            description="ID de la tâche",
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
        204: 'Tâche supprimée avec succès',
        401: 'Non authentifié',
        403: 'Accès refusé',
        404: 'Tâche non trouvée'
    }
)

# Documentation StatistiqueView
statistique_list_swagger = swagger_auto_schema(
    operation_description="Récupération des statistiques utilisateur (tâches terminées, primes, etc.)",
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
        200: 'Statistiques récupérées avec succès',
        401: 'Non authentifié'
    }
)

# Documentation TacheStatsView
tache_stats_swagger = swagger_auto_schema(
    operation_description="Récupération des statistiques globales des tâches",
    manual_parameters=[
        openapi.Parameter(
            'projet',
            openapi.IN_QUERY,
            description="ID du projet pour filtrer les statistiques (optionnel)",
            type=openapi.TYPE_INTEGER,
            required=False
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
        200: 'Statistiques récupérées avec succès',
        401: 'Non authentifié',
        500: 'Erreur serveur lors du calcul des statistiques'
    }
)

# Documentation TacheStatsView avec ID de projet
tache_stats_by_project_swagger = swagger_auto_schema(
    operation_description="Récupération des statistiques des tâches pour un projet spécifique",
    manual_parameters=[
        openapi.Parameter(
            'projet_id',
            openapi.IN_PATH,
            description="ID du projet pour filtrer les statistiques",
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
        200: 'Statistiques récupérées avec succès',
        401: 'Non authentifié',
        404: 'Projet non trouvé',
        500: 'Erreur serveur lors du calcul des statistiques'
    }
)