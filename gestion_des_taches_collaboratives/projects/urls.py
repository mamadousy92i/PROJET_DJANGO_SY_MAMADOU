from django.urls import path
from .views import ProjetListCreateView, ProjetDetailView

urlpatterns = [
    path('api/projets/', ProjetListCreateView.as_view(), name='projet-list'),
    path('api/projets/<int:pk>/', ProjetDetailView.as_view(), name='projet-detail'),
]
