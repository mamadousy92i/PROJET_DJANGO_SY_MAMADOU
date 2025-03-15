"""
WSGI config for Gestion_des_taches_collaboratives project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Gestion_des_taches_collaboratives.settings')

application = get_wsgi_application()
