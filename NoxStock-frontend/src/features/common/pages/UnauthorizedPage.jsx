import { useNavigate } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'

export default function UnauthorizedPage() {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-600 mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Acceso Denegado</h2>
        <p className="text-gray-600 mb-6">No tienes permiso para acceder a este recurso.</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <FaArrowLeft size={18} />
          Volver Atrás
        </button>
      </div>
    </div>
  )
}
