# Raíz & Hoja · Vivero online

Tienda de plantas construida con **Express + Supabase + JavaScript**. Incluye catálogo
con categorías y búsqueda, carrito, cuentas, pedidos y un panel protegido para administración.

## Estructura

    tienda/
    ├── config/supabaseClient.js        la conexión a Supabase (clave secreta)
    ├── middlewares/verificarUsuario.js ¿quién compra?
    ├── middlewares/verificarAdmin.js   ¿es administrador?
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
- Detalle de producto y consulta de los pedidos propios.
- Panel administrador protegido por el rol del perfil.

| Archivo | Función |
|---|---|
| `models/productosModel.js` | Consulta de productos activos y filtro por categoría |
| `models/authModel.js` | Registro en Supabase Auth y login con token |
| `middlewares/verificarUsuario.js` | Validación del token de compra |
| `models/pedidosModel.js` | Validación de carrito, total, pedido y descuento de stock |
| `public/app.js` | Catálogo, filtro, carrito, registro, login y compra |

## Puesta en marcha

1. **Base.** Crear un proyecto en Supabase (región São Paulo) y correr `db/esquema.sql`
    una vez en el **SQL Editor**. El script crea tablas y ocho plantas de ejemplo para el vivero.
2. **Imágenes.** Para usar las fotos del vivero, crear un bucket público `fotos_plantas`, subir imágenes y guardar sus URL públicas en `imagen_url`.
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
| GET | `/perfil` | perfil y rol del usuario | sí (token) |
| GET | `/categorias` | lista las categorías | no |
| GET | `/productos` | lista productos (`?categoria=2` y `?buscar=cactus` filtran) | no |
| GET | `/productos/:id` | detalle de una planta | no |
| POST | `/pedidos` | registra una compra | **sí** (token) |
| GET | `/mis-pedidos` | pedidos del usuario autenticado | sí (token) |
| GET | `/admin/pedidos` | pedidos de todos los clientes | sí (token + rol admin; clientes reciben 403) |
| GET | `/admin/productos` | inventario para el panel admin | sí (token + rol admin; clientes reciben 403) |

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
- [x] Deploy en Vercel funcionando
- [x] Este README actualizado con el link del deploy y los integrantes

## Extras para mejor nota

- [x] Panel admin con rol (`perfiles.rol = 'admin'`); las rutas admin responden 403 a clientes
- [x] Buscador por nombre en la API
- [x] "Mis pedidos"
- [x] Página de detalle de producto

### Habilitar el panel administrador

1. Registrá una cuenta normal desde la tienda.
2. En Supabase, buscá el usuario en **Authentication → Users** para ver su UUID; después abrí **Table Editor → perfiles** y ubicá la fila con ese `id`.
3. Cambiá `rol` de `cliente` a `admin` y guardá.
4. Cerrá sesión y volvé a ingresar en la tienda. Aparecerá **Panel admin**.

El servidor vuelve a comprobar el rol en cada petición: cambiar el botón o el almacenamiento del navegador no da acceso admin.

---
Integrantes: Uma Chandia y Candela Tapia · Link del deploy: https://vivero-zeta.vercel.app

Prof. Julia Panei · UTN Neuquén · Diseño Backend 2026
