import { validationResult } from 'express-validator';
import User from '../models/User.js';
import generateJwt from '../helpers/generateJwt.js';
import {
  generateEmailVerificationToken,
  generatePasswordResetToken,
} from '../helpers/tokenGenerator.js';
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
} from '../helpers/emailService.js';

const EMAIL_VERIFICATION_EXPIRY_MS =
  (parseInt(process.env.VERIFICATION_EMAIL_EXPIRY_HOURS, 10) || 24) *
  60 *
  60 *
  1000;

const PASSWORD_RESET_EXPIRY_MS =
  (parseInt(process.env.PASSWORD_RESET_EXPIRY_HOURS, 10) || 1) * 60 * 60 * 1000;

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

    // Generar token de verificación de email
    const verificationToken = generateEmailVerificationToken();
    const verificationTokenExpiry = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY_MS);

    // Crear el nuevo usuario (la contraseña se cifra automáticamente en el pre-save)
    // El usuario queda inactivo hasta que verifique su correo electrónico.
    const nuevoUsuario = new User({
      nombre,
      email,
      password,
      activo: false,
      emailVerificado: false,
      tokenVerificacionEmail: verificationToken,
      tokenVerificacionEmailExpira: verificationTokenExpiry,
    });

    await nuevoUsuario.save();

    // Enviar email de verificación en background, sin bloquear la respuesta
    Promise.resolve()
      .then(() => sendVerificationEmail(nuevoUsuario.email, nuevoUsuario.nombre, verificationToken))
      .catch((err) =>
        console.error('[auth-service] Error enviando email de verificación:', err.message)
      );

    return res.status(201).json({
      success: true,
      message:
        'Usuario registrado exitosamente. Por favor, verifica tu correo electrónico para activar la cuenta.',
      emailVerificationRequired: true,
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

    const passwordValida = await usuario.compararPassword(password);

    if (!passwordValida) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas.',
      });
    }

    // Verificar que el email haya sido verificado antes de permitir el inicio de sesión.
    // Excepción: los usuarios creados por defecto (seeds) pueden iniciar sesión sin verificar.
    if (!usuario.emailVerificado && !usuario.esUsuarioPorDefecto) {
      return res.status(403).json({
        success: false,
        message:
          'Debes verificar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada o solicita un nuevo enlace de verificación.',
        emailVerificationRequired: true,
      });
    }

    if (!usuario.activo) {
      return res.status(403).json({
        success: false,
        message: 'La cuenta se encuentra desactivada. Contacta al administrador.',
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
 * @route   POST /auth/verify-email
 * @desc    Verifica el correo electrónico de un usuario a partir de un token
 * @access  Público
 */
export const verifyEmail = async (req, res) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos.',
        errores: errores.array(),
      });
    }

    const { token } = req.body;

    const usuario = await User.findOne({
      tokenVerificacionEmail: token,
      tokenVerificacionEmailExpira: { $gt: new Date() },
    });

    if (!usuario) {
      return res.status(400).json({
        success: false,
        message: 'El token de verificación es inválido o ha expirado.',
      });
    }

    if (usuario.emailVerificado) {
      return res.status(400).json({
        success: false,
        message: 'Este correo electrónico ya ha sido verificado.',
      });
    }

    usuario.emailVerificado = true;
    usuario.activo = true;
    usuario.tokenVerificacionEmail = null;
    usuario.tokenVerificacionEmailExpira = null;
    await usuario.save();

    // Enviar email de bienvenida en background
    Promise.resolve()
      .then(() => sendWelcomeEmail(usuario.email, usuario.nombre))
      .catch((err) =>
        console.error('[auth-service] Error enviando email de bienvenida:', err.message)
      );

    return res.status(200).json({
      success: true,
      message: 'Correo electrónico verificado exitosamente. Ya puedes iniciar sesión.',
      usuario: usuario.toPublicJSON(),
    });
  } catch (error) {
    console.error('Error en verifyEmail:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al verificar el correo electrónico.',
    });
  }
};

