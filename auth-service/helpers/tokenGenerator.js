import crypto from 'crypto';

/**
 * Genera un token seguro (URL-safe, sin caracteres especiales)
 * Basado en el generador de tokens utilizado en KinalSports (auth-node).
 *
 * @param {number} length - Cantidad de bytes aleatorios a generar (default 32 = 256 bits)
 * @returns {string} Token seguro en base64 URL-safe
 */
export const generateSecureToken = (length = 32) => {
  const bytes = crypto.randomBytes(length);
  return bytes
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

export const generateEmailVerificationToken = () => generateSecureToken(32);

export const generatePasswordResetToken = () => generateSecureToken(32);

export default {
  generateSecureToken,
  generateEmailVerificationToken,
  generatePasswordResetToken,
};
