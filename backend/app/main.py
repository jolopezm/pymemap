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
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:8081").split(",")

# Función para validar orígenes permitidos
def is_origin_allowed(origin: str) -> bool:
    """
    Valida si un origen está permitido basado en patrones.
    Permite:
    - Cualquier subdominio de pymap.cl (incluyendo www)
    - localhost en cualquier puerto
    - Dominios específicos en ALLOWED_ORIGINS
    """
    if not origin:
        return False
    
    # En desarrollo, permitir todo
    if ENVIRONMENT == "development":
        return True
    
    # Patrones permitidos
    allowed_patterns = [
        r'^https?://localhost(:\d+)?$',           # localhost con cualquier puerto
        r'^https?://127\.0\.0\.1(:\d+)?$',        # 127.0.0.1 con cualquier puerto
        r'^https?://([\w-]+\.)*pymap\.cl$',       # *.pymap.cl y pymap.cl
    ]
    
    # Verificar contra patrones
    for pattern in allowed_patterns:
        if re.match(pattern, origin):
            return True
    
    # Verificar contra orígenes específicos configurados
    if origin in ALLOWED_ORIGINS:
        return True
    
    return False

# Configurar CORS con validación personalizada
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r'^https?://(localhost|127\.0\.0\.1)(:\d+)?$|^https?://([\w-]+\.)*pymap\.cl$' if ENVIRONMENT == "production" else None,
    allow_origins=["*"] if ENVIRONMENT == "development" else ALLOWED_ORIGINS,
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

