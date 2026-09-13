# Administración LS 1713

Panel React para citas, servicios y sus descripciones, videos del portafolio e inventario. Incluye acceso administrativo, resumen, búsquedas, filtros y formularios adaptables a móvil.

## Ejecutar

Desde esta carpeta:

```sh
npm ci
npm run dev
```

Abre http://localhost:5174. La API predeterminada es https://backend-car-wash.onrender.com. Para cambiarla, configura `VITE_API_URL` en `.env.local` (ver `.env.example`) y reinicia Vite. No pongas contraseñas ni secretos en variables `VITE_*`.

## Publicar con el backend de Render

1. Despliega los cambios de `backend`, incluidos `models/material.py` y `routes/materials.py`. Al iniciar se crean las tablas nuevas `materials` y `stock_movements`; no se modifican tablas existentes.
2. En el backend configura `SECRET_KEY` y `ADMIN_EMAILS`. Si falta la cuenta, ejecuta `flask --app app create-admin` en el entorno del backend. Solicita correo y contraseña de forma interactiva.
3. En `CORS_ORIGINS` agrega el origen exacto del panel (protocolo y dominio, sin barra final), conservando el de la página pública. Para desarrollo agrega `http://localhost:5174` y/o `http://127.0.0.1:5174`. La configuración explícita de Render reemplaza los valores por defecto.
4. Publica esta carpeta como sitio estático: instalación `npm ci`, compilación `npm run build`, directorio de salida `dist`. Configura `VITE_API_URL=https://backend-car-wash.onrender.com` antes de compilar.
5. Inicia sesión con la cuenta autorizada. Las rutas usan hash, por lo que no requieren reglas de redirección del servidor.

El token se guarda por pestaña en sessionStorage. Al vencer, el panel solicita iniciar sesión otra vez. Cerrar sesión borra el token local; el backend no implementa revocación individual.

## Inventario

Cada material tiene nombre, uso, categoría, unidad, mínimo, notas y varias diluciones por uso. Las proporciones se registran como partes de producto y partes de agua; son datos ingresados por el propietario, no recetas generadas por el sistema.

La existencia inicial genera un movimiento. Después, el stock cambia mediante entradas y salidas con motivo e historial. No se permite retirar más de lo disponible ni cambiar la unidad después de registrar movimientos. Los materiales con historial se desactivan para conservarlo; los que no tienen movimientos pueden eliminarse. No hay descuento automático al completar citas.

Los videos guardan enlaces y metadatos en la base de datos. El reproductor de TikTok se carga solo en el formulario del video abierto. Usa el enlace completo de TikTok, no el enlace corto de compartir. Los registros guardados son públicos de inmediato en el portafolio; todavía no hay borradores.

Las listas tienen paginación local de 10 registros; la API aún entrega la colección completa. Para volúmenes grandes será necesario paginar también en el servidor.

## Validación

```sh
npm run lint
npm test
npm run build
```

Pruebas del backend: `python -m unittest discover -s tests -v` desde `backend`. Usan SQLite en memoria y no envían correos.

Para una demostración aislada, ejecuta desde `backend`:

```sh
python -c "import runpy; runpy.run_path('tests/preview_server.py', run_name='__main__')"
```

Arranca este frontend con `VITE_API_URL=http://127.0.0.1:5002` y puerto 5175 (`npm run dev -- --port 5175`). Cuenta exclusiva de la demostración: `demo@example.test` / `Demo-preview-123`. Todos sus datos son temporales y desaparecen al reiniciar el servidor de demostración. No despliegues ese servidor.

## Ingresos y compras

El resumen muestra lo ganado en el mes. Citas muestra ingresos totales, ingresos del mes e importe pendiente, sin depender del filtro de la tabla. Solo las citas Completed suman ingresos; Canceled no suma. El mes corresponde a scheduled_date en America/Mexico_City. Son ingresos antes de gastos, no utilidad neta ni pagos conciliados.

Las citas nuevas conservan el precio del servicio al reservar, y lo actualizan si se cambia de servicio. Las antiguas sin precio guardado se identifican como estimaciones con la tarifa actual. No se inventan importes para citas sin servicio.

En movimientos, selecciona Entrada y Registrar como compra. Captura la cantidad en la unidad del material y el costo TOTAL en MXN (hasta dos decimales): 1 L de APC por $100, o 1000 ml por $100 si está registrado en ml. El historial muestra costo total, costo por unidad y total de compras registradas; las entradas sin costo no se consideran compras.

Estos cambios requieren volver a desplegar backend y panel. El backend crea las tablas nuevas appointment_prices y material_purchases al iniciar, sin alterar columnas existentes. Las pruebas usan SQLite; no se ha probado contra tu PostgreSQL de producción ni modificado sus datos.

Materiales incluye el total de compras del mes (Ciudad de México), incluidos materiales inactivos. Los movimientos admiten ml y L con conversión automática a la unidad base y precisión máxima de tres decimales; piezas admite enteros. La unidad base de materiales con historial se conserva para no reinterpretar existencias como objetos. Requiere desplegar el backend actualizado.
