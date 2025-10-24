@echo off
REM Script generico para ejecutar el backend en Windows
REM Se ejecuta desde el directorio backend/

REM Cambiar al directorio del script
cd /d "%~dp0"

REM Cargar variables de entorno si existe .env
if exist ".env" (
    echo [*] Cargando variables de entorno desde .env...
    REM Windows no tiene un equivalente directo a 'export $(cat .env)'
    REM Pero las variables se cargan automaticamente con python-dotenv en el codigo
)

REM Activar entorno virtual si existe
if exist "venv\Scripts\activate.bat" (
    echo [*] Activando entorno virtual...
    call venv\Scripts\activate.bat
) else (
    echo [AVISO] No se encontro entorno virtual. Ejecuta setup.bat primero.
    echo.
)

REM Usar puerto de variable de entorno o 8000 por defecto
if not defined PORT set PORT=8000

REM Ejecutar el servidor
echo [*] Iniciando servidor en http://localhost:%PORT%
echo [*] Documentacion: http://localhost:%PORT%/docs
echo [*] Presiona Ctrl+C para detener el servidor
echo.
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port %PORT%

pause