# admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserCreationForm
from .models import CustomUser


class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'nom', 'prenom', 'role')

    def save(self, commit=True):
        user = super().save(commit=False)
        if user.role in ['admin', 'enseignant']:
            user.is_active = False  # Désactive les comptes admin/enseignant
        if commit:
            user.save()
        return user


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    form = UserAdmin.form
    add_form = CustomUserCreationForm
    list_display = ('username', 'email', 'nom', 'prenom', 'role', 'is_active', 'date_joined')
    list_filter = ('is_active', 'role', 'date_joined')
    search_fields = ('username', 'email', 'nom', 'prenom')
    ordering = ('-date_joined',)
    actions = ['activate_users', 'deactivate_users']

    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Informations personnelles', {
            'fields': ('nom', 'prenom', 'email', 'avatar')
        }),
        ('Permissions', {
            'fields': ('is_active', 'role', 'groups', 'user_permissions', 'is_staff', 'is_superuser')
        }),
        ('Dates importantes', {
            'fields': ('last_login', 'date_joined')
        }),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'username',
                'password1',
                'password2',
                'email',
                'nom',
                'prenom',
                'role',
                'avatar'
            ),
        }),
    )

    def activate_users(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f"{updated} compte(s) activé(s) avec succès.")

    def deactivate_users(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f"{updated} compte(s) désactivé(s) avec succès.")

    activate_users.short_description = "Activer les comptes sélectionnés"
    deactivate_users.short_description = "Désactiver les comptes sélectionnés"

