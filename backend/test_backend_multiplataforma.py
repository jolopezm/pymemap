#!/usr/bin/env python3
"""
Script multiplataforma para probar el backend de PymeMap
Funciona en Windows, Linux y macOS
"""

import sys
import os
import platform
import time

try:
    import requests
except ImportError:
    print("❌ Error: requests no está instalado")
    print("Instala con: pip install requests")
    sys.exit(1)

def main():
    print(f"🖥️  Sistema operativo: {platform.system()}")
    print(f"🐍 Python: {sys.version}")
    print("🔧 Probando conectividad del backend...")
    
    # Esperar un poco para que el servidor inicie
    time.sleep(2)
    
    try:
        # Probar endpoint raíz
        print("📡 Probando endpoint raíz...")
        response = requests.get('http://localhost:8000/', timeout=5)
        print(f"✅ Servidor respondió: {response.status_code}")
        print(f"📝 Respuesta: {response.json()}")
        
        # Probar documentación
        print("📚 Probando documentación...")
        docs_response = requests.get('http://localhost:8000/docs', timeout=5)
        print(f"📚 Documentación disponible: {docs_response.status_code}")
        
        print("🎉 Backend funcionando correctamente en", platform.system())
        
    except requests.exceptions.ConnectionError:
        print("❌ Error: No se puede conectar al backend")
        print("💡 Asegúrate de que el servidor esté corriendo en http://localhost:8000")
        print("🚀 Para iniciarlo:")
        if platform.system() == "Windows":
            print("   Windows: run_server.bat")
        else:
            print("   Linux/macOS: ./run_server.sh")
        sys.exit(1)
        
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()