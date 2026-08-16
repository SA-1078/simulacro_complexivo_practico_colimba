"""
================================================================================
CONEXIÓN A BASE DE DATOS NOSQL (MONGODB) VIA PYMONGO
================================================================================
"""

from django.conf import settings
from pymongo import MongoClient

# Instancia del cliente PyMongo
_client = MongoClient(settings.MONGO_URI)

# Instancia de la base de datos NoSQL
db = _client[settings.MONGO_DB]