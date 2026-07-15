import nodemailer from 'nodemailer';

/**
 * Servicio de envío de correos electrónicos para NoxStock.
 * Réplica adaptada del flujo implementado en KinalSports (auth-node/helpers/email-service.js).
 */

const createTransporter = () => {
  const user = process.env.SMTP_USERNAME;
  const pass = process.env.SMTP_PASSWORD;

  if (!user || !pass) {
    console.warn(
      '[auth-service] Credenciales SMTP no configuradas. El envío de correos no funcionará.'
    );
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_ENABLE_SSL === 'true', // true para 465, false para 587
    auth: { user, pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 10_000,
    tls: {
      rejectUnauthorized: false,
    },
  });
};

let transporter = createTransporter();

const getFrom = () => {
  const fromName = process.env.EMAIL_FROM_NAME || 'NoxStock';
  const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USERNAME;
  return `${fromName} <${fromEmail}>`;
};

const getFrontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:5173';

export const sendVerificationEmail = async (email, nombre, verificationToken) => {
  if (!transporter) {
    transporter = createTransporter();
    if (!transporter) throw new Error('SMTP transporter no configurado');
  }

  const verificationUrl = `${getFrontendUrl()}/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: getFrom(),
    to: email,
    subject: 'Verifica tu correo electrónico - NoxStock',
    html: `
      <h2>¡Bienvenido a NoxStock, ${nombre}!</h2>
      <p>Por favor, verifica tu correo electrónico para activar tu cuenta haciendo clic en el siguiente enlace:</p>
      <a href='${verificationUrl}' style='background-color: #111111; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>
          Verificar correo
      </a>
      <p>Si no puedes hacer clic en el enlace, copia y pega esta URL en tu navegador:</p>
      <p>${verificationUrl}</p>
      <p>Este enlace expirará en 24 horas.</p>
      <p>Si no creaste una cuenta, ignora este correo.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendPasswordResetEmail = async (email, nombre, resetToken) => {
  if (!transporter) {
    transporter = createTransporter();
    if (!transporter) throw new Error('SMTP transporter no configurado');
  }

  const resetUrl = `${getFrontendUrl()}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: getFrom(),
    to: email,
    subject: 'Restablece tu contraseña - NoxStock',
    html: `
      <h2>Solicitud de restablecimiento de contraseña</h2>
      <p>Hola ${nombre},</p>
      <p>Solicitaste restablecer tu contraseña en NoxStock. Haz clic en el siguiente enlace para continuar:</p>
      <a href='${resetUrl}' style='background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>
          Restablecer contraseña
      </a>
      <p>Si no puedes hacer clic en el enlace, copia y pega esta URL en tu navegador:</p>
      <p>${resetUrl}</p>
      <p>Este enlace expirará en 1 hora.</p>
      <p>Si no solicitaste esto, ignora este correo y tu contraseña permanecerá sin cambios.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendWelcomeEmail = async (email, nombre) => {
  if (!transporter) {
    transporter = createTransporter();
    if (!transporter) throw new Error('SMTP transporter no configurado');
  }

  const mailOptions = {
    from: getFrom(),
    to: email,
    subject: '¡Bienvenido a NoxStock!',
    html: `
      <h2>¡Bienvenido a NoxStock, ${nombre}!</h2>
      <p>Tu cuenta ha sido verificada y activada exitosamente.</p>
      <p>Ahora puedes disfrutar de todas las funciones de nuestra plataforma.</p>
      <p>Si tienes alguna pregunta, no dudes en contactar a nuestro equipo de soporte.</p>
      <p>¡Gracias por unirte a nosotros!</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendPasswordChangedEmail = async (email, nombre) => {
  if (!transporter) {
    transporter = createTransporter();
    if (!transporter) throw new Error('SMTP transporter no configurado');
  }

  const mailOptions = {
    from: getFrom(),
    to: email,
    subject: 'Contraseña actualizada - NoxStock',
    html: `
      <h2>Contraseña actualizada</h2>
      <p>Hola ${nombre},</p>
      <p>Tu contraseña ha sido actualizada exitosamente.</p>
      <p>Si no realizaste este cambio, por favor contacta a nuestro equipo de soporte inmediatamente.</p>
      <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export default {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendPasswordChangedEmail,
};
