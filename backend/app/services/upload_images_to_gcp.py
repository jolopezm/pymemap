from google.cloud import storage
from google.oauth2 import service_account
import uuid
import os
import json
import base64
import binascii

def ensure_gcp_credentials():
    """
    Acepta cualquiera de:
      - GOOGLE_APPLICATION_CREDENTIALS: path absoluto (ya ok)
      - GOOGLE_APPLICATION_CREDENTIALS: contenido JSON (empieza por '{')
      - GOOGLE_APPLICATION_CREDENTIALS: contenido base64 (decodificar)
    Escribe un archivo en /tmp/gcloud_key.json y deja GOOGLE_APPLICATION_CREDENTIALS apuntando a él.
    """
    env_val = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if not env_val:
        return  
    env_val = env_val.strip()
    if os.path.exists(env_val):
        return  
    credentials_dict = None
    # 1) Si ya es JSON
    if env_val.startswith("{"):
        try:
            credentials_dict = json.loads(env_val)
        except json.JSONDecodeError:
            raise
    else:
        # 2) Intenta decodificar como base64
        try:
            # reparar padding si falta
            padding = len(env_val) % 4
            if padding:
                env_val += "=" * (4 - padding)
            decoded = base64.b64decode(env_val).decode("utf-8")
            credentials_dict = json.loads(decoded)
        except (binascii.Error, ValueError, json.JSONDecodeError):
            raise ValueError("GOOGLE_APPLICATION_CREDENTIALS no es un path válido, JSON, ni base64 decodificable.")
    if credentials_dict:
        temp_path = "/tmp/gcloud_key.json"
        print(f"Escribiendo credenciales GCP decodificadas en: {temp_path}")
        with open(temp_path, "w") as f:
            json.dump(credentials_dict, f)
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = temp_path

def _load_credentials_dict():
    """
    Intenta cargar credenciales desde:
     - GOOGLE_APPLICATION_CREDENTIALS_JSON (JSON en la env)
     - GOOGLE_APPLICATION_CREDENTIALS (puede ser: JSON, base64, o ruta a archivo .b64/.json)
     - archivo local backend/gcp-credentials.b64
    Devuelve dict de credenciales o None.
    """
    env_keys = ["GOOGLE_APPLICATION_CREDENTIALS_JSON", "GOOGLE_APPLICATION_CREDENTIALS"]
    for key in env_keys:
        val = os.getenv(key)
        if not val:
            continue
        val = val.strip()
        # 1) Si ya es JSON
        if val.startswith("{"):
            try:
                return json.loads(val)
            except json.JSONDecodeError:
                raise
        # 2) Si es una ruta de archivo existente
        if os.path.exists(val):
            content = open(val, "r").read().strip()
            # intenta parsear como JSON directo
            try:
                return json.loads(content)
            except json.JSONDecodeError:
                # intenta decodificar base64 y luego parsear
                try:
                    decoded = base64.b64decode(content + "===").decode("utf-8")
                    return json.loads(decoded)
                except Exception:
                    raise
        # 3) Intenta decodificar val como base64 directo
        try:
            # reparar padding si falta
            padding = len(val) % 4
            if padding:
                val += "=" * (4 - padding)
            decoded = base64.b64decode(val).decode("utf-8")
            return json.loads(decoded)
        except (binascii.Error, ValueError, json.JSONDecodeError):
            # no es base64 válido o no decodifica a JSON -> continuar con siguientes opciones
            continue

    # 4) archivo local .b64 (ruta relativa al paquete)
    b64_file_path = os.path.join(os.path.dirname(__file__), "..", "..", "gcp-credentials.b64")
    if os.path.exists(b64_file_path):
        content = open(b64_file_path, "r").read().strip()
        try:
            decoded = base64.b64decode(content + "===").decode("utf-8")
            return json.loads(decoded)
        except Exception:
            raise

    return None

def upload_profile_picture(file, bucket_name="pymap_profile_pics"):
    """Sube una imagen a Google Cloud Storage y devuelve su URL pública."""

    credentials_dict = _load_credentials_dict()
    if credentials_dict:
        credentials = service_account.Credentials.from_service_account_info(credentials_dict)
        storage_client = storage.Client(credentials=credentials, project=credentials_dict.get("project_id"))
    else:
        # Fallback: deja que la librería busque ADC (GOOGLE_APPLICATION_CREDENTIALS apunta a .json en disco, o entorno GCP)
        storage_client = storage.Client()
    
    bucket = storage_client.bucket(bucket_name)

    # Crea un nombre único para el archivo
    blob_name = f"profile_pics/{uuid.uuid4()}_{file.filename}"
    blob = bucket.blob(blob_name)

    # Sube el archivo al bucket
    blob.upload_from_file(file.file, content_type=file.content_type)

    # Hazlo público (opcional)
    blob.make_public()

    # Retorna la URL
    return blob.public_url
