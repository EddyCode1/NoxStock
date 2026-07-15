import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import useAuthStore from '../../../shared/stores/useAuthStore'
import { authService } from '../../../shared/api/services/authService'
import '../LoginPage.css'

/**
 * Página de Login
 */
const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [emailNotVerified, setEmailNotVerified] = useState(false)
  const { register, handleSubmit, getValues, formState: { errors } } = useForm()
  const { login } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.state?.infoMessage) {
      toast.success(location.state.infoMessage)
      // Limpiar el state para que no se vuelva a mostrar al navegar
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  const onSubmit = async (data) => {
    setIsLoading(true)
    setEmailNotVerified(false)
    try {
      const result = await authService.login(data.email, data.password)

      if (result.success) {
        login(result.token, result.user, result.refreshToken)
        toast.success('Sesión iniciada correctamente')
        navigate('/loby')
      } else if (result.error) {
        // Detectar el caso de email no verificado para ofrecer reenvío
        const message = result.error || ''
        if (message.toLowerCase().includes('verificar tu correo')) {
          setEmailNotVerified(true)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    const email = getValues('email')
    if (!email) {
      toast.error('Ingresa tu correo electrónico primero')
      return
    }

    setIsResending(true)
    try {
      const res = await authService.resendVerification(email)
      if (res.success) {
        toast.success(res.message || 'Correo de verificación reenviado')
      } else {
        toast.error(res.error || 'No se pudo reenviar el correo de verificación')
      }
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="container">
      {/* Puntos animados alrededor del círculo */}
      {Array.from({ length: 50 }).map((_, i) => (
        <span key={i} style={{ '--i': i }} />
      ))}

      <div className="login-box">
        <h2>Omakase</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="input-box">
            <input
              type="email"
              placeholder=" "
              {...register('email', { required: 'Email requerido' })}
            />
            <label>Email</label>
            {errors.email && <p className="error-text">{errors.email.message}</p>}
          </div>

          <div className="input-box">
            <input
              type="password"
              placeholder=" "
              {...register('password', { required: 'Contraseña requerida' })}
            />
            <label>Contraseña</label>
            {errors.password && <p className="error-text">{errors.password.message}</p>}
          </div>

          <div className="forgot-pass">
            <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
          </div>

          {emailNotVerified && (
            <div style={{ marginBottom: '12px', textAlign: 'center' }}>
              <p className="error-text" style={{ marginBottom: '6px' }}>
                Debes verificar tu correo electrónico antes de iniciar sesión.
              </p>
              <button
                type="button"
                className="btn"
                onClick={handleResendVerification}
                disabled={isResending}
                style={{ background: '#444' }}
              >
                {isResending ? 'Enviando...' : 'Reenviar correo de verificación'}
              </button>
            </div>
          )}

          <button className="btn" type="submit" disabled={isLoading}>
            {isLoading ? 'Cargando...' : 'Iniciar sesión'}
          </button>

          <div className="signup-link">
            <Link to="/register">Regístrate</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
