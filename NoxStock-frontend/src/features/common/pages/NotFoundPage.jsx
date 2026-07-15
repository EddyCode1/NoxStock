import { useNavigate } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Página No Encontrada</h2>
        <p className="text-gray-600 mb-6">La página que buscas no existe.</p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaArrowLeft size={18} />
          Ir al Inicio
        </button>
      </div>
    </div>
  )
}
