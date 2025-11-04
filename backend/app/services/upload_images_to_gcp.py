from google.cloud import storage
from google.oauth2 import service_account
import uuid
import os
import json
import base64

def upload_profile_picture(file, bucket_name="pymap_profile_pics"):
    """Sube una imagen a Google Cloud Storage y devuelve su URL pública."""
    
    # Intenta cargar credenciales desde variable de entorno (Railway)
    credentials_json = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    
    if credentials_json:
        # En producción: usa JSON desde variable de entorno
        credentials_dict = json.loads(credentials_json)
        credentials = service_account.Credentials.from_service_account_info(credentials_dict)
        storage_client = storage.Client(credentials=credentials, project=credentials_dict['project_id'])
    else:
        # En desarrollo: intenta cargar desde archivo base64
        b64_file_path = os.path.join(os.path.dirname(__file__), "..", "..", "gcp-credentials.b64")
        
        if os.path.exists(b64_file_path):
            with open(b64_file_path, 'r') as f:
                b64_content = f.read().strip()
                credentials_json_decoded = base64.b64decode(b64_content).decode('utf-8')
                credentials_dict = json.loads(credentials_json_decoded)
                credentials = service_account.Credentials.from_service_account_info(credentials_dict)
                storage_client = storage.Client(credentials=credentials, project=credentials_dict['project_id'])
        else:
            # Fallback: usa GOOGLE_APPLICATION_CREDENTIALS del sistema
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
