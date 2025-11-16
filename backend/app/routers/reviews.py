from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File
from bson import ObjectId

from ..db import db
from app.models.users import User, UserResponse, UserUpdate, ResetPasswordRequest, UpdateBalanceRequest
from app.models.token import TokenData
from ..auth import get_current_user, get_password_hash, verify_password
from ..utils.password_validator import PasswordValidation
from ..services.upload_images_to_gcp import upload_profile_picture as upload_to_gcp
from app.models.utility_classes import Review

router = APIRouter()

@router.post("/", response_model=Review)
async def create_review(review: Review):
    """Crea una nueva reseña para un negocio"""
    review_dict = review.dict()
    result = await db.reviews.insert_one(review_dict)
    created_review = await db.reviews.find_one({"_id": result.inserted_id})
    return Review(**created_review)

@router.get("/business/{business_id}", response_model=list[Review])
async def get_reviews_by_business(business_id: str):
    """Obtiene todas las reseñas para un negocio específico"""
    reviews = []
    cursor = db.reviews.find({"businessId": business_id})
    async for document in cursor:
        reviews.append(Review(**document))
    return reviews