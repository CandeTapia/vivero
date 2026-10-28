// =========================================================
// FRONT DE LA TIENDA
// El front NUNCA habla con Supabase: todo se le pide a nuestra API con fetch.
// Catálogo, búsqueda, cuenta, detalle y pedidos se conectan a la API con fetch.
// =========================================================

// ---------- ESTADO ----------
const catalogo = {};  // los productos que ya vinieron de la API, por id (para nombres y precios del carrito)
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];   // [ { producto_id, cantidad } ]
let token = localStorage.getItem('token');                         // lo guardamos al hacer login
let usuarioEmail = localStorage.getItem('email');
let usuarioRol = localStorage.getItem('rol');
let categoriaActual = null;
let ultimaLista = [];
let temporizadorBusqueda = null;
let solicitudCatalogo = 0;

function escapar(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}


// =========================================================
// CATALOGO
// =========================================================

// Pide los productos a la API y los dibuja.
// Si categoriaId tiene valor, pide solo los de esa categoria: /productos?categoria=2
async function cargarProductos(categoriaId = categoriaActual, texto = document.getElementById('buscador').value) {
  categoriaActual = categoriaId || null;
  let url = '/productos';
  const parametros = new URLSearchParams();
  if (categoriaActual) parametros.set('categoria', categoriaActual);
  if (texto.trim()) parametros.set('buscar', texto.trim());
  if (parametros.size) url += '?' + parametros.toString();
  const solicitud = ++solicitudCatalogo;
  const grilla = document.getElementById('productos');
  grilla.innerHTML = '<p class="vacio">Buscando tus próximas plantas...</p>';
  try {
    const res = await fetch(url);
    if (!res.ok) {
      if (solicitud !== solicitudCatalogo) return;
      ultimaLista = [];
      grilla.innerHTML = '<p class="vacio">No pudimos cargar el vivero. Volvé a intentarlo.</p>';
      return mostrarMensaje(await res.text(), 'error');
    }
    const productos = await res.json();
    if (solicitud !== solicitudCatalogo) return;
    ultimaLista = productos;
    pintarProductos(ultimaLista);
    pintarCategoriaActiva();
  } catch (error) {
    grilla.innerHTML = '<p class="vacio">No hay conexión con la tienda. Revisá que el servidor esté iniciado.</p>';
  }
}

function buscar(texto) {
  clearTimeout(temporizadorBusqueda);
  temporizadorBusqueda = setTimeout(() => cargarProductos(categoriaActual, texto), 250);
}

// Dibuja las tarjetas (ya resuelto)
function pintarProductos(lista) {
  const grilla = document.getElementById('productos');
  lista.forEach(p => { catalogo[p.id] = p; });   // los recordamos para el carrito
  pintarCarrito();
  if (lista.length === 0) {
    grilla.innerHTML = '<p class="vacio">No hay productos para mostrar.</p>';
    return;
  }
  grilla.innerHTML = '';
  lista.forEach(p => {
    const sinStock = p.stock < 1;
    grilla.innerHTML += `
      <article class="tarjeta">
        <img src="${escapar(p.imagen_url || 'images/planta.svg')}" alt="${escapar(p.nombre)}" loading="lazy" onerror="this.onerror=null;this.src='images/planta.svg'">
        <div class="info">
          <span class="categoria">${escapar(p.categorias ? p.categorias.nombre : '')}</span>
          <h3>${escapar(p.nombre)}</h3>
          <p class="descripcion">${escapar(p.descripcion || '')}</p>
          <span class="precio">${formatearPrecio(p.precio)}</span>
          <span class="stock">${sinStock ? 'Sin stock' : 'Quedan ' + Number(p.stock)}</span>
          <button class="btn btn-detalle" onclick="verDetalle(${Number(p.id)})">Ver detalle</button>
          <button class="btn btn-principal" onclick="agregar(${p.id})" ${sinStock ? 'disabled' : ''}>
            Agregar al carrito
          </button>
        </div>
      </article>`;
  });
}

function formatearPrecio(precio) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(Number(precio) || 0);
}

