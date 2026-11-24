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

          <div className="campo-formulario">
            <label htmlFor="nombre">Nombre completo</label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              autoComplete="name"
              required
            />
          </div>

          <div className="campo-formulario">
            <label htmlFor="telefono">Teléfono</label>
            <input
              id="telefono"
              name="telefono"
              type="tel"
              autoComplete="tel"
              required
            />
          </div>

          <div className="campo-formulario">
            <label htmlFor="edad">Edad</label>
            <input
              id="edad"
              name="edad"
              type="number"
              min="18"
              max="120"
              step="1"
              required
            />
          </div>

          <div className="campo-formulario">
            <label htmlFor="colonia">Colonia</label>
            <input
              id="colonia"
              name="colonia"
              type="text"
              required
            />
          </div>

          <div className="campo-formulario">
            <label htmlFor="experiencia">Experiencia laboral</label>
            <textarea
              id="experiencia"
              name="experiencia"
              rows="4"
              required
            />
          </div>
        </fieldset>

        <fieldset disabled={enviando}>
          <legend>Datos de acceso</legend>

          <div className="campo-formulario">
            <label htmlFor="correo">Correo electrónico</label>
            <input
              id="correo"
              name="correo"
              type="email"
              autoComplete="email"
              required
            />
          </div>

          <div className="campo-formulario">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength="8"
              aria-describedby="ayuda-password"
              required
            />
            <p id="ayuda-password" className="campo-formulario__ayuda">
              Usa al menos 8 caracteres.
            </p>
          </div>

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