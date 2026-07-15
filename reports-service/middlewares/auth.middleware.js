import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function authenticateJwt(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Token JWT no proporcionado o formato inválido',
        });
    }

    const token = authHeader.slice(7).trim();

    try {
        const decoded = jwt.verify(token, env.jwtSecret);

        if (decoded?.blocked === true || decoded?.status === 'inactive') {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para acceder a este recurso',
            });
        }

        req.user = decoded;
        return next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token JWT inválido o expirado',
        });
    }
}

export function requireRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!allowedRoles.length) {
            return next();
        }

        const userRoles = req.user?.roles ?? req.user?.role ?? [];
        const normalizedRoles = Array.isArray(userRoles) ? userRoles : [userRoles];
        const hasAccess = normalizedRoles.some((role) => allowedRoles.includes(role));

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: 'No cuentas con permisos para ejecutar esta operación',
            });
        }

        return next();
    };
}