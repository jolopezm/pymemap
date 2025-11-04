from google.cloud import storage
import uuid
import os
import json
from google.oauth2 import service_account

def upload_profile_picture(file, bucket_name="pymap_profile_pics"):
    """Sube una imagen a Google Cloud Storage y devuelve su URL pública."""
    
    # Inicializa el cliente
    credentials_json = os.getenv("GOOGLE_APPLICATION_CREDENTIALS_KEY")
    if credentials_json:
        credentials_dict = json.loads(credentials_json)
        credentials = service_account.Credentials.from_service_account_info(credentials_dict)
        storage_client = storage.Client(credentials=credentials, project=credentials_dict['project_id'])
    else:
        storage_client = storage.Client()  # Usa GOOGLE_APPLICATION_CREDENTIALS automáticamente
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
