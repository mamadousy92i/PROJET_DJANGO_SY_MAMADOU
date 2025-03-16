from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include, re_path
from django.contrib.auth import views as auth_views
from Gestion_des_taches_collaboratives import settings

# Imports pour Swagger
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Configuration de Swagger
schema_view = get_schema_view(
    openapi.Info(
        title="ESMT TaskFlow API",
        default_version='v1',
        description="API pour la gestion des tâches collaboratives à l'ESMT",
        terms_of_service="https://www.esmt.sn/terms/",
        contact=openapi.Contact(email="92mamadousy@gmail.com"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('accounts/', include('allauth.urls')),
    path('admin/', admin.site.urls),
    path('', include('projects.urls')),
    path('', include('tasks.urls')),
    path("", include("users.urls")),

    # URLs pour Swagger
    path('swagger<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)