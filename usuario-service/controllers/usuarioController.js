const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');

// Crear usuario
exports.crearUsuario = async (req, res) => {
  try {
    const { nombre, email, contraseña, telefono } = req.body;

    // Validar que no exista usuario con ese email
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ success: false, error: 'El email ya está registrado' });
    }

    // Hashear la contraseña antes de guardar
    const hashedPassword = await bcrypt.hash(contraseña, 12);

    const nuevoUsuario = new Usuario({
      nombre,
      email,
      contraseña: hashedPassword,
      telefono,
    });

    const usuarioGuardado = await nuevoUsuario.save();
    
    // No retornar la contraseña hasheada
    const usuarioResponse = usuarioGuardado.toObject();
    delete usuarioResponse.contraseña;
    
    res.status(201).json({ success: true, data: usuarioResponse });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Obtener todos los usuarios
exports.obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find({});
    // No retornar contraseñas
    const usuariosResponse = usuarios.map(u => {
      const obj = u.toObject();
      delete obj.contraseña;
      return obj;
    });
    res.json({ success: true, data: usuariosResponse });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Obtener usuario por ID
exports.obtenerUsuarioById = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }
    const usuarioResponse = usuario.toObject();
    delete usuarioResponse.contraseña;
    res.json({ success: true, data: usuarioResponse });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
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
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    const usuarioResponse = usuarioActualizado.toObject();
    delete usuarioResponse.contraseña;
    res.json({ success: true, data: usuarioResponse });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Eliminar usuario
exports.eliminarUsuario = async (req, res) => {
  try {
    const usuarioEliminado = await Usuario.findByIdAndDelete(req.params.id);

    if (!usuarioEliminado) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    res.json({ success: true, mensaje: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
