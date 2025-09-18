from fastapi import APIRouter, HTTPException, Form, status, Depends
from datetime import timedelta
import resend

from ..db import db
from ..models.users import UserLogin
from ..models.token import Token
from ..auth import (
    create_access_token,
    verify_password,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from app.services.auth_code import send_auth_code_via_email

router = APIRouter()

@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin):
    user = await db.users.find_one({"email": user_credentials.email})
    if not user or not verify_password(user_credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo electrónico o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"], "name": user["name"]}, 
        expires_delta=access_token_expires
    )
    
    return Token(access_token=access_token, token_type="bearer")

@router.post("/send-auth-code")
async def send_auth_code(request: dict):
    email = request.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email es requerido"
        )
    
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    response = send_auth_code_via_email(email)
    return response

@router.post("/verify-auth-code")
async def verify_auth_code(request: dict):
    email = request.get("email")
    code = request.get("code")
    
    if not email or not code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email y código de autenticación son requeridos"
        )
    
    auth_code_entry = await db.auth_codes.find_one({"email": email, "code": code})
    if not auth_code_entry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Código de autenticación inválido o expirado"
        )
    
    await db.auth_codes.delete_one({"_id": auth_code_entry["_id"]})
    await db.users.update_one({"email": email}, {"$set": {"isAuthenticated": True}})
    return {"message": "Código de autenticación verificado con éxito"}
