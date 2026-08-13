from rest_framework import serializers

class ActionTypes:
        CREATED = "creado"
        UPDATED = "actualizado"
        MAINTENANCE = "mantenimiento"
        DISABLED = "deshabilitado"

        CHOICES = [
            (CREATED, "Creado"),
            (UPDATED, "Actualizado"),
            (MAINTENANCE, "Mantenimiento"),
            (DISABLED, "Deshabilitado"),
        ]

class EventTypes:
        CREATED = "creado"
        PICKED_UP = "recogido"
        RETURNED = "devuelto"
        PAID = "pagado"
        CANCELLED = "cancelado"

        CHOICES = [
            (CREATED, "Creado"),
            (PICKED_UP, "recogido"),
            (RETURNED, "devuelto"),
            (PAID, "pagado"),
            (CANCELLED, "cancelado"),
        ]
class SourceTypes1:
        SYSTEM = "sistema"
        MOBILE = "móvil"

        CHOICES = [
            (SYSTEM, "sistema"),
            (MOBILE, "móvil"),
        ]
class SourceTypes2:
        WEB = "web"
        MOBILE = "móvil"
        SYSTEM = "sistema"

        CHOICES = [
            (WEB, "web"),
            (MOBILE, "móvil"),
            (SYSTEM, "sistema"),
        ]
    

class FleetLogsSerializer(serializers.Serializer):
    _id = serializers.CharField()  # ObjectId (string) de fleet_logs
    vehicle_id = serializers.IntegerField()
    note = serializers.CharField(max_length=120)
    action = serializers.ChoiceField(
            choices=ActionTypes.CHOICES,
            default=ActionTypes.CREATED
        )
    source = serializers.ChoiceField(
                choices=SourceTypes1.CHOICES,
                default=SourceTypes1.SYSTEM
            )
    created_at = serializers.DateTimeField(required=True)  # No se envía desde el cliente; el backend asigna la fecha actual al crear


class RentalEventsSerializer(serializers.Serializer):
    _id = serializers.CharField()  # ObjectId (string) de rental_events
    rental_id = serializers.IntegerField()        # ID de Vehiculo (Postgres)
    event_type = serializers.ChoiceField(
            choices=EventTypes.CHOICES,
            default=EventTypes.CREATED
        )
    source = serializers.ChoiceField(
                choices=SourceTypes2.CHOICES,
                default=SourceTypes2.SYSTEM
            )
    note = serializers.CharField(max_length=120)
    created_at = serializers.DateTimeField(required=True)  # No se envía desde el cliente; el backend asigna la fecha actual al crear
