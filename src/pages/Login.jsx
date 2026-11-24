import CampoFormulario from '../components/CampoFormulario.jsx'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase, supabaseConfigurado } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  const { sesion, perfil } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!sesion || !perfil) return

    const destino =
      perfil.rol === 'empresa' ? '/empresa/vacantes' : '/'

    navigate(destino, { replace: true })
  }, [sesion, perfil, navigate])

  async function iniciarSesion(evento) {
    evento.preventDefault()
    if (enviando) return

    setError('')

    if (!supabaseConfigurado) {
      setError('Falta configurar la conexión con Supabase.')
      return
    }

    const datos = new FormData(evento.currentTarget)
    setEnviando(true)

    try {
      const { error: errorLogin } =
        await supabase.auth.signInWithPassword({
          email: datos.get('correo').trim(),
          password: datos.get('password')
        })

      if (errorLogin) throw errorLogin
    } catch {
      setError('Correo o contraseña incorrectos.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="acceso">
      <h1>Iniciar sesión</h1>
      <p>Escribe el correo y la contraseña de tu cuenta.</p>

      <form onSubmit={iniciarSesion}>
        <fieldset disabled={enviando}>
          <legend>Datos de acceso</legend>

          <CampoFormulario
              etiqueta="Correo electrónico"
              id="correo"
              name="correo"
              type="email"
              autoComplete="username"
              required
            />

          <CampoFormulario
              etiqueta="Contraseña"
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
        </fieldset>

        {error && <p role="alert">{error}</p>}

        <button
          className="boton boton--primario"
          type="submit"
          disabled={enviando}
        >
          {enviando ? 'Iniciando sesión…' : 'Iniciar sesión'}
        </button>
      </form>

      <Link to="/registro">No tengo cuenta: registrarme</Link>
    </section>
  )
}