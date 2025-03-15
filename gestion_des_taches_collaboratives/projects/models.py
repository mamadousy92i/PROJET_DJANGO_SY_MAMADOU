from django.db import models
from django.urls import reverse
from users.models import CustomUser

class EtatProjet(models.TextChoices):
    EN_ATTENTE = 'EN_ATTENTE', 'En attente'
    EN_COURS = 'EN_COURS', 'En cours'
    TERMINE = 'TERMINE', 'Terminé'

class Projet(models.Model):
    nom = models.CharField(max_length=200)
    description = models.TextField()
    date_creation = models.DateField(auto_now_add=True)
    date_fin = models.DateField()
    etat = models.CharField(
        max_length=10,
        choices=EtatProjet.choices,
        default=EtatProjet.EN_ATTENTE
    )
    proprietaire = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    membres = models.ManyToManyField(CustomUser, related_name='projets')

    class Meta:
        db_table = 'projets'

    def __str__(self):
        return f"{self.nom} - {self.proprietaire} ({self.get_etat_display()})"

    def get_absolute_url(self):
        return reverse('projet_detail', kwargs={'pk': self.pk})

class StatutTache(models.TextChoices):
    A_FAIRE = 'A_FAIRE', 'À faire'
    EN_COURS = 'EN_COURS', 'En cours'
    TERMINE = 'TERMINE', 'Terminé'


