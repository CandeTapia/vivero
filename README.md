# Raíz & Hoja · Vivero online

Tienda de plantas construida con **Express + Supabase + JavaScript**. Incluye catálogo
con categorías y buscador, carrito, registro, inicio de sesión y compra con control de stock.

## Estructura

    tienda/
    ├── config/supabaseClient.js        la conexión a Supabase (clave secreta)
    ├── middlewares/verificarUsuario.js ¿quién compra?
    ├── models/
    │   ├── productosModel.js           el catálogo
    │   ├── authModel.js                registro y login con Auth
    │   └── pedidosModel.js             la compra
    ├── controllers/                    validan y arman las respuestas  (listos)
    ├── routes/tiendaRoutes.js          el mapa de rutas                (listo)
    ├── utils/errores.js                errores con código              (listo)
    ├── public/
    │   ├── index.html                  la página                       (lista)
    │   ├── estilos.css                 los colores de la tienda        (listos)
    │   └── app.js                      catálogo, carrito y compra
    ├── db/esquema.sql                  las tablas y datos de ejemplo
    ├── index.js                        el servidor (local y Vercel)
    ├── .env.example                    modelo de credenciales
    └── package.json

## Funcionalidades

- Catálogo con categorías, búsqueda por nombre, imágenes, precio y disponibilidad.
- Carrito que persiste en el navegador.
- Registro e inicio de sesión mediante Supabase Auth.
- Compra protegida por token. El servidor valida disponibilidad y calcula el total usando los precios de la base.

| Archivo | Función |
|---|---|
| `models/productosModel.js` | Consulta de productos activos y filtro por categoría |
| `models/authModel.js` | Registro en Supabase Auth y login con token |
| `middlewares/verificarUsuario.js` | Validación del token de compra |
| `models/pedidosModel.js` | Validación de carrito, total, pedido y descuento de stock |
| `public/app.js` | Catálogo, filtro, carrito, registro, login y compra |

## Puesta en marcha

1. **Base.** Crear un proyecto en Supabase (región São Paulo) y correr `db/esquema.sql`
   una vez en el **SQL Editor**. El script crea tablas y seis productos de ejemplo para el vivero.
2. **Imágenes.** Los ejemplos incluyen una ilustración local. Para usar fotos propias, crear
   un bucket público `productos`, subir imágenes y guardar sus URL públicas en `imagen_url`.
3. **Credenciales.** Copiar `.env.example` como `.env` y completar la URL
   y la **clave secreta** (Project Settings → API Keys).
4. **Instalar y levantar:**

        npm install
        npm start

5. Abrir http://localhost:3000. No abrir `index.html` con doble clic.

## Las rutas

| Método | Ruta | Qué hace | Protegida |
|---|---|---|---|
| POST | `/registro` | crea un usuario | no |
| POST | `/login` | devuelve el token | no |
| GET | `/categorias` | lista las categorías | no |
| GET | `/productos` | lista los productos (`?categoria=2` filtra) | no |
| POST | `/pedidos` | registra una compra | **sí** (token) |

## Deploy en Vercel

1. Subir el proyecto a un repositorio de GitHub (el `.gitignore` ya deja afuera
   `node_modules` y `.env`).
2. En Vercel: **Add New → Project**, elegir el repositorio. Vercel detecta Express solo.
3. En **Environment Variables**, cargar `SUPABASE_URL` y `SUPABASE_KEY`
   con los mismos valores del `.env`.
4. **Deploy.** Vercel publica la página y ejecuta la API. Después probá registro, login y compra desde la URL asignada.

## Personalizar el catálogo

- Cambiá categorías y plantas desde los `insert` de `db/esquema.sql` o el Table Editor de Supabase.
- Para fotos reales, cargalas a Storage y actualizá `imagen_url` de cada producto.
- Ajustá la paleta en las variables del principio de `public/estilos.css`.

## Mínimo obligatorio del TP

- [x] Catálogo con imágenes, buscador y filtro por categoría
- [x] Carrito persistente en el navegador
- [x] Registro y login con Supabase Auth
- [x] Compra que controla el stock y calcula el total en el backend
- [ ] Deploy en Vercel funcionando (requiere configurar el proyecto y las credenciales)
- [ ] Este README actualizado con el link del deploy y los integrantes

## Extras para mejor nota

- Panel admin con rol (`perfiles.rol = 'admin'`, responde 403 a los clientes)
- Buscador por nombre
- "Mis pedidos"
- Página de detalle de producto

---
Integrantes: _completar con los nombres del equipo_ · Link del deploy: _completar después de publicar_

Prof. Julia Panei · UTN Neuquén · Diseño Backend 2026
