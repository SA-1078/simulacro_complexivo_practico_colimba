"""
================================================================================
RUTAS PRINCIPALES DEL BACKEND (config/urls.py)
================================================================================
Define los puntos de entrada para:
- Panel admin de Django (/admin/)
- Autenticación JWT (/api/auth/login/, /api/auth/refresh/, /api/auth/register/)
- Endpoints de la API (/api/...)
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from gestion.auth_views import register_view

urlpatterns = [
    # Panel de administración de Django
    path("admin/", admin.site.urls),

    # Autenticación JWT (Simple JWT)
    path("api/auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/register/", register_view, name="register"),

    # Rutas de la app 'gestion' (PostgreSQL + MongoDB)
    path("api/", include("gestion.urls")),
]