// Pide las categorias y arma los botones del filtro (ya resuelto)
async function cargarCategorias() {
  try {
    const res = await fetch('/categorias');
    if (!res.ok) throw new Error('No se pudieron cargar las categorías');
    const categorias = await res.json();
    const nav = document.getElementById('categorias');
    nav.innerHTML = '<button data-id="" onclick="cargarProductos()">Todo el vivero</button>';
    categorias.forEach(c => {
      const boton = document.createElement('button');
      boton.dataset.id = c.id;
      boton.textContent = c.nombre;
      boton.addEventListener('click', () => cargarProductos(c.id));
      nav.appendChild(boton);
    });
    pintarCategoriaActiva();
  } catch (error) { mostrarMensaje('No pudimos cargar las categorías.', 'error'); }
}

function pintarCategoriaActiva() {
  document.querySelectorAll('#categorias button').forEach(b => {
    const id = b.dataset.id ? Number(b.dataset.id) : null;
    b.classList.toggle('activa', id === categoriaActual);
  });
}


// =========================================================
// CARRITO (vive en el navegador: no toca la base hasta comprar)
// =========================================================

function guardarCarrito() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
  pintarCarrito();
}

function agregar(id) {
  const item = carrito.find(i => i.producto_id === id);
  if (item) item.cantidad++;
  else carrito.push({ producto_id: id, cantidad: 1 });
  guardarCarrito();
  mostrarMensaje('Producto añadido al carrito', 'ok');
}

function cambiarCantidad(id, cambio) {
  const item = carrito.find(i => i.producto_id === id);
  if (!item) return;
  item.cantidad += cambio;
  if (item.cantidad < 1) carrito = carrito.filter(i => i.producto_id !== id);
  guardarCarrito();
}

// Dibuja el carrito. El total es SOLO para mostrar:
// el total de verdad lo calcula el backend con los precios de la base.
function pintarCarrito() {
  const lista = document.getElementById('carrito-lista');
  let total = 0;
  let unidades = 0;
  lista.innerHTML = '';
  carrito.forEach(item => {
    const p = catalogo[item.producto_id];
    const nombre = p ? p.nombre : 'Producto ' + item.producto_id;
    const subtotal = p ? p.precio * item.cantidad : 0;
    total += subtotal;
    unidades += item.cantidad;
    lista.innerHTML += `
      <li>
        <span>${escapar(nombre)}<br><small>${formatearPrecio(subtotal)}</small></span>
        <span class="cantidad">
          <button onclick="cambiarCantidad(${item.producto_id}, -1)">−</button>
          ${item.cantidad}
          <button onclick="cambiarCantidad(${item.producto_id}, 1)">+</button>
        </span>
      </li>`;
  });
  if (carrito.length === 0) lista.innerHTML = '<li>Tu carrito está vacío</li>';
  document.getElementById('carrito-total').textContent = formatearPrecio(total);
  document.getElementById('contador').textContent = unidades;
}

function alternarCarrito() {
  document.getElementById('carrito').classList.toggle('oculto');
}


// =========================================================
// USUARIOS: registro, login y salida
// =========================================================

// Manda nombre, email y contraseña a POST /registro.
// Si sale bien (201), avisa y muestra el formulario de login.
async function registrar(evento) {
  evento.preventDefault();      // que el formulario no recargue la pagina
  const nombre = document.getElementById('reg-nombre').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  try {
    const res = await fetch('/registro', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre, email, password }) });
    if (res.status === 201) {
      document.getElementById('form-registro').reset();
      mostrarRegistro(false);
      mostrarMensajeAuth('Cuenta creada. Ahora ingresá con tu email y contraseña.', 'ok');
    } else mostrarMensajeAuth(await res.text(), 'error');
  } catch (error) { mostrarMensajeAuth('No pudimos conectar con la tienda.', 'error'); }
}

