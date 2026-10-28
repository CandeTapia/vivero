// RUTAS: el mapa de direcciones. Nada de logica aca.
const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const productos = require('../controllers/productosController');
const pedidos = require('../controllers/pedidosController');
const verificarUsuario = require('../middlewares/verificarUsuario');
const verificarAdmin = require('../middlewares/verificarAdmin');

router.post('/registro', auth.registro);
router.post('/login', auth.login);
router.get('/categorias', productos.verCategorias);
router.get('/productos', productos.verProductos);
router.get('/productos/:id', productos.verProducto);
router.get('/perfil', verificarUsuario, auth.verPerfil);
router.post('/pedidos', verificarUsuario, pedidos.crearPedido);   // protegida
router.get('/mis-pedidos', verificarUsuario, pedidos.verMisPedidos);
router.get('/admin/pedidos', verificarUsuario, verificarAdmin, pedidos.verPedidosAdmin);
router.get('/admin/productos', verificarUsuario, verificarAdmin, productos.verProductos);

module.exports = router;
