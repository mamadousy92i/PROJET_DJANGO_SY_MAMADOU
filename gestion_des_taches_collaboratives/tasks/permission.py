from rest_framework import permissions
from .models import Tache
from projects.models import Projet


class EstProprietaireDuProjet(permissions.BasePermission):


    def has_permission(self, request, view):
        # Pour les méthodes de lecture (GET, HEAD, OPTIONS), on autorise tous les utilisateurs authentifiés
        if request.method in permissions.SAFE_METHODS:
            return True

        # Récupérer le projet depuis la requête (POST, PUT, GET)
        projet_id = request.data.get('projet') or view.kwargs.get('projet_id') or request.query_params.get('projet')
        if projet_id:
            try:
                projet = Projet.objects.get(id=projet_id)
                return projet.proprietaire == request.user
            except Projet.DoesNotExist:
                return False
        return False


class EstProprietaireOuAssigne(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):
        # Permettre à tous les utilisateurs authentifiés de voir les tâches (GET, HEAD, OPTIONS)
        if request.method in permissions.SAFE_METHODS:
            return True

        # Pour les méthodes de modification (PUT, PATCH, DELETE), vérifier les permissions
        # Si l'utilisateur est le propriétaire du projet
        if obj.projet.proprietaire == request.user:
            return True

        # Si l'utilisateur est assigné à la tâche
        if request.user in obj.assigne_a.all():
            return True

        return False