@echo off
REM Script de setup inicial para el proyecto PymeMap (Windows)

echo ================================
echo   Configurando PymeMap Backend
echo ================================
echo.

REM Verificar que estamos en el directorio correcto
if not exist "requirements.txt" (
    echo [ERROR] Ejecuta este script desde el directorio backend/
    pause
    exit /b 1
)

REM Crear .env si no existe
if not exist ".env" (
    echo [*] Creando archivo .env desde .env.example...
    copy .env.example .env >nul
    echo [OK] .env creado
    echo [IMPORTANTE] Edita .env con tus valores reales
    echo.
) else (
    echo [OK] .env ya existe
)

REM Crear entorno virtual si no existe
if not exist "venv" (
    echo [*] Creando entorno virtual...
    python -m venv venv
    if errorlevel 1 (
        echo [ERROR] No se pudo crear el entorno virtual
        echo [TIP] Verifica que Python este instalado: python --version
        pause
        exit /b 1
    )
    echo [OK] Entorno virtual creado
) else (
    echo [OK] Entorno virtual ya existe
)

REM Activar entorno virtual e instalar dependencias
echo [*] Instalando dependencias...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt

if errorlevel 1 (
    echo [ERROR] Hubo un problema instalando las dependencias
    pause
    exit /b 1
)

echo.
echo ================================
echo   Setup completado exitosamente
echo ================================
echo.
echo Proximos pasos:
echo 1. Edita .env con tus credenciales de MongoDB y JWT_SECRET_KEY
echo 2. Ejecuta: run_server.bat
echo 3. Visita: http://localhost:8000/docs
echo.
pause
