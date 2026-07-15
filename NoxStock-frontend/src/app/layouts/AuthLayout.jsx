import backgroundImage from '../../shared/assets/img/fondo_logon.avif'

const AuthLayout = ({ children }) => {
  return (
    <div
      className="auth-layout relative flex min-h-screen w-full items-center justify-center overflow-hidden"
    >
      <div
        className="absolute inset-0 lobby-bg-motion pointer-events-none"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      <div className="relative z-10 w-full max-w-xs sm:max-w-sm px-4 py-8">{children}</div>
    </div>
  )
}

export default AuthLayout
