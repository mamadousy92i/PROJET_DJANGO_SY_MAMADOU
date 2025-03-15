from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import CustomUser

# forms.py
from django import forms
from .models import CustomUser
from django.contrib.auth.forms import UserCreationForm

class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'nom', 'prenom', 'avatar', 'role', 'password1', 'password2']

    def save(self, commit=True):
        user = super().save(commit=False)
        # Désactiver le compte si rôle est Admin ou Enseignant
        if user.role in ['admin', 'enseignant']:
            user.is_active = False
        if commit:
            user.save()
        return user
class CustomUserUpdateForm(forms.ModelForm):
    class Meta:
        model = CustomUser
        fields = ['nom', 'prenom', 'email', 'avatar']
        widgets = {
            'nom': forms.TextInput(attrs={'class': 'modern-input'}),
            'prenom': forms.TextInput(attrs={'class': 'modern-input'}),
            'email': forms.EmailInput(attrs={'class': 'modern-input'}),
            'avatar': forms.FileInput(attrs={'class': 'hidden-upload'}),
        }