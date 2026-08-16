"""
================================================================================
MODELOS RELACIONALES (POSTGRESQL) - GESTIÓN DE ALQUILER DE VEHÍCULOS
================================================================================
Define las tablas relacionales:
1. Vehicles (Vehículos disponibles para alquiler)
2. Rentals (Alquileres registrados con relación foránea a Vehicles)
"""

from django.db import models


class RentalStatus(models.TextChoices):
    RESERVED = "RESERVED", "RESERVED"      # Alquiler reservado
    ACTIVE = "ACTIVE", "ACTIVE"            # Alquiler en curso / vehículo entregado
    CLOSED = "CLOSED", "CLOSED"            # Alquiler finalizado y liquidado
    CANCELLED = "CANCELLED", "CANCELLED"    # Alquiler cancelado


# ============================================================================
# TABLA: vehicles (Vehículos en PostgreSQL)
# ============================================================================
class Vehicles(models.Model):
    # plate: Placa única del vehículo (ej: 'PBA-1020')
    plate = models.CharField(max_length=10, unique=True)
    # brand: Marca y modelo comercial (ej: 'Toyota RAV4')
    brand = models.CharField(max_length=40)
    # daily_rate: Tarifa diaria de alquiler
    daily_rate = models.DecimalField(max_digits=10, decimal_places=2)
    # is_available: Disponibilidad actual del vehículo
    is_available = models.BooleanField(default=True)

    class Meta:
        db_table = "vehicles"
        verbose_name = "Vehicle"
        verbose_name_plural = "Vehicles"

    def __str__(self):
        return f"{self.plate} - {self.brand} (${self.daily_rate}/día)"


# ============================================================================
# TABLA: rentals (Alquileres en PostgreSQL)
# ============================================================================
class Rentals(models.Model):
    # vehicle: Llave foránea hacia Vehicles con protección de borrado
    vehicle = models.ForeignKey(
        Vehicles,
        on_delete=models.PROTECT,
        related_name="rentals",
        db_column="vehicle_id"
    )
    # customer_name: Nombre completo del cliente que alquila
    customer_name = models.CharField(max_length=120)
    # total: Monto total facturado por el alquiler
    total = models.DecimalField(max_digits=10, decimal_places=2)
    # status: Estado del alquiler limitado a los valores de RentalStatus
    status = models.CharField(
        max_length=20,
        choices=RentalStatus.choices,
        default=RentalStatus.RESERVED
    )
    # created_at: Fecha y hora de creación del registro
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "rentals"
        verbose_name = "Rental"
        verbose_name_plural = "Rentals"

    def __str__(self):
        return f"Alquiler #{self.id}: {self.customer_name} ({self.status}) - ${self.total}"
