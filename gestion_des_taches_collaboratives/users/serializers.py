from rest_framework import serializers
from .models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'nom', 'prenom', 'avatar', 'role', 'is_active']

from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import CustomUser


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'nom', 'prenom', 'email', 'password', 'role', 'avatar']

    def create(self, validated_data):
        validated_data["password"] = make_password(validated_data["password"])

        # ici je desactive les comptes enseignant et admin et apres c'est un admin qui doit les approuver quoi
        if validated_data.get("role") in ["admin", "enseignant"]:
            validated_data["is_active"] = False

        return CustomUser.objects.create(**validated_data)


from rest_framework import serializers
from .models import CustomUser

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'nom', 'prenom', 'avatar', 'role']  # Ajout de nom et prenom
        extra_kwargs = {'username': {'read_only': True}, 'role': {'read_only': True}}  # Empêcher la modification du username et du role




from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        refresh = self.user.get_token()
        data['access'] = str(refresh.access_token)
        data['refresh'] = str(refresh)

        return data


