from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.requests import Request
import traceback
from .routers import gmaps, users, auth, business

app = FastAPI(
    title="Pymap API",
    description="Esta es una API de ejemplo con rutas modulares de la aplicacion Pymap.",
    version="beta",
)

# Configuración de CORS
# En un entorno de producción, deberías restringir los orígenes permitidos.
# origins = ["
#     "http://localhost:3000",
#     "https://tu-dominio-de-frontend.com",
# ]
origins = ["http://localhost:8081"]

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
