import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db import db
from app.models.users import User
from app.auth import get_password_hash

async def create_test_users():
    users_data = [
        {
            "rut": "12.345.678-9",
            "name": "Maria",
            "email": "maria@gmail.com",
            "password": "password123",
            "birthdate": "01/01/2000",
            "isAuthenticated": True,
            "balance": 100.0,
            "phone": "+56912345678"
        },
        {
            "rut": "13.456.789-0",
            "name": "Juan",
            "email": "juan@gmail.com",
            "password": "password123",
            "birthdate": "02/02/2000",
            "isAuthenticated": True,
            "balance": 200.0,
            "phone": "+56912345679"
        },
        {
            "rut": "14.567.890-1",
            "name": "Ana",
            "email": "ana@gmail.com",
            "password": "password123",
            "birthdate": "03/03/2000",
            "isAuthenticated": True,
            "balance": 300.0,
            "phone": "+56912345680"
        },
        {
            "rut": "15.678.901-2",
            "name": "Pedro",
            "email": "pedro@gmail.com",
            "password": "password123",
            "birthdate": "04/04/2000",
            "isAuthenticated": True,
            "balance": 400.0,
            "phone": "+56912345681"
        },
        {
            "rut": "16.789.012-3",
            "name": "Sofia",
            "email": "sofia@gmail.com",
            "password": "password123",
            "birthdate": "05/05/2000",
            "isAuthenticated": True,
            "balance": 500.0,
            "phone": "+56912345682"
        },
        {
            "rut": "17.890.123-4",
            "name": "Carlos",
            "email": "carlos@gmail.com",
            "password": "password123",
            "birthdate": "06/06/2000",
            "isAuthenticated": True,
            "balance": 600.0,
            "phone": "+56912345683"
        },
        {
            "rut": "18.901.234-5",
            "name": "Laura",
            "email": "laura@gmail.com",
            "password": "password123",
            "birthdate": "07/07/2000",
            "isAuthenticated": True,
            "balance": 700.0,
            "phone": "+56912345684"
        },
        {
            "rut": "19.012.345-6",
            "name": "Diego",
            "email": "diego@gmail.com",
            "password": "password123",
            "birthdate": "08/08/2000",
            "isAuthenticated": True,
            "balance": 800.0,
            "phone": "+56912345685"
        },
        {
            "rut": "20.123.456-7",
            "name": "Camila",
            "email": "camila@gmail.com",
            "password": "password123",
            "birthdate": "09/09/2000",
            "isAuthenticated": True,
            "balance": 900.0,
            "phone": "+56912345686"
        },
        {
            "rut": "21.234.567-8",
            "name": "Andres",
            "email": "andres@gmail.com",
            "password": "password123",
            "birthdate": "10/10/2000",
            "isAuthenticated": True,
            "balance": 1000.0,
            "phone": "+56912345687"
        },
        {
            "rut": "22.345.678-9",
            "name": "Valentina",
            "email": "valentina@gmail.com",
            "password": "password123",
            "birthdate": "11/11/2000",
            "isAuthenticated": True,
            "balance": 1100.0,
            "phone": "+56912345688"
        },
        {
            "rut": "23.456.789-0",
            "name": "Felipe",
            "email": "felipe@gmail.com",
            "password": "password123",
            "birthdate": "12/12/2000",
            "isAuthenticated": True,
            "balance": 1200.0,
            "phone": "+56912345689"
        },
        {
            "rut": "24.567.890-1",
            "name": "Isabella",
            "email": "isabella@gmail.com",
            "password": "password123",
            "birthdate": "13/01/2001",
            "isAuthenticated": True,
            "balance": 1300.0,
            "phone": "+56912345690"
        },
        {
            "rut": "25.678.901-2",
            "name": "Sebastian",
            "email": "sebastian@gmail.com",
            "password": "password123",
            "birthdate": "14/02/2001",
            "isAuthenticated": True,
            "balance": 1400.0,
            "phone": "+56912345691"
        },
        {
            "rut": "26.789.012-3",
            "name": "Martina",
            "email": "martina@gmail.com",
            "password": "password123",
            "birthdate": "15/03/2001",
            "isAuthenticated": True,
            "balance": 1500.0,
            "phone": "+56912345692"
        }
    ]

    for user_data in users_data:
        # Hash the password
        user_data["password"] = get_password_hash(user_data["password"])
        
        # Create User instance to validate
        user = User(**user_data)
        
        # Insert into DB
        await db.users.insert_one(user.dict())
        print(f"Usuario {user.name} creado exitosamente.")

if __name__ == "__main__":
    asyncio.run(create_test_users())