const Pedido = require('../models/Pedido');
const axios = require('axios');

const USUARIO_SERVICE_URL = process.env.USUARIO_SERVICE_URL || 'http://localhost:3001';

// Crear pedido (verifica que el usuario exista)
exports.crearPedido = async (req, res) => {
  try {
    const { usuarioId, productos, direccion } = req.body;

    // Verificar que el usuario existe llamando al servicio de usuarios
    try {
      const respuestaUsuario = await axios.get(`${USUARIO_SERVICE_URL}/api/usuarios/${usuarioId}`);
      if (!respuestaUsuario.data) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
    } catch (error) {
      return res.status(404).json({ error: 'Usuario no encontrado o servicio de usuarios no disponible' });
    }

    // Calcular total
    const total = productos.reduce((sum, prod) => sum + (prod.cantidad * prod.precio), 0);

    const nuevoPedido = new Pedido({
      usuarioId,
      productos,
      total,
      direccion,
    });

    const pedidoGuardado = await nuevoPedido.save();
    res.status(201).json(pedidoGuardado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los pedidos
exports.obtenerPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.find({});
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener pedidos por usuario
exports.obtenerPedidosPorUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;

    // Verificar que el usuario existe
    try {
      await axios.get(`${USUARIO_SERVICE_URL}/api/usuarios/${usuarioId}`);
    } catch (error) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const pedidos = await Pedido.find({ usuarioId });
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener pedido por ID
exports.obtenerPedidoById = async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id);
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    res.json(pedido);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar estado del pedido
exports.actualizarEstadoPedido = async (req, res) => {
  try {
    const { estado } = req.body;
    
    const pedidoActualizado = await Pedido.findByIdAndUpdate(
      req.params.id,
      { estado, updatedAt: new Date() },
      { new: true }
    );

    if (!pedidoActualizado) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    res.json(pedidoActualizado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar pedido
exports.eliminarPedido = async (req, res) => {
  try {
    const pedidoEliminado = await Pedido.findByIdAndDelete(req.params.id);

    if (!pedidoEliminado) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    res.json({ mensaje: 'Pedido eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
