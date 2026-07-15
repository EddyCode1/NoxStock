import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { authService } from '../../../shared/api/services/authService'

/**
 * Página de Restablecimiento de Contraseña (paso 2: definir nueva contraseña)
 * Lee el token de los query params (?token=...)
 */
const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('newPassword')
  const token = searchParams.get('token')
  const fieldClass = 'w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-300'

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('El enlace de recuperación no es válido. Falta el token.')
      return
    }

    if (data.newPassword !== data.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    setIsLoading(true)
    try {
      const res = await authService.resetPassword(token, data.newPassword)
      if (res.success) {
        toast.success(res.message || 'Contraseña actualizada exitosamente.')
        navigate('/login')
      } else {
        toast.error(res.error || 'No se pudo restablecer la contraseña.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <section className="relative overflow-hidden rounded-3xl border border-zinc-300/60 bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.14)] backdrop-blur-sm text-center">
        <h1 className="text-2xl font-bold text-zinc-900">Enlace inválido</h1>
        <p className="mt-4 text-zinc-600">
          El enlace de recuperación no contiene un token válido. Solicita un nuevo enlace.
        </p>
        <Link
          to="/forgot-password"
          className="mt-6 inline-block w-full rounded-xl bg-zinc-900 py-2.5 font-semibold text-white transition hover:bg-black"
        >
          Solicitar nuevo enlace
        </Link>
      </section>
    )
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-zinc-300/60 bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.14)] backdrop-blur-sm">
      <div className="mb-7">
        <span className="inline-flex rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-700">
          Nueva contraseña
        </span>
        <h1 className="mt-4 text-3xl font-bold text-zinc-900">Restablece tu contraseña</h1>
        <p className="mt-2 text-sm text-zinc-600">Ingresa tu nueva contraseña para continuar.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-700">Nueva contraseña</label>
          <input
            type="password"
            placeholder="••••••••"
            {...register('newPassword', {
              required: 'La nueva contraseña es obligatoria',
              minLength: { value: 8, message: 'Debe tener al menos 8 caracteres' },
            })}
            className={fieldClass}
          />
          {errors.newPassword && <p className="text-sm text-red-600">{errors.newPassword.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-700">Confirmar contraseña</label>
          <input
            type="password"
            placeholder="••••••••"
            {...register('confirmPassword', {
              required: 'Confirmar contraseña',
              validate: (value) => value === password || 'Las contraseñas no coinciden',
            })}
            className={fieldClass}
          />
          {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 w-full rounded-xl bg-zinc-900 py-2.5 font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-zinc-500 disabled:text-zinc-200"
        >
          {isLoading ? 'Guardando...' : 'Restablecer contraseña'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-zinc-600">
        <Link to="/login" className="font-semibold text-zinc-900 transition hover:text-zinc-700 hover:underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </section>
  )
}

export default ResetPasswordPage
