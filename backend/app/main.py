from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.requests import Request
import traceback
import os
import re
from dotenv import load_dotenv
from .routers import gmaps, users, auth, business, notifications, chat

# Cargar variables de entorno
load_dotenv()

app = FastAPI(
    title="PymeMap API",
    description="API REST para la plataforma PymeMap - Conectando usuarios con PYMEs locales.",
    version="1.0.0",
)

# Configuración de CORS basada en variables de entorno
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "")

# Configurar orígenes permitidos
if ENVIRONMENT == "development":
    # En desarrollo permitir todos los orígenes
    origins = ["*"]
    allow_origin_regex = None
else:
    # En producción usar los orígenes especificados
    if ALLOWED_ORIGINS:
        # Dividir por comas y limpiar espacios
        origins = [origin.strip() for origin in ALLOWED_ORIGINS.split(",")]
    else:
        # Si no hay orígenes configurados, usar regex por defecto
        origins = []
    
    # Regex para permitir localhost, Railway, y dominios personalizados
    allow_origin_regex = r'^https?://(localhost|127\.0\.0\.1)(:\d+)?$|^https?://[\w-]+\.up\.railway\.app$|^https?://([\w-]+\.)*pymap\.cl$'

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=allow_origin_regex if ENVIRONMENT == "production" else None,
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

# Incluir routers
app.include_router(auth.router, tags=["Authentication"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(business.router, prefix="/business", tags=["Business"])
app.include_router(gmaps.router, tags=["Gmaps"])
app.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])


@app.get("/")
def read_root():
    return {"message": "Bienvenido a la API"}


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print("ERROR EN FASTAPI:", traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"}
    )

