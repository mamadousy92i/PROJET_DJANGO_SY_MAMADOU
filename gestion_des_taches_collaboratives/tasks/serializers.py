from rest_framework import serializers
from .models import Tache

from users.models import CustomUser

from rest_framework import serializers
from .models import Tache
from users.models import CustomUser
from users.serializers import UserSerializer

class TacheSerializer(serializers.ModelSerializer):
    # Utilisé pour l'écriture (création/modification)
    assigne_a = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(),
        many=True
    )

    #  Utilisé pour la lecture (retourne les détails complets)
    assigne_a_detail = UserSerializer(source='assigne_a', many=True, read_only=True)

    class Meta:
        model = Tache
        fields = '__all__'





from rest_framework import serializers

class StatistiqueSerializer(serializers.Serializer):
    utilisateur = serializers.CharField(source="username")
    role = serializers.CharField()
    taches_totales = serializers.IntegerField()
    taches_terminees = serializers.IntegerField()
    taches_terminees_recent = serializers.IntegerField()
    taches_terminees_annuelles = serializers.IntegerField()
    taux_completion = serializers.FloatField()
    prime = serializers.CharField()
    badge = serializers.SerializerMethodField()

    def get_badge(self, obj):
        if obj.taux_completion == 100:
            return "Top Performer"
        elif obj.taux_completion >= 90:
            return "Très bon"
        elif obj.taux_completion >= 70:
            return "Bon"
        else:
            return "En progrès"