/**
 * @route   POST /auth/resend-verification
 * @desc    Reenvía el correo de verificación de cuenta
 * @access  Público
 */
export const resendVerification = async (req, res) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos.',
        errores: errores.array(),
      });
    }

    const { email } = req.body;

    const usuario = await User.findOne({ email: email.toLowerCase() });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'No existe un usuario registrado con ese correo electrónico.',
      });
    }

    if (usuario.emailVerificado) {
      return res.status(400).json({
        success: false,
        message: 'Este correo electrónico ya ha sido verificado.',
      });
    }

    const verificationToken = generateEmailVerificationToken();
    const verificationTokenExpiry = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY_MS);

    usuario.tokenVerificacionEmail = verificationToken;
    usuario.tokenVerificacionEmailExpira = verificationTokenExpiry;
    await usuario.save();

    try {
      await sendVerificationEmail(usuario.email, usuario.nombre, verificationToken);
    } catch (emailError) {
      console.error('[auth-service] Error reenviando email de verificación:', emailError.message);
      return res.status(503).json({
        success: false,
        message: 'No se pudo enviar el correo de verificación. Intenta nuevamente más tarde.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Correo de verificación reenviado exitosamente.',
    });
  } catch (error) {
    console.error('Error en resendVerification:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al reenviar el correo de verificación.',
    });
  }
};

/**
 * @route   POST /auth/forgot-password
 * @desc    Inicia el flujo de recuperación de contraseña enviando un correo con un token
 * @access  Público
 */
export const forgotPassword = async (req, res) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos.',
        errores: errores.array(),
      });
    }

    const { email } = req.body;

    const usuario = await User.findOne({ email: email.toLowerCase() });

    // Por seguridad, siempre respondemos con éxito, exista o no el usuario
    const respuestaGenerica = {
      success: true,
      message: 'Si el correo electrónico existe, se ha enviado un enlace de recuperación.',
    };

    if (!usuario) {
      return res.status(200).json(respuestaGenerica);
    }

    const resetToken = generatePasswordResetToken();
    const resetTokenExpiry = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MS);

    usuario.tokenResetPassword = resetToken;
    usuario.tokenResetPasswordExpira = resetTokenExpiry;
    await usuario.save();

    // Enviar el correo en segundo plano; no bloquear la respuesta
    Promise.resolve()
      .then(() => sendPasswordResetEmail(usuario.email, usuario.nombre, resetToken))
      .catch((err) =>
        console.error('[auth-service] Error enviando email de reset de contraseña:', err.message)
      );

    return res.status(200).json(respuestaGenerica);
  } catch (error) {
    console.error('Error en forgotPassword:', error);
    // Por seguridad, no revelamos errores internos
    return res.status(200).json({
      success: true,
      message: 'Si el correo electrónico existe, se ha enviado un enlace de recuperación.',
    });
  }
};

/**
 * @route   POST /auth/reset-password
 * @desc    Restablece la contraseña de un usuario a partir de un token válido
 * @access  Público
 */
export const resetPassword = async (req, res) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos.',
        errores: errores.array(),
      });
    }

    const { token, newPassword } = req.body;

    const usuario = await User.findOne({
      tokenResetPassword: token,
      tokenResetPasswordExpira: { $gt: new Date() },
    }).select('+tokenResetPassword +tokenResetPasswordExpira');

    if (!usuario) {
      return res.status(400).json({
        success: false,
        message: 'El token de recuperación es inválido o ha expirado.',
      });
    }

    usuario.password = newPassword;
    usuario.tokenResetPassword = null;
    usuario.tokenResetPasswordExpira = null;
    await usuario.save();

    // Enviar email de confirmación en background
    Promise.resolve()
      .then(() => sendPasswordChangedEmail(usuario.email, usuario.nombre))
      .catch((err) =>
        console.error(
          '[auth-service] Error enviando email de confirmación de cambio de contraseña:',
          err.message
        )
      );

    return res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión.',
    });
  } catch (error) {
    console.error('Error en resetPassword:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al restablecer la contraseña.',
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
