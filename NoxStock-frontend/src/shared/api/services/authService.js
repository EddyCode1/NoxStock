import authClient from '../authClient'
import toast from 'react-hot-toast'
import { getAssignedRestaurantId } from '../../utils/roles'

export const authService = {
  login: async (email, password) => {
    try {
      const response = await authClient.post('/login', { email, password })
      // TEMP LOG: inspeccionar respuesta del backend en la consola del cliente
      console.debug('authService.login response.data:', response?.data)
      const data = response.data || {}
      
      // El auth-service retorna { success, message, token, usuario }
      const token = data.token
      const userDetails = data.usuario || {}

      if (!token) {
        throw new Error('El backend no devolvió un token de autenticación')
      }

      const userId = userDetails._id || userDetails.id || null

      const user = {
        id: userId,
        _id: userId,
        nombre: userDetails.nombre || '',
        email: userDetails.email || '',
        rol: userDetails.role || 'USER',
        activo: userDetails.activo !== false,
      }

      // TEMP LOG: inspeccionar usuario normalizado antes de devolverlo
      console.debug('authService.login normalized user:', user)

      return {
        success: true,
        token,
        refreshToken: data.refreshToken || null,
        user,
      }
    } catch (error) {
      console.error('Login error:', error)

      toast.error(
        error.response?.data?.message || error.message || 'Error al iniciar sesión'
      )
      return { success: false, error: error.response?.data?.message || error.message }
    }
  },

  register: async (userData) => {
    try {
      // El backend solo necesita nombre, email y password
      const response = await authClient.post('/register', {
        nombre: userData.nombre,
        email: userData.email,
        password: userData.password,
      })
      console.debug('authService.register response.data:', response?.data)
      const data = response.data || {}

      // El auth-service ya NO retorna token en el registro: el usuario debe
      // verificar su correo electrónico antes de poder iniciar sesión.
      const userDetails = data.usuario || {}

      const userId = userDetails._id || userDetails.id || null

      const user = {
        id: userId,
        _id: userId,
        nombre: userDetails.nombre || '',
        email: userDetails.email || '',
        rol: userDetails.role || 'USER',
        activo: userDetails.activo !== false,
      }

      toast.success(
        data.message ||
          'Cuenta creada exitosamente. Revisa tu correo electrónico para verificar tu cuenta.'
      )

      return {
        success: true,
        emailVerificationRequired: data.emailVerificationRequired === true,
        message: data.message,
        user,
      }
    } catch (error) {
      console.error('Register error:', error)
      toast.error(error.response?.data?.message || 'Error al registrar usuario')
      return { success: false, error: error.response?.data?.message || error.message }
    }
  },

  verifyEmail: async (token) => {
    try {
      const response = await authClient.post('/verify-email', { token })
      return { success: true, message: response.data?.message }
    } catch (error) {
      console.error('Verify email error:', error)
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Error al verificar el correo electrónico',
      }
    }
  },

  resendVerification: async (email) => {
    try {
      const response = await authClient.post('/resend-verification', { email })
      return { success: true, message: response.data?.message }
    } catch (error) {
      console.error('Resend verification error:', error)
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Error al reenviar el correo de verificación',
      }
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await authClient.post('/forgot-password', { email })
      return { success: true, message: response.data?.message }
    } catch (error) {
      console.error('Forgot password error:', error)
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Error al solicitar recuperación de contraseña',
      }
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      const response = await authClient.post('/reset-password', { token, newPassword })
      return { success: true, message: response.data?.message }
    } catch (error) {
      console.error('Reset password error:', error)
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Error al restablecer la contraseña',
      }
    }
  },

  getCurrentUser: async (token) => {
    try {
      const response = await authClient.get('/perfil', { headers: { Authorization: `Bearer ${token}` } })
      return { success: true, user: response.data.usuario }
    } catch (error) {
      return { success: false, error: 'Token inválido' }
    }
  },

  logout: () => {
    return { success: true }
  },
}
