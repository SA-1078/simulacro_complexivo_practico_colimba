from rest_framework import serializers
from .models import Vehicles, Rentals

class VehiclesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicles
        fields = ["id", "plate", "brand", "daily_rate", "is_available"]

class RentalsSerializer(serializers.ModelSerializer):
    marca_nombre = serializers.CharField(source="marca.nombre", read_only=True)

    class Meta:
        model = Rentals
        fields = ["id", "marca", "marca_nombre", "modelo", "anio", "placa", "color", "creado_en"]