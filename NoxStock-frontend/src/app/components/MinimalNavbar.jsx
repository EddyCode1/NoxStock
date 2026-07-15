import { useNavigate } from 'react-router-dom'

/**
 * Navbar minimalista - Solo botón de regreso
 */
const MinimalNavbar = () => {
  const navigate = useNavigate()

  return (
    <header className="border-b border-[#1e3a6d] py-3 px-6 bg-[#0b0e14]">
      <button
        type="button"
        onClick={() => navigate('/loby')}
        className="inline-flex items-center justify-center w-12 h-12 rounded-lg border-2 border-[#4b5563] bg-[#0f1c3f] text-gray-300 hover:bg-[#1e3a6d] hover:border-gray-300 hover:text-white transition-all duration-300 font-bold text-lg"
        aria-label="Volver al menú principal"
        title="Volver"
      >
        ⟨
      </button>
    </header>
  )
}

export default MinimalNavbar
