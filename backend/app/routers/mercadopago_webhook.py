from fastapi import APIRouter, Request
import logging

router = APIRouter()

# Configurar logging
logger = logging.getLogger(__name__)

@router.post("/webhook")
async def mercadopago_webhook(request: Request):
    """
    Webhook para recibir notificaciones de MercadoPago
    cuando se completa un pago
    """
    try:
        # Obtener el body del request
        body = await request.json()
        
        # Imprimir toda la información del webhook
        print("\n" + "="*80)
        print("🔔 WEBHOOK DE MERCADOPAGO RECIBIDO")
        print("="*80)
        print(f"📦 Body completo:")
        import json
        print(json.dumps(body, indent=2))
        print("="*80 + "\n")
        
        # MercadoPago envía diferentes tipos de notificaciones
        notification_type = body.get("type")
        
        if notification_type == "payment":
            payment_id = body.get("data", {}).get("id")
            print(f"💳 Pago recibido - Payment ID: {payment_id}")
            
            # Aquí podrías:
            # 1. Obtener más detalles del pago usando el SDK
            # 2. Actualizar el estado de la reserva en la base de datos
            # 3. Enviar notificación al usuario
            
        elif notification_type == "merchant_order":
            order_id = body.get("data", {}).get("id")
            print(f"📋 Orden recibida - Order ID: {order_id}")
        
        # MercadoPago espera un 200 OK para confirmar que recibiste la notificación
        return {"status": "ok", "message": "Webhook received"}
        
    except Exception as e:
        print(f"❌ Error procesando webhook: {str(e)}")
        logger.error(f"Error en webhook de MercadoPago: {str(e)}")
        return {"status": "error", "message": str(e)}

@router.get("/webhook")
async def mercadopago_webhook_get():
    """
    Endpoint GET para verificar que el webhook está funcionando
    """
    return {"status": "ok", "message": "Webhook endpoint is active"}
