from fastapi import APIRouter
from fastapi.responses import HTMLResponse

router = APIRouter()

@router.get("/payment/success", response_class=HTMLResponse)
def payment_success():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pago Exitoso</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            .container {
                text-align: center;
                padding: 2rem;
            }
            .icon {
                font-size: 4rem;
                margin-bottom: 1rem;
            }
            h1 {
                font-size: 2rem;
                margin-bottom: 1rem;
            }
            p {
                font-size: 1.2rem;
                margin-bottom: 2rem;
            }
            .redirect-text {
                font-size: 0.9rem;
                opacity: 0.8;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="icon">✅</div>
            <h1>¡Pago Exitoso!</h1>
            <p>Tu pago ha sido procesado correctamente</p>
            <p class="redirect-text">Redirigiendo a la aplicación...</p>
            <p class="redirect-text">Si no eres redirigido automáticamente, cierra esta ventana y vuelve a la app</p>
        </div>
        <script>
            // Intentar redirigir a la app
            setTimeout(() => {
                window.location.href = 'pymap://(tabs)/home';
            }, 2000);
            
            // Fallback: intentar cerrar la ventana después de 5 segundos
            setTimeout(() => {
                window.close();
            }, 5000);
        </script>
    </body>
    </html>
    """

@router.get("/payment/pending", response_class=HTMLResponse)
def payment_pending():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pago Pendiente</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white;
            }
            .container {
                text-align: center;
                padding: 2rem;
            }
            .icon {
                font-size: 4rem;
                margin-bottom: 1rem;
            }
            h1 {
                font-size: 2rem;
                margin-bottom: 1rem;
            }
            p {
                font-size: 1.2rem;
                margin-bottom: 2rem;
            }
            .redirect-text {
                font-size: 0.9rem;
                opacity: 0.8;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="icon">⏳</div>
            <h1>Pago Pendiente</h1>
            <p>Tu pago está siendo procesado</p>
            <p class="redirect-text">Redirigiendo a la aplicación...</p>
            <p class="redirect-text">Te notificaremos cuando se complete</p>
        </div>
        <script>
            setTimeout(() => {
                window.location.href = 'pymap://(tabs)/home';
            }, 2000);
            setTimeout(() => {
                window.close();
            }, 5000);
        </script>
    </body>
    </html>
    """

@router.get("/payment/failure", response_class=HTMLResponse)
def payment_failure():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pago Fallido</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
                color: white;
            }
            .container {
                text-align: center;
                padding: 2rem;
            }
            .icon {
                font-size: 4rem;
                margin-bottom: 1rem;
            }
            h1 {
                font-size: 2rem;
                margin-bottom: 1rem;
            }
            p {
                font-size: 1.2rem;
                margin-bottom: 2rem;
            }
            .redirect-text {
                font-size: 0.9rem;
                opacity: 0.8;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="icon">❌</div>
            <h1>Pago Fallido</h1>
            <p>Hubo un problema al procesar tu pago</p>
            <p class="redirect-text">Redirigiendo a la aplicación...</p>
            <p class="redirect-text">Puedes intentar nuevamente desde la app</p>
        </div>
        <script>
            setTimeout(() => {
                window.location.href = 'pymap://(tabs)/home';
            }, 2000);
            setTimeout(() => {
                window.close();
            }, 5000);
        </script>
    </body>
    </html>
    """
