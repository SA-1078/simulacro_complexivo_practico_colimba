"""
================================================================================
SERIALIZADORES NOSQL (MONGODB) - VALIDACIÓN DE ESQUEMAS
================================================================================
Valida documentos antes de guardarlos en MongoDB en las colecciones:
1. fleet_logs (Bitácora de cambios de flota de vehículos)
2. rental_events (Eventos operacionales vinculados a alquileres)
"""

from rest_framework import serializers


class FleetAction:
    CREATED = "CREATED"
    UPDATED = "UPDATED"
    MAINTENANCE = "MAINTENANCE"
    DISABLED = "DISABLED"

    CHOICES = [
        (CREATED, "CREATED"),
        (UPDATED, "UPDATED"),
        (MAINTENANCE, "MAINTENANCE"),
        (DISABLED, "DISABLED"),
    ]


class RentalEventType:
    CREATED = "CREATED"
    PICKED_UP = "PICKED_UP"
    RETURNED = "RETURNED"
    PAID = "PAID"
    CANCELLED = "CANCELLED"

    CHOICES = [
        (CREATED, "CREATED"),
        (PICKED_UP, "PICKED_UP"),
        (RETURNED, "RETURNED"),
        (PAID, "PAID"),
        (CANCELLED, "CANCELLED"),
    ]


class EventSource:
    WEB = "WEB"
    MOBILE = "MOBILE"
    SYSTEM = "SYSTEM"

    CHOICES = [
        (WEB, "WEB"),
        (MOBILE, "MOBILE"),
        (SYSTEM, "SYSTEM"),
    ]


# Schema para la colección MongoDB 'fleet_logs'
class FleetLogsSerializer(serializers.Serializer):
    vehicle_id = serializers.IntegerField()
    action = serializers.ChoiceField(
        choices=FleetAction.CHOICES,
        default=FleetAction.CREATED
    )
    source = serializers.ChoiceField(
        choices=EventSource.CHOICES,
        default=EventSource.SYSTEM
    )
    note = serializers.CharField(max_length=200, required=False, allow_blank=True, default="")
    created_at = serializers.DateTimeField(required=False)


# Schema para la colección MongoDB 'rental_events'
class RentalEventsSerializer(serializers.Serializer):
    rental_id = serializers.IntegerField()
    event_type = serializers.ChoiceField(
        choices=RentalEventType.CHOICES,
        default=RentalEventType.CREATED
    )
    source = serializers.ChoiceField(
        choices=EventSource.CHOICES,
        default=EventSource.WEB
    )
    note = serializers.CharField(max_length=200, required=False, allow_blank=True, default="")
    created_at = serializers.DateTimeField(required=False)
