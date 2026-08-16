"""
================================================================================
VIEWSETS RELACIONALES (POSTGRESQL) - VEHICLES Y RENTALS
================================================================================
Endpoints CRUD de:
- /api/vehicles/ (o /api/vehiculos/)
- /api/rentals/

INTEGRACIÓN HÍBRIDA:
Al crear un alquiler (POST /api/rentals/), se inserta automáticamente un evento inicial
en MongoDB (colección rental_events) con event_type='CREATED' y el ID del alquiler relacional.
"""

from datetime import datetime, timezone
from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Vehicles, Rentals
from .serializers import VehiclesSerializer, RentalsSerializer
from .permissions import IsAdminOrReadOnly
from .mongo import db


# ============================================================================
# VIEWSET: Vehículos (/api/vehicles/)
# ============================================================================
class VehiclesViewSet(viewsets.ModelViewSet):
    queryset = Vehicles.objects.all().order_by("id")
    serializer_class = VehiclesSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]

    # Filtros exactos
    filterset_fields = ["is_available", "brand"]
    # Búsqueda por texto
    search_fields = ["plate", "brand"]
    # Ordenamiento
    ordering_fields = ["id", "plate", "brand", "daily_rate", "is_available"]

    def perform_create(self, serializer):
        """
        Al crear un vehículo en PostgreSQL, genera una entrada inicial en fleet_logs (MongoDB).
        """
        vehicle = serializer.save()
        try:
            db["fleet_logs"].insert_one({
                "vehicle_id": vehicle.id,
                "action": "CREATED",
                "source": "SYSTEM",
                "note": f"Vehículo {vehicle.plate} ({vehicle.brand}) registrado con tarifa ${vehicle.daily_rate}/día",
                "created_at": datetime.now(timezone.utc)
            })
        except Exception:
            pass


# ============================================================================
# VIEWSET: Alquileres (/api/rentals/)
# ============================================================================
class RentalsViewSet(viewsets.ModelViewSet):
    queryset = Rentals.objects.select_related("vehicle").all().order_by("-id")
    serializer_class = RentalsSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]

    # Filtros exactos
    filterset_fields = ["status", "vehicle"]
    # Búsqueda por cliente, placa o marca del vehículo
    search_fields = ["customer_name", "status", "vehicle__plate", "vehicle__brand"]
    # Ordenamiento
    ordering_fields = ["id", "customer_name", "total", "status", "created_at"]

    def perform_create(self, serializer):
        """
        Al registrar un alquiler en PostgreSQL, genera automáticamente el evento
        operativo inicial en MongoDB (colección 'rental_events') vinculando rental_id.
        """
        rental = serializer.save()
        try:
            # Integración automática SQL -> NoSQL
            db["rental_events"].insert_one({
                "rental_id": rental.id,
                "event_type": "CREATED",
                "source": "SYSTEM",
                "note": f"Reserva inicial creada para {rental.customer_name} por un total de ${rental.total}",
                "created_at": datetime.now(timezone.utc)
            })
        except Exception:
            pass