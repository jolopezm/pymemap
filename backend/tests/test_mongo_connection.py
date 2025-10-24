import os
import certifi
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")


def test_mongo_connection():
    if not MONGO_URI:
        print("\nERROR: No se encontró la variable MONGO_URI en el archivo .env")
        return {'success': False, 'client': None}
    else:
        try:
            print("Intentando conectar...")
            client = MongoClient(
                MONGO_URI,
                tls=True,
                tlsCAFile=certifi.where(),
                serverSelectionTimeoutMS=10000
        )
            client.admin.command('ping')
            print("\n>>> ¡ÉXITO! La conexión con MongoDB se ha establecido correctamente.")
            return {'success': True, 'client': client}
        except Exception as e:
            print("\n>>> FALLO: No se pudo conectar a MongoDB.")
            print(f"   Tipo de Error: {type(e).__name__}")
            print(f"   Detalles: {e}")
            return {'success': False, 'client': None}
            
test_mongo_connection()