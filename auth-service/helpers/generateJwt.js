import jwt from 'jsonwebtoken';

/**
 * Genera un JSON Web Token (JWT) firmado para el usuario indicado.
 *
 * @param {Object} payload - Datos a incluir en el token (por ejemplo { id, email, role }).
 * @returns {String} Token JWT firmado.
 */
export const generateJwt = (payload) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRE || '24h';

  if (!secret) {
    throw new Error('JWT_SECRET no está definido en las variables de entorno');
  }

  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Verifica y decodifica un JWT.
 *
 * @param {String} token - Token JWT a verificar.
 * @returns {Object} Payload decodificado.
 */
export const verifyJwt = (token) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET no está definido en las variables de entorno');
  }

  return jwt.verify(token, secret);
};

export default generateJwt;
