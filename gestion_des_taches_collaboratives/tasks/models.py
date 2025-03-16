from django.db import models

# Create your models here.




from django.db import models
from users.models import CustomUser
from projects.models import Projet

class Tache(models.Model):
    STATUT_CHOICES = [
        ('A_FAIRE', 'À faire'),
        ('EN_COURS', 'En cours'),
        ('TERMINE', 'Terminé'),
    ]

    titre = models.CharField(max_length=200)
    description = models.TextField()
    date_limite = models.DateField()
    statut = models.CharField(max_length=10, choices=STATUT_CHOICES, default='A_FAIRE')
    projet = models.ForeignKey(Projet, on_delete=models.CASCADE, related_name="taches")
    assigne_a = models.ManyToManyField(CustomUser, related_name="taches_assignees")

    def __str__(self):
        return f"{self.titre} - {self.projet.nom} (Assigné à : {self.assigne_a})"





    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

