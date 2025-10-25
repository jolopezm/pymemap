#!/bin/bash
# Script genérico para ejecutar el backend en Linux/macOS
# Se ejecuta desde el directorio backend/

# Cargar variables de entorno si existe .env
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Activar entorno virtual si existe
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Ejecutar el servidor
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port ${PORT:-8000}
