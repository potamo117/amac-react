import CampoFormulario from '../components/CampoFormulario.jsx'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, supabaseConfigurado } from '../lib/supabase.js'

export default function RegistroCandidato() {
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

    const formulario = evento.currentTarget
    const datos = new FormData(formulario)

    const nombre = datos.get('nombre').trim()
    const telefono = datos.get('telefono').trim()
    const colonia = datos.get('colonia').trim()
    const experiencia = datos.get('experiencia').trim()

    if (!nombre || !telefono || !colonia || !experiencia) {
      setError('Completa los campos sin dejarlos solo con espacios.')
      return
    }

    setEnviando(true)

    try {
      const { data, error: errorRegistro } = await supabase.auth.signUp({
        email: datos.get('correo').trim(),
        password: datos.get('password'),
        options: {
          data: {
            rol: 'candidato',
            nombre,
            telefono,
            edad: Number(datos.get('edad')),
            colonia,
            experiencia
          }
        }
      })

      if (errorRegistro) throw errorRegistro

      setMensaje(
        data.session
          ? 'Cuenta creada. Tu registro está pendiente de aprobación por AMAC.'
          : 'Revisa tu correo para confirmar la cuenta antes de iniciar sesión.'
      )

      formulario.reset()
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
      <h1>Crear cuenta de candidato</h1>
      <p>Completa tus datos para registrarte en AMAC.</p>

      <form onSubmit={registrar}>
        <fieldset disabled={enviando}>
          <legend>Datos personales</legend>

          <CampoFormulario
              etiqueta="Nombre completo"
              id="nombre"
              name="nombre"
              type="text"
              autoComplete="name"
              required
            />

          <CampoFormulario
              etiqueta="Teléfono"
              id="telefono"
              name="telefono"
              type="tel"
              autoComplete="tel"
              required
            />

          <CampoFormulario
              etiqueta="Edad"
              id="edad"
              name="edad"
              type="number"
              min="18"
              max="120"
              step="1"
              required
            />

          <CampoFormulario
              etiqueta="Colonia"
              id="colonia"
              name="colonia"
              type="text"
              required
            />

          <CampoFormulario
              etiqueta="Experiencia laboral"
              id="experiencia"
              name="experiencia"
              rows="4"
              required
              multilinea
            />
        </fieldset>

        <fieldset disabled={enviando}>
          <legend>Datos de acceso</legend>

          <CampoFormulario
              etiqueta="Correo electrónico"
              id="correo"
              name="correo"
              type="email"
              autoComplete="email"
              required
            />

          <CampoFormulario
              etiqueta="Contraseña"
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength="8"
              required
              ayuda="Usa al menos 8 caracteres."
            />

          <div className="campo-formulario">
            <label htmlFor="terminos">
              <input
                id="terminos"
                name="terminos"
                type="checkbox"
                required
              />
              {' '}Acepto los términos y condiciones de AMAC.
            </label>
          </div>
        </fieldset>

        {error && <p role="alert">{error}</p>}
        <p role="status">{mensaje}</p>

        <button
          className="boton boton--primario"
          type="submit"
          disabled={enviando || Boolean(mensaje)}
        >
          {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>

      <Link to="/login">Ya tengo cuenta: iniciar sesión</Link>
    </section>
  )
}