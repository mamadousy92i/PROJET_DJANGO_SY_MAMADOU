from django import forms
from .models import Tache
from projects.models import Projet

from django import forms
from tasks.models import Tache
from users.models import CustomUser

class TacheForm(forms.ModelForm):
    class Meta:
        model = Tache
        fields = ['titre', 'description', 'date_limite', 'statut', 'assigne_a']

    def __init__(self, *args, **kwargs):
        projet = kwargs.pop('projet', None)
        user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.statut == "Terminé":
            self.fields['statut'].disabled = True

        if projet:
            self.fields['assigne_a'].queryset = projet.membres.all()

        if user and not user.is_superuser:
            self.fields['assigne_a'].queryset = self.fields['assigne_a'].queryset.exclude(role__in=['admin', 'enseignant'])

