import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { authService } from '../../../shared/api/services/authService'

/**
 * Página de Recuperación de Contraseña (paso 1: solicitar el enlace)
 */
const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [responseMessage, setResponseMessage] = useState('')
  const { register, handleSubmit, formState: { errors } } = useForm()
  const fieldClass = 'w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-300'

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const res = await authService.forgotPassword(data.email)
      setResponseMessage(
        res.message || 'Si el correo electrónico existe, se ha enviado un enlace de recuperación.'
      )
      setSubmitted(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-zinc-300/60 bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.14)] backdrop-blur-sm">
      <div className="mb-7">
        <span className="inline-flex rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-700">
          Recuperar acceso
        </span>
        <h1 className="mt-4 text-3xl font-bold text-zinc-900">¿Olvidaste tu contraseña?</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>
      </div>

      {submitted ? (
        <div className="text-center">
          <p className="text-green-700 font-medium">{responseMessage}</p>
          <Link
            to="/login"
            className="mt-6 inline-block w-full rounded-xl bg-zinc-900 py-2.5 font-semibold text-white transition hover:bg-black"
          >
            Volver a iniciar sesión
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-700">Correo electrónico</label>
            <input
              type="email"
              placeholder="tu@email.com"
              {...register('email', { required: 'Email requerido' })}
              className={fieldClass}
            />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full rounded-xl bg-zinc-900 py-2.5 font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-zinc-500 disabled:text-zinc-200"
          >
            {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
          </button>
        </form>
      )}

      <p className="mt-5 text-center text-sm text-zinc-600">
        <Link to="/login" className="font-semibold text-zinc-900 transition hover:text-zinc-700 hover:underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </section>
  )
}

export default ForgotPasswordPage
