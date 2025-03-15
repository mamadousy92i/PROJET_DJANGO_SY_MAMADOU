from rest_framework import serializers

from users.serializers import UserSerializer
from .models import Projet
from users.models import CustomUser

# Serializer pour le propriétaire
class ProprietaireSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username']


class ProjetSerializer(serializers.ModelSerializer):
    proprietaire = ProprietaireSerializer(read_only=True)
    membres = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all(), many=True)

    # Nouveau champ pour les détails des membres
    membres_details = UserSerializer(source='membres', many=True, read_only=True)

    class Meta:
        model = Projet
        fields = '__all__'



    def validate_membres(self, membres):
        """ Empêcher un étudiant d'ajouter un enseignant ou un admin """
        request = self.context.get('request')
        if request and request.user.role == "etudiant":
            for membre in membres:
                if membre.role != "etudiant":
                    raise serializers.ValidationError("Vous ne pouvez ajouter que des étudiants à un projet.")
        return membres
