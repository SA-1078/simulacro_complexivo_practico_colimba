"""
================================================================================
PERMISOS PERSONALIZADOS - CONTROL DE ACCESO BASADO EN ROLES
================================================================================
Permite consultas públicas de lectura (GET), pero exige rol de administrador/staff
para crear, modificar o eliminar registros relacionales.
"""

from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.is_staff
        )