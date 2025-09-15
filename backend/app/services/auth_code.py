import os
import resend
from dotenv import load_dotenv
import random
import string

load_dotenv()
resend.api_key = os.environ["RESEND_API_KEY"]

def generate_auth_code():
    """Genera un código de autenticación alfanumérico de 6 caracteres"""
    characters = string.ascii_letters + string.digits
    auth_code = ''.join(random.choice(characters) for _ in range(6))
    return auth_code

def send_auth_code_via_email(email: str, code: str):
    """Envía el código de autenticación al email proporcionado (simulado)"""
   
    params: resend.Emails.SendParams = {
        "from": "onboarding@resend.dev",
        "to": [email],
        "subject": "Codigo de Autenticación",
        "html": f"<p>Su código de autenticación es: <strong>{code}</strong></p>",
    }

    email = resend.Emails.send(params)
    
    print(f"Enviando código {code} al email {email}")
    return True