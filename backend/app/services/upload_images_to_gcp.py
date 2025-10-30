from google.cloud import storage
import uuid

def upload_profile_picture(file, bucket_name="pymap_profile_pics"):
    """Sube una imagen a Google Cloud Storage y devuelve su URL pública."""
    
    # Inicializa el cliente
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
