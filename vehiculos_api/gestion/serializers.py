"""
================================================================================
SERIALIZADORES RELACIONALES (POSTGRESQL) - DJANGO REST FRAMEWORK
================================================================================
Serializadores para Vehicles y Rentals, facilitando la lectura con datos
enriquecidos (placa y marca del vehículo) y validación de tipos.
"""

from rest_framework import serializers
from .models import Vehicles, Rentals


class VehiclesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicles
        fields = ["id", "plate", "brand", "daily_rate", "is_available"]
        read_only_fields = ["id"]


class RentalsSerializer(serializers.ModelSerializer):
    # Campos adicionales de solo lectura para enriquecer la respuesta
    vehicle_plate = serializers.CharField(source="vehicle.plate", read_only=True)
    vehicle_brand = serializers.CharField(source="vehicle.brand", read_only=True)

    class Meta:
        model = Rentals
        fields = [
            "id",
            "vehicle",
            "vehicle_plate",
            "vehicle_brand",
            "customer_name",
            "total",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]