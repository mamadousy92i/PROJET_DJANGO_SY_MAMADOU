
from django import forms

from users.models import CustomUser
from .models import Projet

class ProjetForm(forms.ModelForm):
    class Meta:
        model = Projet
        fields = ['nom', 'description', 'date_fin', 'etat', 'membres']
        widgets = {
            'membres': forms.CheckboxSelectMultiple()  # Permettre la sélection multiple avec des checkboxes
        }

    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)  # Récupérer l'utilisateur
        super().__init__(*args, **kwargs)

        if user:
            queryset = CustomUser.objects.exclude(id=user.id)  # Exclure le créateur du projet

            if user.role == "etudiant":
                queryset = queryset.filter(role="etudiant")  # Un étudiant ne voit que d'autres étudiants
            elif user.role == "enseignant":
                queryset = queryset.filter(role__in=["etudiant", "enseignant"])  # Un enseignant voit étudiants + enseignants
            else:
                queryset = CustomUser.objects.none()  # Aucun membre disponible pour l'admin

            self.fields['membres'].queryset = queryset  # Appliquer le filtre




