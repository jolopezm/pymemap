from fastapi import APIRouter, HTTPException, Form, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta

from ..db import db
from ..models import UserLogin
from ..auth import (
    create_access_token,
    verify_password,
    Token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from app.services.auth_code import send_auth_code_via_email

router = APIRouter()

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Autenticates the user and returns an access token"""
    user = await db.users.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["password"]):
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
    
    return Token(access_token=access_token, token_type="bear    er")

@router.post("/send-auth-code")
async def send_auth_code(email: str = Form(...)):
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No existe un usuario con este correo"
        )

    response = send_auth_code_via_email(email)
    return {"message": "Código de autenticación enviado con éxito", "code": response['code']}

@router.post("/verify-auth-code")
async def verify_auth_code(email: str = Form(...), code: str = Form(...)):
    """Verifica el código de autenticación proporcionado"""
    auth_code_entry = await db.auth_codes.find_one({"email": email, "auth_code": code})
    if not auth_code_entry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Código de autenticación inválido o expirado"
        )
    
    await db.auth_codes.delete_one({"_id": auth_code_entry["_id"]})
    await db.users.update_one({"email": email}, {"$set": {"isAuthenticated": True}})
    return {"message": "Código de autenticación verificado con éxito"}
