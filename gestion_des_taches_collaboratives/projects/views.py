from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Projet
from .permission import EstProprietaireOuLectureSeule
from .serializer import ProjetSerializer
from .swagger import (
    projet_list_swagger,
    projet_create_swagger,
    projet_detail_swagger,
    projet_update_swagger,
    projet_delete_swagger
)

class ProjetListCreateView(generics.ListCreateAPIView):
    """Liste les projets et permet d'en créer un nouveau"""
    queryset = Projet.objects.all()
    serializer_class = ProjetSerializer
    permission_classes = [IsAuthenticated]

    @projet_list_swagger
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @projet_create_swagger
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

    def perform_create(self, serializer):
        """Associe le projet au créateur"""
        serializer.save(proprietaire=self.request.user)

class ProjetDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Permet de récupérer, modifier ou supprimer un projet"""
    queryset = Projet.objects.all()
    serializer_class = ProjetSerializer
    permission_classes = [IsAuthenticated, EstProprietaireOuLectureSeule]  # ✅ Protection par permission

    @projet_detail_swagger
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @projet_update_swagger
    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)

    @projet_update_swagger
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

    @projet_delete_swagger
    def delete(self, request, *args, **kwargs):
        return super().delete(request, *args, **kwargs)