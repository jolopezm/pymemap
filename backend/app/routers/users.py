from fastapi import APIRouter, HTTPException, Depends, status
from bson import ObjectId

from ..db import db
from ..models import User, UserResponse, UserUpdate
from ..auth import get_current_user, get_password_hash, TokenData

router = APIRouter()

@router.get("/", response_model=list[UserResponse])
async def get_users(current_user: TokenData = Depends(get_current_user)):
    """Obtiene todos los usuarios - Ruta protegida que requiere autenticación"""
    users = []
    cursor = db.users.find({}, {"password": 0}) 
    async for document in cursor:
        users.append(UserResponse(**document))
    return users

@router.post("/", response_model=UserResponse)
async def create_user(user: User):
    """Crea un nuevo usuario con contraseña hasheada"""
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Correo electrónico ya registrado"
        )
        
    user_dict = user.dict()
    user_dict["password"] = get_password_hash(user.password)
    
    await db.users.insert_one(user_dict)
    created_user = await db.users.find_one({"email": user.email})
    return UserResponse(**created_user)

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: TokenData = Depends(get_current_user)):
    """Obtener información del usuario actual"""
    user = await db.users.find_one({"email": current_user.email}, {"password": 0})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    return UserResponse(**user)

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, current_user: TokenData = Depends(get_current_user)):
    """Obtiene un usuario por su ID - Ruta protegida"""
    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=400, 
            detail="Formato de ID de usuario inválido"
        )
    user = await db.users.find_one({"_id": ObjectId(user_id)}, {"password": 0})
    if user:
        return UserResponse(**user)
    raise HTTPException(status_code=404, detail="Usuario no encontrado")

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(user_id: str, user: UserUpdate, current_user: TokenData = Depends(get_current_user)):
    """Actualiza un usuario por su ID - Ruta protegida (sin password)"""
    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=400, 
            detail="Formato de ID de usuario inválido"
        )
    
    user_dict = {k: v for k, v in user.dict(exclude_unset=True).items() if v is not None}
    if not user_dict:
        raise HTTPException(status_code=400, detail="No hay datos para actualizar")

    result = await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": user_dict})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    updated_user = await db.users.find_one({"_id": ObjectId(user_id)}, {"password": 0})
    return UserResponse(**updated_user)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: str, current_user: TokenData = Depends(get_current_user)):
    """Elimina un usuario por su ID - Ruta protegida"""
    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=400, 
            detail="Formato de ID de usuario inválido"
        )
    result = await db.users.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
