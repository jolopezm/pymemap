#!/bin/bash
# Script de setup inicial para el proyecto PymeMap

echo "🚀 Configurando PymeMap Backend..."

# Verificar que estamos en el directorio correcto
if [ ! -f "requirements.txt" ]; then
    echo "❌ Error: Ejecuta este script desde el directorio backend/"
    exit 1
fi

# Crear .env si no existe
if [ ! -f ".env" ]; then
    echo "📝 Creando archivo .env desde .env.example..."
    cp .env.example .env
    echo "⚠️  IMPORTANTE: Edita .env con tus valores reales"
    echo ""
else
    echo "✅ .env ya existe"
fi

# Crear entorno virtual si no existe
if [ ! -d "venv" ]; then
    echo "🐍 Creando entorno virtual..."
    python3 -m venv venv
    echo "✅ Entorno virtual creado"
else
    echo "✅ Entorno virtual ya existe"
fi

# Activar entorno virtual e instalar dependencias
echo "📦 Instalando dependencias..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo ""
echo "✅ ¡Setup completado!"
echo ""
echo "📚 Próximos pasos:"
echo "1. Edita .env con tus credenciales de MongoDB y JWT_SECRET_KEY"
echo "2. Ejecuta: ./run_server.sh"
echo "3. Visita: http://localhost:8000/docs"
echo ""
