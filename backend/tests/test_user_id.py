import os
import sys
from pathlib import Path
from bson import ObjectId

# Agregar el directorio backend al path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from dotenv import load_dotenv

# Cargar variables de entorno
env_path = backend_path / ".env"
load_dotenv(dotenv_path=env_path, override=True)

from app.db import db

async def test_user_id_validation():
    """
    Test para validar que los IDs de usuario en la base de datos sean válidos
    """
    print("\n" + "=" * 60)
    print("TEST DE VALIDACIÓN DE IDs DE USUARIO")
    print("=" * 60)
    
    try:
        # 1. Obtener todos los usuarios
        print("\n📋 Obteniendo usuarios de la base de datos...")
        users = []
        cursor = db.users.find({}, {"_id": 1, "email": 1, "name": 1})
        async for user in cursor:
            users.append(user)
        
        print(f"✅ Se encontraron {len(users)} usuarios")
        
        if not users:
            print("⚠️  No hay usuarios en la base de datos")
            return
        
        # 2. Validar cada ID
        print("\n🔍 Validando IDs de usuarios:\n")
        valid_ids = []
        invalid_ids = []
        
        for user in users:
            user_id = user.get('_id')
            email = user.get('email', 'N/A')
            name = user.get('name', 'N/A')
            
            # Convertir ObjectId a string
            user_id_str = str(user_id)
            
            # Validar longitud
            if len(user_id_str) != 24:
                print(f"❌ ID inválido (longitud {len(user_id_str)}): {user_id_str}")
                print(f"   Usuario: {name} ({email})")
                invalid_ids.append(user_id_str)
                continue
            
            # Validar que sea un ObjectId válido
            if not ObjectId.is_valid(user_id_str):
                print(f"❌ ID inválido (formato): {user_id_str}")
                print(f"   Usuario: {name} ({email})")
                invalid_ids.append(user_id_str)
                continue
            
            # ID válido
            print(f"✅ ID válido: {user_id_str}")
            print(f"   Usuario: {name} ({email})")
            valid_ids.append({
                'id': user_id_str,
                'email': email,
                'name': name
            })
        
        # 3. Resumen
        print("\n" + "=" * 60)
        print("📊 RESUMEN DE VALIDACIÓN")
        print("=" * 60)
        print(f"✅ IDs válidos: {len(valid_ids)}")
        print(f"❌ IDs inválidos: {len(invalid_ids)}")
        
        # 4. Mostrar un ID válido para usar en tests
        if valid_ids:
            print("\n💡 Puedes usar este ID para tus tests:")
            print(f"   ID: {valid_ids[0]['id']}")
            print(f"   Usuario: {valid_ids[0]['name']} ({valid_ids[0]['email']})")
            
            # Guardar el ID en un archivo para usarlo en otros tests
            test_id_file = Path(__file__).parent / "test_user_id.txt"
            with open(test_id_file, 'w') as f:
                f.write(valid_ids[0]['id'])
            print(f"\n📝 ID guardado en: {test_id_file}")
        
        return len(invalid_ids) == 0
        
    except Exception as e:
        print(f"\n❌ Error durante la validación: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_specific_user_id(user_id: str):
    """
    Test para validar un ID de usuario específico
    """
    print("\n" + "=" * 60)
    print(f"TEST DE ID ESPECÍFICO: {user_id}")
    print("=" * 60)
    
    # Limpiar el ID
    user_id = user_id.strip()
    
    print(f"\n🔍 ID proporcionado: '{user_id}'")
    print(f"📏 Longitud: {len(user_id)}")
    print(f"🔤 Tipo: {type(user_id)}")
    
    # Validar longitud
    if len(user_id) != 24:
        print(f"❌ ERROR: El ID debe tener 24 caracteres, tiene {len(user_id)}")
        return False
    
    # Validar formato
    if not ObjectId.is_valid(user_id):
        print(f"❌ ERROR: El ID no es un ObjectId válido")
        return False
    
    print(f"✅ El ID tiene formato válido")
    
    # Buscar el usuario en la base de datos
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        
        if user:
            print(f"✅ Usuario encontrado en la base de datos")
            print(f"   Nombre: {user.get('name', 'N/A')}")
            print(f"   Email: {user.get('email', 'N/A')}")
            return True
        else:
            print(f"❌ ERROR: No se encontró ningún usuario con este ID")
            return False
            
    except Exception as e:
        print(f"❌ ERROR al buscar usuario: {e}")
        return False


if __name__ == "__main__":
    import asyncio
    
    # Si se pasa un ID como argumento, validar ese ID específico
    if len(sys.argv) > 1:
        user_id = sys.argv[1]
        result = asyncio.run(test_specific_user_id(user_id))
    else:
        # Si no, validar todos los usuarios
        result = asyncio.run(test_user_id_validation())
    
    if result:
        print("\n" + "=" * 60)
        print("✅ VALIDACIÓN EXITOSA")
        print("=" * 60)
        sys.exit(0)
    else:
        print("\n" + "=" * 60)
        print("❌ VALIDACIÓN FALLIDA")
        print("=" * 60)
        sys.exit(1)