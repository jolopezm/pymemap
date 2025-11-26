import mercadopago
from fastapi import APIRouter
from typing import Optional

router = APIRouter()

# Usando credenciales de PRODUCCIÓN
# ADVERTENCIA: Los pagos serán reales
access_token = "APP_USR-3194502263000105-112510-0e31438bbdfd31298e7c66eef4ea679d-3015029964"
sdk = mercadopago.SDK(access_token)

@router.post("/create_preference/{amount}")
def create_preference(amount: float, booking_id: Optional[str] = None):
    # URL del backend en producción (Railway)
    production_url = "https://pymemap-production-306f.up.railway.app"
    
    preference_data = {
        "items": [
            {
                "title": "Pago de Servicio - PymeMap",
                "quantity": 1,
                "unit_price": amount,
                "description": f"Reserva ID: {booking_id}" if booking_id else "Pago de servicio"
            }
        ],
        "notification_url": f"{production_url}/mercadopago/webhook",
        "external_reference": booking_id if booking_id else "",
        "statement_descriptor": "PYMEMAP",
    }
    
    print(f"🔔 Webhook configurado en: {production_url}/mercadopago/webhook")
    print(f"📋 Preference para booking: {booking_id}")
    
    preference = sdk.preference().create(preference_data)
    return preference