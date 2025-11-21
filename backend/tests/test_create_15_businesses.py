import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db import db
from app.models.sellers import Business
from bson import ObjectId

async def create_test_businesses():
    # Assuming these are the owner_ids of the 15 users created earlier
    # In a real scenario, you might query the users collection to get their IDs
    owner_ids = [
        "69207d808b7b0c730b2008f9",  # Maria
        "69207d828b7b0c730b2008fa",  # Juan
        "69207d838b7b0c730b2008fb",  # Ana
        "69207d838b7b0c730b2008fc",  # Pedro
        "69207d848b7b0c730b2008fd",  # Sofia
        "69207d848b7b0c730b2008fe",  # Carlos
        "69207d848b7b0c730b2008ff",  # Laura
        "69207d858b7b0c730b200900",  # Diego
        "69207d858b7b0c730b200901",  # Camila
        "69207d868b7b0c730b200902",  # Andres
        "69207d868b7b0c730b200903",  # Valentina
        "69207d868b7b0c730b200904",  # Felipe
        "69207d878b7b0c730b200905",  # Isabella
        "69207d878b7b0c730b200906",  # Sebastian
        "69207d888b7b0c730b200907"   # Martina
    ]

    businesses_data = [
        {
            "name": "Técnico de bicicletas",
            "address": "Juan Enrique Concha 254, Ñuñoa, Chile",
            "category": "servicios",
            "description": "Reparo bicicletas a domicilio o en mi taller",
            "owner_id": owner_ids[0],
            "profile_pic": "https://storage.googleapis.com/pymap_businesses_pics/profile_pics/b3ec...",
            "latitude": -33.4577022,
            "longitude": -70.5955576
        },
        {
            "name": "Café Central",
            "address": "Plaza de Armas, Santiago, Chile",
            "category": "comida",
            "description": "Café tradicional con pasteles caseros",
            "owner_id": owner_ids[1],
            "profile_pic": "https://storage.googleapis.com/pymap_businesses_pics/profile_pics/cafe...",
            "latitude": -33.4378,
            "longitude": -70.6503
        },
        {
            "name": "Tienda de Ropa Vintage",
            "address": "Av. Providencia 1234, Providencia, Chile",
            "category": "retail",
            "description": "Ropa vintage y accesorios únicos",
            "owner_id": owner_ids[2],
            "profile_pic": "https://storage.googleapis.com/pymap_businesses_pics/profile_pics/vintage...",
            "latitude": -33.4314,
            "longitude": -70.6092
        },
        {
            "name": "Clínica Dental Familiar",
            "address": "Calle Las Condes 567, Las Condes, Chile",
            "category": "salud",
            "description": "Servicios dentales para toda la familia",
            "owner_id": owner_ids[3],
            "profile_pic": "https://storage.googleapis.com/pymap_businesses_pics/profile_pics/dental...",
            "latitude": -33.4155,
            "longitude": -70.5831
        },
        {
            "name": "Salón de Belleza Glamour",
            "address": "Av. Apoquindo 890, Las Condes, Chile",
            "category": "belleza",
            "description": "Tratamientos de belleza y peluquería",
            "owner_id": owner_ids[4],
            "profile_pic": "https://storage.googleapis.com/pymap_businesses_pics/profile_pics/beauty...",
            "latitude": -33.4134,
            "longitude": -70.5975
        },
        {
            "name": "Academia de Inglés",
            "address": "Calle Huérfanos 456, Santiago Centro, Chile",
            "category": "educacion",
            "description": "Clases de inglés para todos los niveles",
            "owner_id": owner_ids[5],
            "profile_pic": "https://storage.googleapis.com/pymap_businesses_pics/profile_pics/english...",
            "latitude": -33.4417,
            "longitude": -70.6533
        },
        {
            "name": "Servicio de Limpieza a Domicilio",
            "address": "Av. La Florida 2345, La Florida, Chile",
            "category": "hogar",
            "description": "Limpieza profunda de hogares y oficinas",
            "owner_id": owner_ids[6],
            "profile_pic": "https://storage.googleapis.com/pymap_businesses_pics/profile_pics/cleaning...",
            "latitude": -33.5225,
            "longitude": -70.5989
        },
        {
            "name": "Restaurante Italiano",
            "address": "Calle Italia 789, Ñuñoa, Chile",
            "category": "comida",
            "description": "Auténtica comida italiana con ingredientes frescos",
            "owner_id": owner_ids[7],
            "profile_pic": "https://storage.googleapis.com/pymap_businesses_pics/profile_pics/italian...",
            "latitude": -33.4547,
            "longitude": -70.6047
        },
        {
            "name": "Farmacia Express",
            "address": "Av. Vicuña Mackenna 1122, Ñuñoa, Chile",
            "category": "salud",
            "description": "Medicamentos y productos de salud",
            "owner_id": owner_ids[8],
            "profile_pic": "https://storage.googleapis.com/pymap_businesses_pics/profile_pics/pharmacy...",
            "latitude": -33.4569,
            "longitude": -70.6058
        },
        {
            "name": "Peluquería Moderna",
            "address": "Calle Suecia 345, Providencia, Chile",
            "category": "belleza",
            "description": "Cortes de cabello y tratamientos capilares",
            "owner_id": owner_ids[9],
            "profile_pic": "https://storage.googleapis.com/pymap_businesses_pics/profile_pics/hair...",
            "latitude": -33.4289,
            "longitude": -70.6156
        },
        {
            "name": "Tienda de Electrónicos",
            "address": "Av. Libertador Bernardo O'Higgins 678, Santiago Centro, Chile",
            "category": "retail",
            "description": "Electrónicos y gadgets de última generación",
            "owner_id": owner_ids[10],
            "profile_pic": "https://storage.googleapis.com/pymap_businesses_pics/profile_pics/electronics...",
            "latitude": -33.4422,
            "longitude": -70.6539
        },
        {
            "name": "Centro de Yoga",
            "address": "Calle El Golf 567, Las Condes, Chile",
            "category": "otros",
            "description": "Clases de yoga y meditación",
            "owner_id": owner_ids[11],
            "profile_pic": "https://storage.googleapis.com/pymap_businesses_pics/profile_pics/yoga...",
            "latitude": -33.4144,
            "longitude": -70.5944
        },
        {
            "name": "Reparaciones Eléctricas",
            "address": "Av. La Cisterna 1234, La Cisterna, Chile",
            "category": "servicios",
            "description": "Reparaciones eléctricas residenciales y comerciales",
            "owner_id": owner_ids[12],
            "profile_pic": "https://storage.googleapis.com/pymap_businesses_pics/profile_pics/electric...",
            "latitude": -33.5350,
            "longitude": -70.6667
        },
        {
            "name": "Escuela de Música",
            "address": "Calle Merced 890, Santiago Centro, Chile",
            "category": "educacion",
            "description": "Lecciones de piano, guitarra y otros instrumentos",
            "owner_id": owner_ids[13],
            "profile_pic": "https://storage.googleapis.com/pymap_businesses_pics/profile_pics/music...",
            "latitude": -33.4394,
            "longitude": -70.6472
        },
        {
            "name": "Servicio de Jardinería",
            "address": "Av. Tobalaba 3456, Puente Alto, Chile",
            "category": "hogar",
            "description": "Diseño y mantenimiento de jardines",
            "owner_id": owner_ids[14],
            "profile_pic": "https://storage.googleapis.com/pymap_businesses_pics/profile_pics/gardening...",
            "latitude": -33.6167,
            "longitude": -70.5667
        }
    ]

    for business_data in businesses_data:
        # Create Business instance to validate
        business = Business(**business_data)
        
        # Prepare data for insertion, excluding _id if None
        data = business.model_dump(by_alias=True)
        if '_id' in data and data['_id'] is None:
            del data['_id']
        
        # Insert into DB
        await db.businesses.insert_one(data)
        print(f"Negocio {business.name} creado exitosamente.")

if __name__ == "__main__":
    asyncio.run(create_test_businesses())