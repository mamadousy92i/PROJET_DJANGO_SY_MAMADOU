"""
Django settings for Gestion_des_taches_collaboratives project.

Generated by 'django-admin startproject' using Django 5.1.6.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.1/ref/settings/
"""

from pathlib import Path
import os


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-oz=2$_mada1rt3)hp!2@rb5)cn891e++!56hb#l=@=3x135)2u'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []
TEMPLATE_DIR = BASE_DIR / 'users/templates'

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_extensions',

    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'django.contrib.sites',

    'users',
    'projects',
    'tasks',
    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt',
'django_filters',
'drf_yasg',
]

MIDDLEWARE = [
'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
]

ROOT_URLCONF = 'Gestion_des_taches_collaboratives.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            os.path.join(BASE_DIR, 'users', 'templates', 'users'),
            os.path.join(BASE_DIR, 'projects', 'templates', 'projects'),  # ✅ Correct
            os.path.join(BASE_DIR, 'tasks', 'templates', 'tasks'),  # ✅ Correct

        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]




WSGI_APPLICATION = 'Gestion_des_taches_collaboratives.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'ATOMIC_REQUESTS' : True,
        'NAME': 'gestion_taches_collaboratives',
        'USER': 'root',
        'PASSWORD': '',
        'HOST': 'localhost',
        'PORT': '3306',
        'OPTIONS': {
            'charset': 'utf8mb4',
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
        },

    }
}
SITE_ID = 1



# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


AUTH_USER_MODEL = 'users.CustomUser'

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',  # Authentification classique Django
    'allauth.account.auth_backends.AuthenticationBackend',  # Ajoute la gestion par allauth
]

# Configuration pour django-allauth
ACCOUNT_LOGIN_METHODS = {"username"}
  # Authentification par username
ACCOUNT_EMAIL_REQUIRED = True  # L'email est obligatoire pour l'inscription
ACCOUNT_USERNAME_REQUIRED = True  # On garde le username
ACCOUNT_EMAIL_VERIFICATION = 'optional'  # On ne force pas la vérification email
ACCOUNT_SIGNUP_REDIRECT_URL = 'home' # Redirige après inscription
ACCOUNT_LOGOUT_REDIRECT_URL = '/users/login/'  # Redirige après déconnexion
LOGIN_REDIRECT_URL = 'home'  # Redirige après connexion
LOGIN_URL = '/users/login/'  # URL de la page de connexion
LOGOUT_REDIRECT_URL = 'home'

# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = False

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

import os

STATIC_URL = '/static/'

STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "projects/static/projects"),
    os.path.join(BASE_DIR, "users/static/users"),
    os.path.join(BASE_DIR, "tasks/static/tasks"),

]


STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")  # 📌 Ajout de cette ligne





# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
}

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # pour que je puisse utiliser mon  frontend React
]

CORS_ALLOW_CREDENTIALS = True
