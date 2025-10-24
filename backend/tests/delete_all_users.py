from unittest import result
from test_mongo_connection import test_mongo_connection

response = test_mongo_connection()
success = response['success']
client = response['client']

if success == False:
    pass
else:
    try:
        print("Intentando eliminar...")
        
        db = client.get_default_database()
        users_collection = db['users']
        count = 0
        for user in users_collection.find({}):
            if user['name'] == "admin":
                continue
            else:
                print(f"Eliminando usuario: {user['name']}")
                result = users_collection.delete_one({"_id": user['_id']})
                count += 1
        client.admin.command('ping')
        print(f"\n>>> ¡ÉXITO! Se eliminaron a {count} usuarios.")
    except Exception as e:
        print("\n>>> FALLO: No se pudo eliminar a los usuarios.")
        print(f"   Tipo de Error: {type(e).__name__}")
        print(f"   Detalles: {e}")