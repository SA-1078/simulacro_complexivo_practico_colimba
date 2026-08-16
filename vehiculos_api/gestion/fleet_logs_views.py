"""
================================================================================
CONTROLADORES NOSQL (MONGODB) - BITÁCORA DE FLOTA (/api/fleet_logs/)
================================================================================
Gestiona las operaciones CRUD sobre la colección 'fleet_logs' en MongoDB,
validando que vehicle_id exista en la tabla relacional Vehicles de PostgreSQL.
"""

from datetime import datetime, timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from bson import ObjectId
from bson.errors import InvalidId

from .mongo import db
from .mongo_serializers import FleetLogsSerializer
from .models import Vehicles

col = db["fleet_logs"]


def fix_id(doc):
    """
    Convierte el '_id' de MongoDB a 'id' tipo string.
    """
    if not doc:
        return doc
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc


def oid_or_none(id_str: str):
    """
    Convierte a ObjectId o retorna None si no es válido.
    """
    try:
        return ObjectId(id_str)
    except InvalidId:
        return None


# ============================================================================
# ENDPOINT: Listar y Crear Bitácora de Flota (GET / POST)
# ============================================================================
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def fleet_logs_list_create(request):
    # OPERACIÓN GET: Listar con filtros
    if request.method == "GET":
        q = {}
        for k, v in request.query_params.items():
            if k == "vehicle_id":
                try:
                    q[k] = int(v)
                except ValueError:
                    pass
            elif k in ["action", "source"]:
                q[k] = v.upper()

        docs = [fix_id(d) for d in col.find(q).sort("created_at", -1)]
        return Response(docs)

    # OPERACIÓN POST: Crear registro validando existencia de vehículo en PostgreSQL
    serializer = FleetLogsSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    data = serializer.validated_data
    vehicle_id = data["vehicle_id"]

    # Validación de integridad relacional
    if not Vehicles.objects.filter(id=vehicle_id).exists():
        return Response(
            {"vehicle_id": f"El vehículo con ID {vehicle_id} no existe en PostgreSQL."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Asignar fecha actual en UTC si no fue enviada
    if "created_at" not in data or data["created_at"] is None:
        data["created_at"] = datetime.now(timezone.utc)

    res = col.insert_one(data)
    doc = col.find_one({"_id": res.inserted_id})
    return Response(fix_id(doc), status=status.HTTP_201_CREATED)


# ============================================================================
# ENDPOINT: Detalle, Modificar y Eliminar Log (GET / PUT / PATCH / DELETE)
# ============================================================================
@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def fleet_logs_detail(request, id: str):
    _id = oid_or_none(id)
    if _id is None:
        return Response({"detail": "ID de bitácora inválido."}, status=status.HTTP_400_BAD_REQUEST)

    # OPERACIÓN GET: Detalle
    if request.method == "GET":
        doc = col.find_one({"_id": _id})
        if not doc:
            return Response({"detail": "Registro no encontrado."}, status=status.HTTP_404_NOT_FOUND)
        return Response(fix_id(doc))

    # OPERACIÓN PUT / PATCH: Modificar
    if request.method in ["PUT", "PATCH"]:
        serializer = FleetLogsSerializer(data=request.data, partial=(request.method == "PATCH"))
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        if "vehicle_id" in data:
            if not Vehicles.objects.filter(id=data["vehicle_id"]).exists():
                return Response(
                    {"vehicle_id": f"El vehículo con ID {data['vehicle_id']} no existe en PostgreSQL."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        col.update_one({"_id": _id}, {"$set": data})
        doc = col.find_one({"_id": _id})
        if not doc:
            return Response({"detail": "Registro no encontrado."}, status=status.HTTP_404_NOT_FOUND)
        return Response(fix_id(doc))

    # OPERACIÓN DELETE: Eliminar
    res = col.delete_one({"_id": _id})
    if res.deleted_count == 0:
        return Response({"detail": "Registro no encontrado."}, status=status.HTTP_404_NOT_FOUND)
    return Response(status=status.HTTP_204_NO_CONTENT)