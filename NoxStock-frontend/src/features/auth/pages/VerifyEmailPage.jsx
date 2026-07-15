import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { authService } from '../../../shared/api/services/authService'

const STATUS = {
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
}

/**
 * Página de Verificación de Correo Electrónico.
 * Lee el token de los query params (?token=...) y lo valida contra el backend.
 */
const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState(STATUS.LOADING)
  const [message, setMessage] = useState('Verificando tu correo electrónico...')

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      setStatus(STATUS.ERROR)
      setMessage('El enlace de verificación no es válido. Falta el token.')
      return
    }

    const verify = async () => {
      const res = await authService.verifyEmail(token)
      if (res.success) {
        setStatus(STATUS.SUCCESS)
        setMessage(res.message || 'Correo electrónico verificado exitosamente.')
      } else {
        setStatus(STATUS.ERROR)
        setMessage(res.error || 'El enlace de verificación es inválido o ha expirado.')
      }
    }

    verify()
  }, [searchParams])

  return (
    <section className="relative overflow-hidden rounded-3xl border border-zinc-300/60 bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.14)] backdrop-blur-sm text-center">
      <h1 className="mt-2 text-2xl font-bold text-zinc-900">Verificación de correo electrónico</h1>

      <div className="mt-6">
        {status === STATUS.LOADING && (
          <p className="text-zinc-600">{message}</p>
        )}

        {status === STATUS.SUCCESS && (
          <>
            <p className="text-green-700 font-medium">{message}</p>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="mt-6 w-full rounded-xl bg-zinc-900 py-2.5 font-semibold text-white transition hover:bg-black"
            >
              Ir a iniciar sesión
            </button>
          </>
        )}

        {status === STATUS.ERROR && (
          <>
            <p className="text-red-600 font-medium">{message}</p>
            <p className="mt-4 text-sm text-zinc-600">
              Si tu enlace expiró, puedes solicitar uno nuevo desde la pantalla de inicio de sesión.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-block w-full rounded-xl bg-zinc-900 py-2.5 font-semibold text-white transition hover:bg-black"
            >
              Volver a iniciar sesión
            </Link>
          </>
        )}
      </div>
    </section>
  )
}

export default VerifyEmailPage
