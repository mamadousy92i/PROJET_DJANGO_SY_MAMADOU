from rest_framework import permissions


class EstProprietaireOuLectureSeule(permissions.BasePermission):
    """
    Seul le propriétaire peut modifier ou supprimer le projet.
    """

    def has_object_permission(self, request, view, obj):
        # Autoriser la lecture pour toutes les requêtes (GET, HEAD, OPTIONS)
        if request.method in permissions.SAFE_METHODS:
            return True

        # Seul le propriétaire peut modifier ou supprimer le projet
        return obj.proprietaire == request.user
