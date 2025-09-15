import os
import resend
from dotenv import load_dotenv
import random
import string
from datetime import datetime, timedelta
from ..db import db

load_dotenv()
resend.api_key = os.environ["RESEND_API_KEY"]

def generate_auth_code():
    """Genera un código de autenticación alfanumérico de 6 caracteres"""
    characters = string.ascii_letters + string.digits
    auth_code = ''.join(random.choice(characters) for _ in range(6))
    return auth_code

def save_code_to_db(email: str, code: str):
    """Guarda el código de autenticación en la base de datos (simulado)"""
    auth_code_entry = {
        "email": email,
        "auth_code": code,
        "expires_at": datetime.utcnow() + timedelta(minutes=1)
    }

    db.auth_codes.insert_one(auth_code_entry)
    db.auth_codes.create_index("expires_at", expireAfterSeconds=0)
    print(f"Guardando en DB: {auth_code_entry}")
    return True

def send_auth_code_via_email(email: str, code: str):
    """Envía el código de autenticación al email proporcionado (simulado)"""
   
    params: resend.Emails.SendParams = {
        "from": "onboarding@resend.dev",
        "to": [email],
        "subject": "Codigo de Autenticación",
        "html": f"<p>Su código de autenticación es: <strong>{code}</strong></p>",
    }

    save_code_to_db(email, code)
    email = resend.Emails.send(params)
    
    print(f"Enviando código {code} al email {email}")
    return True