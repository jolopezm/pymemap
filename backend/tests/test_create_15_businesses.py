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
        "69208a6cdcfb50e654182cfa",  # Maria
        "69208a6edcfb50e654182cfb",  # Juan
        "69208a6fdcfb50e654182cfc",  # Ana
        "69208a6fdcfb50e654182cfd",  # Pedro
        "69208a70dcfb50e654182cfe",  # Sofia
        "69208a70dcfb50e654182cff",  # Carlos
        "69208a70dcfb50e654182d00",  # Laura
        "69208a71dcfb50e654182d01",  # Diego
        "69208a71dcfb50e654182d02",  # Camila
        "69208a72dcfb50e654182d03",  # Andres
        "69208a72dcfb50e654182d04",  # Valentina
        "69208a72dcfb50e654182d05",  # Felipe
        "69208a73dcfb50e654182d06",  # Isabella
        "69208a73dcfb50e654182d07",  # Sebastian
        "69208a74dcfb50e654182d08"   # Martina
    ]

    businesses_data = [
        {
            "name": "Técnico de Bicicletas",
            "address": "Juan Enrique Concha 254, Ñuñoa, Chile",
            "category": "servicios",
            "description": "Reparo bicicletas a domicilio o en mi taller pequeño",
            "owner_id": owner_ids[0],
            "profile_pic": "https://storage.googleapis.com/pymap_businesses_pics/profile_pics/b3ec...",
            "latitude": -33.4577022,
            "longitude": -70.5955576
        },
        {
            "name": "Chef a Domicilio",
            "address": "Plaza de Armas, Santiago, Chile",
            "category": "comida",
            "description": "Preparación de comidas caseras a domicilio para eventos o cenas familiares",
            "owner_id": owner_ids[1],
            "profile_pic": "https://storage.googleapis.com/pymap_businesses_pics/profile_pics/chef...",
            "latitude": -33.4378,
            "longitude": -70.6503
        },
        {
            "name": "Costurera Freelance",
            "address": "Av. Providencia 1234, Providencia, Chile",
            "category": "servicios",
            "description": "Servicios de costura y arreglos de ropa a domicilio o en mi taller",
            "owner_id": owner_ids[2],
            "profile_pic": "https://storage.googleapis.com/pymap_businesses_pics/profile_pics/costurera...",
            "latitude": -33.4314,
            "longitude": -70.6092
        },
        {
            "name": "Masajista Terapéutico",
            "address": "Calle Las Condes 567, Las Condes, Chile",
            "category": "salud",
            "description": "Masajes relajantes y terapéuticos a domicilio o en mi espacio privado",
            "owner_id": owner_ids[3],
            "profile_pic": "https://storage.googleapis.com/pymap_businesses_pics/profile_pics/masajista...",
            "latitude": -33.4155,
            "longitude": -70.5831
        },
        {
            "name": "Peluquera a Domicilio",
            "address": "Av. Apoquindo 890, Las Condes, Chile",
            "category": "belleza",
            "description": "Cortes de cabello, tintes y tratamientos capilares en la comodidad de tu hogar",
            "owner_id": owner_ids[4],
            "profile_pic": "https://storage.googleapis.com/pymap_businesses_pics/profile_pics/peluquera...",
            "latitude": -33.4134,
            "longitude": -70.5975
        },
        {
            "name": "Profesor Particular de Inglés",
            "address": "Calle Huérfanos 456, Santiago Centro, Chile",
            "category": "educacion",
            "description": "Clases de inglés personalizadas a domicilio o en mi estudio",
            "owner_id": owner_ids[5],
            "profile_pic": "https://storage.googleapis.com/pymap_businesses_pics/profile_pics/profesor...",
            "latitude": -33.4417,
            "longitude": -70.6533
        },
        {
            "name": "Servicio de Limpieza Doméstica",
            "address": "Av. La Florida 2345, La Florida, Chile",
            "category": "hogar",
            "description": "Limpieza profunda de hogares, a domicilio con productos ecológicos",
            "owner_id": owner_ids[6],
            "profile_pic": "https://storage.googleapis.com/pymap_businesses_pics/profile_pics/limpieza...",
            "latitude": -33.5225,
            "longitude": -70.5989
        },
        {
            "name": "Fotógrafo Freelance",
            "address": "Calle Italia 789, Ñuñoa, Chile",
            "category": "servicios",
            "description": "Sesiones fotográficas a domicilio para eventos, retratos y productos",
            "owner_id": owner_ids[7],
            "profile_pic": "https://storage.googleapis.com/pymap_businesses_pics/profile_pics/fotografo...",
            "latitude": -33.4547,
            "longitude": -70.6047
        },
        {
            "name": "Terapeuta Holístico",
            "address": "Av. Vicuña Mackenna 1122, Ñuñoa, Chile",
            "category": "salud",
            "description": "Terapias alternativas como reiki y aromaterapia a domicilio",
            "owner_id": owner_ids[8],
            "profile_pic": "https://storage.googleapis.com/pymap_businesses_pics/profile_pics/terapeuta...",
            "latitude": -33.4569,
            "longitude": -70.6058
        },
        {
            "name": "Manicurista Móvil",
            "address": "Calle Suecia 345, Providencia, Chile",
            "category": "belleza",
            "description": "Manicura y pedicura profesional a domicilio o en mi kit móvil",
            "owner_id": owner_ids[9],
            "profile_pic": "https://storage.googleapis.com/pymap_businesses_pics/profile_pics/manicurista...",
            "latitude": -33.4289,
            "longitude": -70.6156
        },
        {
            "name": "Reparador de Computadoras",
            "address": "Av. Libertador Bernardo O'Higgins 678, Santiago Centro, Chile",
            "category": "servicios",
            "description": "Reparación y mantenimiento de computadoras a domicilio o en taller",
            "owner_id": owner_ids[10],
            "profile_pic": "https://storage.googleapis.com/pymap_businesses_pics/profile_pics/reparador...",
            "latitude": -33.4422,
            "longitude": -70.6539
        },
        {
            "name": "Instructor de Yoga Personal",
            "address": "Calle El Golf 567, Las Condes, Chile",
            "category": "educacion",
            "description": "Clases de yoga personalizadas a domicilio o en parques locales",
            "owner_id": owner_ids[11],
            "profile_pic": "https://storage.googleapis.com/pymap_businesses_pics/profile_pics/yoga...",
            "latitude": -33.4144,
            "longitude": -70.5944
        },
        {
            "name": "Electricista Independiente",
            "address": "Av. La Cisterna 1234, La Cisterna, Chile",
            "category": "servicios",
            "description": "Instalaciones y reparaciones eléctricas residenciales a domicilio",
            "owner_id": owner_ids[12],
            "profile_pic": "https://storage.googleapis.com/pymap_businesses_pics/profile_pics/electricista...",
            "latitude": -33.5350,
            "longitude": -70.6667
        },
        {
            "name": "Profesor de Música",
            "address": "Calle Merced 890, Santiago Centro, Chile",
            "category": "educacion",
            "description": "Lecciones de guitarra, piano y canto a domicilio",
            "owner_id": owner_ids[13],
            "profile_pic": "https://storage.googleapis.com/pymap_businesses_pics/profile_pics/musica...",
            "latitude": -33.4394,
            "longitude": -70.6472
        },
        {
            "name": "Jardinero Urbano",
            "address": "Av. Tobalaba 3456, Puente Alto, Chile",
            "category": "hogar",
            "description": "Diseño y cuidado de jardines pequeños a domicilio",
            "owner_id": owner_ids[14],
            "profile_pic": "https://storage.googleapis.com/pymap_businesses_pics/profile_pics/jardinero...",
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
        await db.business.insert_one(data)
        print(f"Negocio {business.name} creado exitosamente.")

if __name__ == "__main__":
    asyncio.run(create_test_businesses())