import os
from pathlib import Path
from dotenv import load_dotenv

# Obtener la ruta al archivo .env (en el directorio backend, un nivel arriba)
env_path = Path(__file__).parent.parent / ".env"

# Cargar las variables del archivo .env con la ruta específica
load_dotenv(dotenv_path=env_path)

# Ahora puedes acceder a ellas
GOOGLE_CREDENTIALS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
BUCKET_NAME = os.getenv("GCP_BUCKET_NAME")

print(f"📁 Buscando .env en: {env_path}")
print(f"✅ .env existe: {env_path.exists()}")
print(f"🔑 Ruta de credenciales: {GOOGLE_CREDENTIALS}")
print(f"🪣 Nombre del bucket: {BUCKET_NAME}")

# Verificar que el archivo de credenciales existe
if GOOGLE_CREDENTIALS:
    creds_exist = Path(GOOGLE_CREDENTIALS).exists()
    print(f"📄 Archivo de credenciales existe: {creds_exist}")
    if creds_exist:
        print(f"✅ Todo configurado correctamente!")
    else:
        print(f"❌ El archivo de credenciales no existe en: {GOOGLE_CREDENTIALS}")
else:
    print(f"❌ GOOGLE_APPLICATION_CREDENTIALS no está configurado en .env")
