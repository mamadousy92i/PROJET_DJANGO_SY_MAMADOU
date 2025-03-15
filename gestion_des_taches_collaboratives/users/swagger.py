# users/swagger.py
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema

# Documentation Login/Token
login_swagger = swagger_auto_schema(
    operation_description="Authentification d'un utilisateur - Obtention des tokens JWT",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['username', 'password'],
        properties={
            'username': openapi.Schema(type=openapi.TYPE_STRING, description="Nom d'utilisateur"),
            'password': openapi.Schema(type=openapi.TYPE_STRING, description="Mot de passe")
        }
    ),
    responses={
        200: openapi.Response(
            description="Authentification réussie",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'access': openapi.Schema(type=openapi.TYPE_STRING, description="Token d'accès JWT"),
                    'refresh': openapi.Schema(type=openapi.TYPE_STRING, description="Token de rafraîchissement")
                }
            )
        ),
        401: 'Identifiants invalides'
    }
)

# Documentation Inscription
register_swagger = swagger_auto_schema(
    operation_description="Inscription d'un nouvel utilisateur",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['username', 'password', 'email', 'nom', 'prenom', 'role'],
        properties={
            'username': openapi.Schema(type=openapi.TYPE_STRING, description="Nom d'utilisateur"),
            'password': openapi.Schema(type=openapi.TYPE_STRING, description="Mot de passe"),
            'email': openapi.Schema(type=openapi.TYPE_STRING, description="Adresse email"),
            'nom': openapi.Schema(type=openapi.TYPE_STRING, description="Nom"),
            'prenom': openapi.Schema(type=openapi.TYPE_STRING, description="Prénom"),
            'role': openapi.Schema(
                type=openapi.TYPE_STRING,
                description="Rôle de l'utilisateur",
                enum=['admin', 'enseignant', 'etudiant']
            ),
            'avatar': openapi.Schema(
                type=openapi.TYPE_FILE,
                description="Photo de profil (optionnel)"
            ),
        }
    ),
    responses={
        201: 'Compte créé avec succès. Les comptes enseignant et admin nécessitent une validation.',
        400: 'Données invalides'
    }
)

# Documentation Profil
profile_get_swagger = swagger_auto_schema(
    operation_description="Récupération du profil de l'utilisateur connecté",
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
        200: 'Profil récupéré avec succès',
        401: 'Non authentifié'
    }
)

profile_update_swagger = swagger_auto_schema(
    operation_description="Mise à jour du profil de l'utilisateur",
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
        properties={
            'email': openapi.Schema(type=openapi.TYPE_STRING, description="Email"),
            'nom': openapi.Schema(type=openapi.TYPE_STRING, description="Nom"),
            'prenom': openapi.Schema(type=openapi.TYPE_STRING, description="Prénom"),
            'avatar': openapi.Schema(type=openapi.TYPE_FILE, description="Photo de profil")
        }
    ),
    responses={
        200: 'Profil mis à jour avec succès',
        400: 'Données invalides',
        401: 'Non authentifié'
    }
)

# Documentation Liste Utilisateurs
user_list_swagger = swagger_auto_schema(
    operation_description="Liste de tous les utilisateurs",
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
        200: 'Liste des utilisateurs récupérée avec succès',
        401: 'Non authentifié'
    }
)

# Documentation Détail Utilisateur
user_detail_swagger = swagger_auto_schema(
    operation_description="Détails d'un utilisateur spécifique",
    manual_parameters=[
        openapi.Parameter(
            'id',
            openapi.IN_PATH,
            description="ID de l'utilisateur",
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
        200: 'Détails de l\'utilisateur récupérés avec succès',
        401: 'Non authentifié',
        404: 'Utilisateur non trouvé'
    }
)