// Manda email y contraseña a POST /login.
// Si sale bien, guarda el token en localStorage y actualiza la barra.
async function iniciarSesion(evento) {
  evento.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  try {
    const res = await fetch('/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    if (!res.ok) return mostrarMensajeAuth(await res.text(), 'error');
    const datos = await res.json();
    token = datos.token;
    usuarioEmail = email;
    localStorage.setItem('token', token);
    localStorage.setItem('email', email);
    document.getElementById('form-login').reset();
    actualizarSesion();
    await cargarPerfil();
    mostrarMensajeAuth('¡Sesión iniciada! Ya podés comprar. Cerrá esta ventana para seguir.', 'ok');
  } catch (error) { mostrarMensajeAuth('No pudimos conectar con la tienda.', 'error'); }
}

function cerrarSesion() {
  token = null;
  usuarioEmail = null;
  usuarioRol = null;
  localStorage.removeItem('token');
  localStorage.removeItem('email');
  localStorage.removeItem('rol');
  actualizarSesion();
  mostrarMensaje('Cerraste sesión', 'ok');
}

function actualizarSesion() {
  const logueado = Boolean(token);
  document.getElementById('saludo').textContent = logueado ? usuarioEmail : '';
  document.getElementById('btn-ingresar').classList.toggle('oculto', logueado);
  document.getElementById('btn-salir').classList.toggle('oculto', !logueado);
  document.getElementById('btn-pedidos').classList.toggle('oculto', !logueado);
  document.getElementById('btn-admin').classList.toggle('oculto', !logueado || usuarioRol !== 'admin');
}

async function cargarPerfil() {
  if (!token) return;
  try {
    const res = await fetch('/perfil', { headers: { Authorization: 'Bearer ' + token } });
    if (res.status === 401) {
      cerrarSesion();
      return;
    }
    if (!res.ok) return;
    const perfil = await res.json();
    usuarioRol = perfil.rol;
    localStorage.setItem('rol', usuarioRol);
    actualizarSesion();
  } catch (error) { /* el resto de la tienda sigue disponible */ }
}

function abrirPanel(titulo, contenido) {
  document.getElementById('panel-titulo').textContent = titulo;
  document.getElementById('panel-contenido').innerHTML = contenido;
  document.getElementById('panel-modal').classList.remove('oculto');
}

function cerrarPanel() { document.getElementById('panel-modal').classList.add('oculto'); }

function cerrarPanelFondo(evento) {
  if (evento.target.id === 'panel-modal') cerrarPanel();
}

async function verDetalle(id) {
  abrirPanel('Detalle de la planta', '<p class="vacio">Cargando información...</p>');
  try {
    const res = await fetch('/productos/' + encodeURIComponent(id));
    if (!res.ok) throw new Error(await res.text());
    const p = await res.json();
    abrirPanel(p.nombre, `
      <article class="detalle-producto">
        <img src="${escapar(p.imagen_url || 'images/planta.svg')}" alt="${escapar(p.nombre)}" onerror="this.onerror=null;this.src='images/planta.svg'">
        <div><span class="categoria">${escapar(p.categorias?.nombre || '')}</span>
          <p>${escapar(p.descripcion || 'Una linda opción para sumar verde a tu espacio.')}</p>
          <strong class="precio">${formatearPrecio(p.precio)}</strong>
          <p class="stock">${Number(p.stock) > 0 ? 'Quedan ' + Number(p.stock) : 'Sin stock'}</p>
          <button class="btn btn-principal" onclick="agregar(${Number(p.id)})" ${Number(p.stock) < 1 ? 'disabled' : ''}>Agregar al carrito</button>
        </div>
      </article>`);
  } catch (error) { abrirPanel('Detalle de la planta', '<p class="vacio">No pudimos cargar este producto.</p>'); }
}

function dibujarPedidos(pedidos, admin = false) {
  if (!pedidos.length) return '<p class="vacio">Todavía no hay pedidos.</p>';
  return `<div class="lista-pedidos">${pedidos.map(p => `
    <article class="pedido-card">
      <div class="pedido-resumen"><strong>Pedido #${Number(p.id)}</strong>${admin ? `<span>Cliente: ${escapar(p.usuario_id)}</span>` : ''}<span>${new Date(p.creado).toLocaleString('es-AR')}</span><span class="estado-pedido">${escapar(p.estado)}</span><strong>${formatearPrecio(p.total)}</strong></div>
      <ul>${(p.pedido_items || []).map(item => `<li>${escapar(item.productos?.nombre || 'Planta')} · ${Number(item.cantidad)} × ${formatearPrecio(item.precio_unitario)}</li>`).join('')}</ul>
    </article>`).join('')}</div>`;
}

async function verMisPedidos() {
  if (!token) return abrirModal();
  abrirPanel('Mis pedidos', '<p class="vacio">Cargando tus pedidos...</p>');
  try {
    const res = await fetch('/mis-pedidos', { headers: { Authorization: 'Bearer ' + token } });
    if (!res.ok) throw new Error(await res.text());
    abrirPanel('Mis pedidos', dibujarPedidos(await res.json()));
  } catch (error) { abrirPanel('Mis pedidos', '<p class="vacio">No pudimos cargar tus pedidos.</p>'); }
}

async function abrirAdmin() {
  if (!token) return abrirModal();
  abrirPanel('Panel administrador', '<p class="vacio">Cargando inventario y pedidos...</p>');
  try {
    const headers = { Authorization: 'Bearer ' + token };
    const [resPedidos, resProductos] = await Promise.all([
      fetch('/admin/pedidos', { headers }),
      fetch('/admin/productos', { headers })
    ]);
    if (resPedidos.status === 403 || resProductos.status === 403) {
      return abrirPanel('Panel administrador', '<p class="vacio">No tenés permiso para acceder a esta sección.</p>');
    }
    if (!resPedidos.ok || !resProductos.ok) throw new Error('No se pudo cargar el panel');
    const [pedidos, productos] = await Promise.all([resPedidos.json(), resProductos.json()]);
    const inventario = productos.length
      ? `<div class="inventario-admin">${productos.map(p => `<div><strong>${escapar(p.nombre)}</strong><span>${formatearPrecio(p.precio)}</span><span>Stock: ${Number(p.stock)}</span></div>`).join('')}</div>`
      : '<p class="vacio">No hay productos en el inventario.</p>';
    abrirPanel('Panel administrador', `<h3>Inventario</h3>${inventario}<h3>Pedidos de clientes</h3>${dibujarPedidos(pedidos, true)}`);
  } catch (error) { abrirPanel('Panel administrador', '<p class="vacio">No pudimos cargar el panel.</p>'); }
}


// =========================================================
// COMPRA
// =========================================================

// Manda el carrito a POST /pedidos con el token en el header Authorization.
// 201: compra hecha (vaciar carrito y recargar productos para ver el stock nuevo)
// 401: no hay sesion (abrir el login)
// 400: algo del carrito no sirve (mostrar el mensaje del servidor)
async function comprar() {
  if (carrito.length === 0) return mostrarMensaje('Tu carrito está vacío', 'error');
  if (!token) { abrirModal(); return mostrarMensaje('Ingresá para poder comprar.', 'error'); }
  try {
    const res = await fetch('/pedidos', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }, body: JSON.stringify({ items: carrito }) });
    if (res.status === 201) {
      const pedido = await res.json();
      carrito = [];
      guardarCarrito();
      alternarCarritoCerrado();
      await cargarProductos(categoriaActual);
      mostrarMensaje('¡Gracias por tu compra! Tu pedido es el #' + pedido.id + '.', 'ok');
    } else if (res.status === 401) {
      cerrarSesion();
      abrirModal();
      mostrarMensaje('Tu sesión venció. Ingresá otra vez para comprar.', 'error');
    } else mostrarMensaje(await res.text(), 'error');
  } catch (error) { mostrarMensaje('No pudimos completar la compra. Intentá de nuevo.', 'error'); }
}

