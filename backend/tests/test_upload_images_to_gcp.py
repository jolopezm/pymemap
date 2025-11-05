import os
import sys
from pathlib import Path
from types import SimpleNamespace
from io import BytesIO
from dotenv import load_dotenv

env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
if credentials_path and not credentials_path.startswith("/"):
    credentials_path = str(Path(__file__).parent.parent / credentials_path.replace("backend/", ""))
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = credentials_path

sys.path.insert(0, str(Path(__file__).parent.parent))
from app.services.upload_images_to_gcp import upload_profile_picture

def test_upload():
    """
    Test de integración que sube chayanne.jpeg a Google Cloud Storage
    y verifica que retorna una URL pública válida.
    
    Requisitos:
    - Variable de entorno GOOGLE_APPLICATION_CREDENTIALS configurada
    - Bucket 'pymap_profile_pics' debe existir en GCP
    - Credenciales con permisos de escritura en el bucket
    """
    
    test_image_path = Path(__file__).parent / "chayanne.jpeg"
    
    if not test_image_path.exists():
        raise FileNotFoundError(f"No se encontró la imagen de prueba en: {test_image_path}")
    
    with open(test_image_path, "rb") as f:
        image_bytes = f.read()
    
    fake_file = SimpleNamespace(
        filename="chayanne.jpeg",
        file=BytesIO(image_bytes),
        content_type="image/png"
    )
    
    print(f"\n🚀 Subiendo imagen de prueba: {test_image_path.name}")
    print(f"📦 Tamaño: {len(image_bytes)} bytes")
    
    try:
        url = upload_profile_picture(fake_file, bucket_name="pymap_profile_pics")
        
        assert url is not None, "La URL retornada no debe ser None"
        assert url.startswith("https://"), f"La URL debe comenzar con https://, se obtuvo: {url}"
        assert "pymap_profile_pics" in url, f"La URL debe contener el nombre del bucket, se obtuvo: {url}"
        assert "chayanne.jpeg" in url, f"La URL debe contener el nombre del archivo, se obtuvo: {url}"
        
        print(f"✅ Imagen subida exitosamente!")
        print(f"🔗 URL pública: {url}")
        print(f"\n💡 Puedes abrir esta URL en tu navegador para verificar que la imagen se subió correctamente.")
        
        return url
        
    except Exception as e:
        print(f"❌ Error al subir la imagen: {e}")
        print(f"\n🔍 Verifica que:")
        print(f"   1. GOOGLE_APPLICATION_CREDENTIALS esté configurada")
        print(f"   2. El bucket 'pymap_profile_pics' exista en GCP")
        print(f"   3. Las credenciales tengan permisos de escritura")
        raise


if __name__ == "__main__":
    print("=" * 60)
    print("TEST DE SUBIDA DE IMÁGENES A GOOGLE CLOUD STORAGE")
    print("=" * 60)
    
    if not os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
        print("⚠️  ADVERTENCIA: GOOGLE_APPLICATION_CREDENTIALS no está configurada")
        print("   Configúrala con: export GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json")
        print()
    
    try:
        url = test_upload()
        print("\n" + "=" * 60)
        print("✅ TEST EXITOSO")
        print("=" * 60)
    except Exception as e:
        print("\n" + "=" * 60)
        print("❌ TEST FALLIDO")
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        print("=" * 60)
        sys.exit(1)
