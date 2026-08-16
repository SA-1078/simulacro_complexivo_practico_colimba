"""
================================================================================
RUTAS DE LA APLICACIÓN GESTION (/api/...)
================================================================================
Define las rutas de:
- Endpoints relacionales PostgreSQL (VehiclesViewSet y RentalsViewSet)
- Endpoints NoSQL MongoDB (fleet_logs y rental_events)
"""

from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import VehiclesViewSet, RentalsViewSet
from .fleet_logs_views import fleet_logs_list_create, fleet_logs_detail
from .rental_events_views import rental_events_list_create, rental_events_detail

# Router de DRF para endpoints relacionales
router = DefaultRouter()
router.register(r"vehicles", VehiclesViewSet, basename="vehicles")
router.register(r"vehiculos", VehiclesViewSet, basename="vehiculos")  # Alias en español
router.register(r"rentals", RentalsViewSet, basename="rentals")

# Rutas basadas en funciones para MongoDB
urlpatterns = [
    # Colección NoSQL 'fleet_logs'
    path("fleet_logs/", fleet_logs_list_create, name="fleet_logs_list_create"),
    path("fleet_logs/<str:id>/", fleet_logs_detail, name="fleet_logs_detail"),
    path("fleet-logs/", fleet_logs_list_create, name="fleet_logs_hyphen_list_create"),
    path("fleet-logs/<str:id>/", fleet_logs_detail, name="fleet_logs_hyphen_detail"),

    # Colección NoSQL 'rental_events'
    path("rental_events/", rental_events_list_create, name="rental_events_list_create"),
    path("rental_events/<str:id>/", rental_events_detail, name="rental_events_detail"),
    path("rental-events/", rental_events_list_create, name="rental_events_hyphen_list_create"),
    path("rental-events/<str:id>/", rental_events_detail, name="rental_events_hyphen_detail"),
]

# Anexar las rutas generadas por el router de DRF (/api/vehicles/, /api/vehiculos/, /api/rentals/)
urlpatterns += router.urls