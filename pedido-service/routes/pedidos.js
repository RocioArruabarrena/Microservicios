const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');

/**
 * @swagger
 * /api/pedidos:
 *   post:
 *     summary: Crear un nuevo pedido
 *     tags: [Pedidos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usuarioId:
 *                 type: string
 *               productos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     nombre:
 *                       type: string
 *                     cantidad:
 *                       type: number
 *                     precio:
 *                       type: number
 *               direccion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pedido creado exitosamente
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.post('/', pedidoController.crearPedido);

/**
 * @swagger
 * /api/pedidos:
 *   get:
 *     summary: Obtener todos los pedidos
 *     tags: [Pedidos]
 *     responses:
 *       200:
 *         description: Lista de pedidos
 *       500:
 *         description: Error del servidor
 */
router.get('/', pedidoController.obtenerPedidos);

/**
 * @swagger
 * /api/pedidos/{id}:
 *   get:
 *     summary: Obtener pedido por ID
 *     tags: [Pedidos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pedido encontrado
 *       404:
 *         description: Pedido no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', pedidoController.obtenerPedidoById);

/**
 * @swagger
 * /api/pedidos/usuario/{usuarioId}:
 *   get:
 *     summary: Obtener pedidos de un usuario
 *     tags: [Pedidos]
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pedidos del usuario
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/usuario/:usuarioId', pedidoController.obtenerPedidosPorUsuario);

/**
 * @swagger
 * /api/pedidos/{id}:
 *   put:
 *     summary: Actualizar estado del pedido
 *     tags: [Pedidos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [pendiente, procesando, enviado, entregado, cancelado]
 *     responses:
 *       200:
 *         description: Pedido actualizado
 *       404:
 *         description: Pedido no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', pedidoController.actualizarEstadoPedido);

/**
 * @swagger
 * /api/pedidos/{id}:
 *   delete:
 *     summary: Eliminar pedido
 *     tags: [Pedidos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pedido eliminado
 *       404:
 *         description: Pedido no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', pedidoController.eliminarPedido);

module.exports = router;
