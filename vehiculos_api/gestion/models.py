from django.db import models

class Vehicles(models.Model):
    plate = models.CharField(max_length=10, unique=True) # en español: placa
    brand = models.CharField(max_length=40) # en español: marca
    daily_rate = models.DecimalField(max_digits=10, decimal_places=2) # en español: tarifa_diaria
    is_available = models.BooleanField(default=True) # en español: disponible

    def __str__(self):
        return self.plate

class Rentals(models.Model):
    vehicle = models.ForeignKey(Vehicles, on_delete=models.PROTECT, related_name="rentals")
    customer_name = models.CharField(max_length=120)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.customer_name} - {self.vehicle.plate}"



"""

Tabla vehicles (vehículos):
id BIGSERIAL PRIMARY KEY
plate VARCHAR(10) NOT NULL UNIQUE
brand VARCHAR(40) NOT NULL
daily_rate NUMERIC(10,2) NOT NULL
is_available BOOLEAN NOT NULL DEFAULT TRUE


Tabla rentals (alquileres):

id BIGSERIAL PRIMARY KEY
vehicle_id BIGINT NOT NULL REFERENCES vehicles(id)
customer_name VARCHAR(120) NOT NULL
total NUMERIC(10,2) NOT NULL
status VARCHAR(20) NOT NULL (RESERVED, ACTIVE, CLOSED, CANCELLED)
created_at TIMESTAMP NOT NULL DEFAULT NOW()


"""
