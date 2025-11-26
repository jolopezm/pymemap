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
            
            try:
                # Importar aquí para evitar ciclos
                from ..routers.mercadopago import sdk
                from ..db import db
                from bson import ObjectId
                from datetime import datetime
                
                # Obtener detalles del pago desde MercadoPago
                payment_info = sdk.payment().get(payment_id)
                payment = payment_info.get("response", {})
                
                if payment:
                    status = payment.get("status")
                    external_reference = payment.get("external_reference")
                    transaction_amount = payment.get("transaction_amount")
                    
                    print(f"   Status: {status}")
                    print(f"   Booking ID: {external_reference}")
                    print(f"   Monto: {transaction_amount}")
                    
                    if status == "approved" and external_reference:
                        # Actualizar la reserva en la base de datos
                        try:
                            booking_oid = ObjectId(external_reference)
                            query = {"_id": booking_oid}
                        except:
                            query = {"_id": external_reference}
                            
                        result = await db.bookings.update_one(
                            query,
                            {
                                "$set": {
                                    "payment_status": "paid",
                                    "payment_method": "mercadopago",
                                    "paid_amount": transaction_amount,
                                    "paid_at": datetime.now().isoformat(),
                                    # Opcional: cambiar estado general a 'confirmed' o 'completed' si aplica
                                    # "status": "confirmed" 
                                }
                            }
                        )
                        
                        if result.modified_count > 0:
                            print(f"✅ Reserva {external_reference} actualizada como PAGADA")
                        else:
                            print(f"⚠️ No se encontró la reserva {external_reference} para actualizar")
                            
            except Exception as e:
                print(f"❌ Error procesando pago y actualizando DB: {str(e)}")
                import traceback
                traceback.print_exc()
            
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
