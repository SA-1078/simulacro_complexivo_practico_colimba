"""
================================================================================
CONTROLADORES NOSQL (MONGODB) - EVENTOS OPERATIVOS (/api/rental_events/)
================================================================================
Gestiona las operaciones CRUD sobre la colección 'rental_events' en MongoDB,
validando que rental_id exista en la tabla relacional Rentals de PostgreSQL.
"""

from datetime import datetime, timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from bson import ObjectId
from bson.errors import InvalidId

from .mongo import db
from .mongo_serializers import RentalEventsSerializer
from .models import Rentals

# Colección exacta en MongoDB
col = db["rental_events"]


def fix_id(doc):
    """
    Convierte el '_id' de MongoDB a 'id' tipo string para la respuesta JSON.
    """
    if not doc:
        return doc
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc


def oid_or_none(id_str: str):
    """
    Convierte a ObjectId o retorna None si el string es inválido.
    """
    try:
        return ObjectId(id_str)
    except InvalidId:
        return None


# ============================================================================
# ENDPOINT: Listar y Crear Eventos Operativos (GET / POST)
# ============================================================================
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def rental_events_list_create(request):
    # OPERACIÓN GET: Listar eventos con filtros opcionales
    if request.method == "GET":
        q = {}
        for k, v in request.query_params.items():
            if k == "rental_id":
                try:
                    q[k] = int(v)
                except ValueError:
                    pass
            elif k in ["event_type", "source"]:
                q[k] = v.upper()

        docs = [fix_id(d) for d in col.find(q).sort("created_at", -1)]
        return Response(docs)

    # OPERACIÓN POST: Crear evento validando existencia de alquiler en PostgreSQL
    serializer = RentalEventsSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    data = serializer.validated_data
    rental_id = data["rental_id"]

    # Validación de integridad relacional
    if not Rentals.objects.filter(id=rental_id).exists():
        return Response(
            {"rental_id": f"El alquiler con ID {rental_id} no existe en PostgreSQL."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Asignar fecha actual en UTC si no fue enviada
    if "created_at" not in data or data["created_at"] is None:
        data["created_at"] = datetime.now(timezone.utc)

    res = col.insert_one(data)
    doc = col.find_one({"_id": res.inserted_id})
    return Response(fix_id(doc), status=status.HTTP_201_CREATED)


# ============================================================================
# ENDPOINT: Detalle, Modificar y Eliminar Evento (GET / PUT / PATCH / DELETE)
# ============================================================================
@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def rental_events_detail(request, id: str):
    _id = oid_or_none(id)
    if _id is None:
        return Response({"detail": "ID de evento inválido."}, status=status.HTTP_400_BAD_REQUEST)

    # OPERACIÓN GET: Detalle
    if request.method == "GET":
        doc = col.find_one({"_id": _id})
        if not doc:
            return Response({"detail": "Evento no encontrado."}, status=status.HTTP_404_NOT_FOUND)
        return Response(fix_id(doc))

    # OPERACIÓN PUT / PATCH: Modificar
    if request.method in ["PUT", "PATCH"]:
        serializer = RentalEventsSerializer(data=request.data, partial=(request.method == "PATCH"))
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        if "rental_id" in data:
            if not Rentals.objects.filter(id=data["rental_id"]).exists():
                return Response(
                    {"rental_id": f"El alquiler con ID {data['rental_id']} no existe en PostgreSQL."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        col.update_one({"_id": _id}, {"$set": data})
        doc = col.find_one({"_id": _id})
        if not doc:
            return Response({"detail": "Evento no encontrado."}, status=status.HTTP_404_NOT_FOUND)
        return Response(fix_id(doc))

    # OPERACIÓN DELETE: Eliminar
    res = col.delete_one({"_id": _id})
    if res.deleted_count == 0:
        return Response({"detail": "Evento no encontrado."}, status=status.HTTP_404_NOT_FOUND)
    return Response(status=status.HTTP_204_NO_CONTENT)