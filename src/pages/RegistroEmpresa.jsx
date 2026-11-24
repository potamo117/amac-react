import CampoFormulario from '../components/CampoFormulario.jsx'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase, supabaseConfigurado } from '../lib/supabase.js'

export default function RegistroEmpresa() {
  const navigate = useNavigate()

  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  async function registrar(evento) {
    evento.preventDefault()
    if (enviando) return

    setError('')
    setMensaje('')

    if (!supabaseConfigurado) {
      setError('Falta configurar la conexión con Supabase.')
      return
    }

    const datos = new FormData(evento.currentTarget)

    const nombre = datos.get('nombre').trim()
    const giro = datos.get('giro').trim()
    const telefono = datos.get('telefono').trim()
    const correo = datos.get('correo').trim()

    if (!nombre || !giro || !telefono) {
      setError('Completa los campos sin dejarlos solo con espacios.')
      return
    }

    setEnviando(true)

    try {
      const { data, error: errorRegistro } = await supabase.auth.signUp({
        email: correo,
        password: datos.get('password'),
        options: {
          data: {
            rol: 'empresa',
            nombre,
            giro,
            telefono
          }
        }
      })

      if (errorRegistro) throw errorRegistro

      if (data.session) {
        navigate('/empresa/vacantes', { replace: true })
      } else {
        setMensaje(
          'Revisa tu correo para confirmar la cuenta antes de iniciar sesión.'
        )
      }
    } catch {
      setError(
        'No pudimos completar el registro. Revisa tus datos y la conexión. Si ya tienes cuenta, intenta iniciar sesión.'
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="acceso">
      <h1>Registro de empresa</h1>
      <p>Crea una cuenta para publicar vacantes en AMAC.</p>

      <form onSubmit={registrar}>
        <fieldset disabled={enviando}>
          <legend>Datos de la empresa</legend>

          <CampoFormulario
              etiqueta="Nombre de la empresa"
              id="empresa-nombre"
              name="nombre"
              type="text"
              autoComplete="organization"
              required
            />

          <CampoFormulario
              etiqueta="Giro"
              id="empresa-giro"
              name="giro"
              type="text"
              required
            />

          <CampoFormulario
              etiqueta="Teléfono"
              id="empresa-telefono"
              name="telefono"
              type="tel"
              autoComplete="tel"
              required
            />
        </fieldset>

        <fieldset disabled={enviando}>
          <legend>Datos de acceso</legend>

          <CampoFormulario
              etiqueta="Correo electrónico"
              id="empresa-correo"
              name="correo"
              type="email"
              autoComplete="email"
              required
            />

          <CampoFormulario
              etiqueta="Contraseña"
              id="empresa-password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength="8"
              required
              ayuda="Usa al menos 8 caracteres."
            />
        </fieldset>

        {error && <p role="alert">{error}</p>}
        <p role="status">{mensaje}</p>

        <button
          className="boton boton--primario"
          type="submit"
          disabled={enviando || Boolean(mensaje)}
        >
          {enviando ? 'Creando cuenta…' : 'Crear cuenta de empresa'}
        </button>
      </form>

      <Link to="/login">Ya tengo cuenta: iniciar sesión</Link>
    </section>
  )
}