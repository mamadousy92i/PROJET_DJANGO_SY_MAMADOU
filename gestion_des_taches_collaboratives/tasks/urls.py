from django.urls import path

from . import views
from .views import TacheListCreateView, TacheDetailView, StatistiqueView, TacheStatsView

urlpatterns = [
    path('api/taches/', TacheListCreateView.as_view(), name='tache-list'),
    path('api/taches/<int:pk>/', TacheDetailView.as_view(), name='tache-detail'),
    path('api/projets/<int:projet_id>/taches/', TacheListCreateView.as_view(), name='projet-tache-list'),
    path('api/statistiques/', StatistiqueView.as_view(), name='statistiques'),

    # Routes pour les statistiques des tâches
    path('api/tache-stats/', TacheStatsView.as_view(), name='tache-stats'),
    path('api/projets/<int:projet_id>/tache-stats/', TacheStatsView.as_view(), name='tache-stats-projet'),

]