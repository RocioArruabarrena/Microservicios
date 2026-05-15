const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');

// Crear usuario
exports.crearUsuario = async (req, res) => {
  try {
    const { nombre, email, contraseña, telefono } = req.body;

    // Validar que no exista usuario con ese email
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const nuevoUsuario = new Usuario({
      nombre,
      email,
      contraseña,
      telefono,
    });

    const usuarioGuardado = await nuevoUsuario.save();
    res.status(201).json(usuarioGuardado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los usuarios
exports.obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find({});
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener usuario por ID
exports.obtenerUsuarioById = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar usuario
exports.actualizarUsuario = async (req, res) => {
  try {
    const { nombre, email, telefono, activo } = req.body;
    
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      req.params.id,
      { nombre, email, telefono, activo },
      { new: true }
    );

    if (!usuarioActualizado) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(usuarioActualizado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar usuario
exports.eliminarUsuario = async (req, res) => {
  try {
    const usuarioEliminado = await Usuario.findByIdAndDelete(req.params.id);

    if (!usuarioEliminado) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
