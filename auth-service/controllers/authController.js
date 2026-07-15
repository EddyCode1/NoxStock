import { validationResult } from 'express-validator';
import User from '../models/User.js';
import generateJwt from '../helpers/generateJwt.js';

/**
 * @route   POST /auth/register
 * @desc    Registrar un nuevo usuario
 * @access  Público
 */
export const register = async (req, res) => {
  try {
    // Validar errores de express-validator
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos.',
        errores: errores.array(),
      });
    }

    const { nombre, email, password } = req.body;

    // Verificar si el usuario ya existe
    const usuarioExistente = await User.findOne({ email: email.toLowerCase() });
    if (usuarioExistente) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un usuario registrado con ese correo electrónico.',
      });
    }

    // Crear el nuevo usuario (la contraseña se cifra automáticamente en el pre-save)
    const nuevoUsuario = new User({
      nombre,
      email,
      password,
    });

    await nuevoUsuario.save();

    // Generar el token JWT
    const token = generateJwt({
      id: nuevoUsuario._id,
      email: nuevoUsuario.email,
      role: nuevoUsuario.role,
    });

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente.',
      token,
      usuario: nuevoUsuario.toPublicJSON(),
    });
  } catch (error) {
    console.error('Error en register:', error);

    // Manejo de error de duplicado de Mongo (por si hay condición de carrera)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un usuario registrado con ese correo electrónico.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al registrar el usuario.',
    });
  }
};

/**
 * @route   POST /auth/login
 * @desc    Iniciar sesión y obtener un JWT válido
 * @access  Público
 */
export const login = async (req, res) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos.',
        errores: errores.array(),
      });
    }

    const { email, password } = req.body;

    // Buscar usuario incluyendo el password (que por defecto está oculto con select:false)
    const usuario = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas.',
      });
    }

    if (!usuario.activo) {
      return res.status(403).json({
        success: false,
        message: 'La cuenta se encuentra desactivada. Contacta al administrador.',
      });
    }

    const passwordValida = await usuario.compararPassword(password);

    if (!passwordValida) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas.',
      });
    }

    const token = generateJwt({
      id: usuario._id,
      email: usuario.email,
      role: usuario.role,
    });

    return res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso.',
      token,
      usuario: usuario.toPublicJSON(),
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al iniciar sesión.',
    });
  }
};

/**
 * @route   GET /auth/perfil
 * @desc    Obtener el perfil del usuario autenticado
 * @access  Privado (requiere JWT)
 */
export const perfil = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      usuario: req.usuario.toPublicJSON(),
    });
  } catch (error) {
    console.error('Error en perfil:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener el perfil.',
    });
  }
};
