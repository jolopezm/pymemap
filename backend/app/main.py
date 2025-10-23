from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.requests import Request
import traceback
import os
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
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:8081").split(",")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# En desarrollo permitir todos los orígenes, en producción solo los especificados
origins = ["*"] if ENVIRONMENT == "production" else ALLOWED_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
