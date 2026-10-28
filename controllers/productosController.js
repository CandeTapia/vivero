// CONTROLLER DE PRODUCTOS
const model = require('../models/productosModel');

async function verCategorias(req, res) {
  try {
    const categorias = await model.obtenerCategorias();
    res.status(200).json(categorias);
  } catch (error) {
    res.status(500).send('Error al obtener las categorias');
  }
}

// GET /productos  o  GET /productos?categoria=2
async function verProductos(req, res) {
  const categoriaId = req.query.categoria ? Number(req.query.categoria) : null;
  const busqueda = typeof req.query.buscar === 'string' ? req.query.buscar.trim().slice(0, 100) : '';
  try {
    const productos = await model.obtenerProductos(categoriaId, busqueda);
    res.status(200).json(productos);
  } catch (error) {
    if (error.status) return res.status(error.status).send(error.message);
    res.status(500).send('Error al obtener los productos');
  }
}

async function verProducto(req, res) {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).send('ID de producto inválido');
  try {
    const producto = await model.obtenerProducto(id);
    if (!producto) return res.status(404).send('Producto no encontrado');
    res.status(200).json(producto);
  } catch (error) {
    res.status(500).send('Error al obtener el producto');
  }
}

module.exports = { verCategorias, verProductos, verProducto };
