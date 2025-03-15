from rest_framework import generics, serializers, permissions
from projects.models import Projet
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics
from .models import Tache
from .serializers import TacheSerializer
from .permission import EstProprietaireDuProjet, EstProprietaireOuAssigne
from .swagger import (
    tache_list_swagger,
    tache_list_by_project_swagger,  # Nouveau décorateur pour la liste par projet
    tache_create_swagger,
    tache_detail_swagger,
    tache_update_swagger,
    tache_delete_swagger,
    statistique_list_swagger,
    tache_stats_swagger,
    tache_stats_by_project_swagger  # Nouveau décorateur pour les stats par projet
)

# ✅ Seuls les créateurs du projet peuvent ajouter une tâche
class TacheListCreateView(generics.ListCreateAPIView):
    serializer_class = TacheSerializer
    permission_classes = [permissions.IsAuthenticated, EstProprietaireDuProjet]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['statut', 'date_limite', 'assigne_a', 'projet']

    def get_queryset(self):
        projet_id = self.kwargs.get('projet_id')
        if projet_id:
            return Tache.objects.filter(projet_id=projet_id)
        return Tache.objects.all()

    # Utiliser le décorateur approprié selon la présence ou non d'un projet_id
    def get(self, request, *args, **kwargs):
        if 'projet_id' in self.kwargs:
            return self.list(request, *args, **kwargs)
        return self.list(request, *args, **kwargs)

    # Le décorateur original peut être utilisé pour POST car il ne dépend pas du projet_id
    @tache_create_swagger
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

    def perform_create(self, serializer):
        projet_id = self.request.data.get('projet')
        projet = Projet.objects.get(id=projet_id)

        # ✅ Vérification du propriétaire du projet
        if projet.proprietaire != self.request.user:
            raise serializers.ValidationError("Vous n'êtes pas autorisé à ajouter une tâche à ce projet.")

        # ✅ Enregistrer la tâche
        serializer.save(projet=projet)


# ✅ Seuls les créateurs ou l'assigné peuvent modifier ou supprimer la tâche
class TacheDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Tache.objects.all()
    serializer_class = TacheSerializer
    permission_classes = [permissions.IsAuthenticated, EstProprietaireOuAssigne]

    @tache_detail_swagger
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @tache_update_swagger
    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)

    @tache_update_swagger
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

    @tache_delete_swagger
    def delete(self, request, *args, **kwargs):
        return super().delete(request, *args, **kwargs)

    def perform_update(self, serializer):
        instance = serializer.save()

        # ✅ Itérer sur la liste d'utilisateurs
        for user in instance.assigne_a.all():
            if user.role == "enseignant" and self.request.user.role == "etudiant":
                raise serializers.ValidationError("Un étudiant ne peut pas assigner une tâche à un enseignant.")

        return instance


from django.utils.timezone import now
from datetime import timedelta
from rest_framework.permissions import IsAuthenticated
from .serializers import StatistiqueSerializer
from users.models import CustomUser
from django.db.models import Count, Q

# ici boul faté pourque sa marche faut mettre dans setting USE_TZ = False a cause des date la
class StatistiqueView(generics.ListAPIView):
    serializer_class = StatistiqueSerializer
    permission_classes = [IsAuthenticated]

    @statistique_list_swagger
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        today = now().date()
        il_y_a_3_mois = today - timedelta(days=90)
        il_y_a_1_an = today - timedelta(days=365)

        utilisateurs = CustomUser.objects.annotate(
            taches_totales=Count('taches_assignees'),
            taches_terminees=Count('taches_assignees', filter=Q(taches_assignees__statut="TERMINE")),
            taches_terminees_recent=Count('taches_assignees', filter=Q(
                taches_assignees__statut="TERMINE",
                taches_assignees__date_limite__gte=il_y_a_3_mois
            )),
            taches_terminees_annuelles=Count('taches_assignees', filter=Q(
                taches_assignees__statut="TERMINE",
                taches_assignees__date_limite__gte=il_y_a_1_an
            )),
        ).all()

        for user in utilisateurs:
            user.taux_completion = round(
                (user.taches_terminees / user.taches_totales * 100) if user.taches_totales > 0 else 0, 2
            )
            user.role = getattr(user, 'role', 'Utilisateur')
            if user.role == "enseignant":
                if user.taux_completion == 100:
                    user.prime = "100000$"
                elif user.taux_completion >= 90:
                    user.prime = "30000$"
                else:
                    user.prime = "0$"
            else:
                user.prime = "Non concerné"

        return utilisateurs


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status


class TacheStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, projet_id=None):
        # Utiliser le décorateur approprié selon la présence ou non d'un projet_id
        if projet_id is not None:
            return self._get_stats_by_project_id(request, projet_id)
        else:
            return self._get_global_stats(request)

    @tache_stats_swagger
    def _get_global_stats(self, request):
        try:
            projet_param = request.query_params.get('projet')
            if projet_param:
                queryset = Tache.objects.filter(projet_id=projet_param)
            else:
                queryset = Tache.objects.all()

            # Utiliser 'statut' à la fois pour le filtrage et les clés de réponse
            stats = {
                'total': queryset.count(),
                'a_faire': queryset.filter(statut='A_FAIRE').count(),
                'en_cours': queryset.filter(statut='EN_COURS').count(),
                'termine': queryset.filter(statut='TERMINE').count(),
            }

            # Calculer le pourcentage de progression
            if stats['total'] > 0:
                stats['progression'] = round((stats['termine'] / stats['total']) * 100)
            else:
                stats['progression'] = 0

            return Response(stats)
        except Exception as e:
            print(f"Erreur dans TacheStatsView: {str(e)}")
            return Response(
                {"error": "Une erreur s'est produite lors du calcul des statistiques."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @tache_stats_by_project_swagger
    def _get_stats_by_project_id(self, request, projet_id):
        try:
            queryset = Tache.objects.filter(projet_id=projet_id)

            stats = {
                'total': queryset.count(),
                'a_faire': queryset.filter(statut='A_FAIRE').count(),
                'en_cours': queryset.filter(statut='EN_COURS').count(),
                'termine': queryset.filter(statut='TERMINE').count(),
            }

            # Calculer le pourcentage de progression
            if stats['total'] > 0:
                stats['progression'] = round((stats['termine'] / stats['total']) * 100)
            else:
                stats['progression'] = 0

            return Response(stats)
        except Exception as e:
            print(f"Erreur dans TacheStatsView: {str(e)}")
            return Response(
                {"error": "Une erreur s'est produite lors du calcul des statistiques."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )