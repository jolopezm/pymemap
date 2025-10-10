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
    characters = string.ascii_letters + string.digits
    code = ''.join(random.choice(characters) for _ in range(6))
    return code

def save_code_to_db(email: str, code: str):
    auth_code_entry = {
        "email": email,
        "code": code,
        "expires_at": datetime.utcnow() + timedelta(minutes=10)
    }

    db.auth_codes.insert_one(auth_code_entry)
    db.auth_codes.create_index("expires_at", expireAfterSeconds=0)

def send_auth_code_via_email(email: str):
    code = generate_auth_code()
    params: resend.Emails.SendParams = {
        "from": "onboarding@resend.dev",
        "to": [email],
        "subject": "Codigo de Autenticación",
        "html": f"<p>Que fue cara de verga, Su código de autenticación es: <strong>{code}</strong></p>",
    }
    
    try:
        save_code_to_db(email, code)    
        email_response = resend.Emails.send(params)
        return {'response': email_response, 'code': code}
    except resend.exceptions.ResendError as e:
        return {"mensaje": f"Error al enviar email: {e}", "code": code}