function alternarCarritoCerrado() { document.getElementById('carrito').classList.add('oculto'); }


// =========================================================
// AYUDANTES DE PANTALLA (ya resueltos)
// =========================================================

function mostrarMensaje(texto, tipo) {
  const caja = document.getElementById('mensaje');
  caja.textContent = texto;
  caja.className = 'mensaje ' + tipo;
  clearTimeout(caja.temporizador);
  caja.temporizador = setTimeout(() => caja.classList.add('oculto'), 4000);
}

function abrirModal() {
  limpiarMensajeAuth();
  document.getElementById('modal').classList.remove('oculto');
}

function cerrarModal() {
  document.getElementById('modal').classList.add('oculto');
}

function mostrarRegistro(mostrar) {
  document.getElementById('form-registro').classList.toggle('oculto', !mostrar);
  document.getElementById('form-login').classList.toggle('oculto', mostrar);
  limpiarMensajeAuth();
}

function mostrarMensajeAuth(texto, tipo) {
  const caja = document.getElementById('auth-mensaje');
  caja.textContent = texto;
  caja.className = 'mensaje-auth ' + tipo;
}

function limpiarMensajeAuth() {
  const caja = document.getElementById('auth-mensaje');
  caja.textContent = '';
  caja.className = 'mensaje-auth oculto';
}


// ---------- AL ABRIR LA PAGINA ----------
cargarCategorias();
cargarProductos();
pintarCarrito();
actualizarSesion();
if (token) cargarPerfil();
