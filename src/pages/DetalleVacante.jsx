import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase, supabaseConfigurado } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'
import Boton from '../components/Boton.jsx'
import EtiquetaDato from '../components/EtiquetaDato.jsx'
import { formatoSueldo, telefonoParaEnlace } from '../lib/formato.js'

export default function DetalleVacante() {
  const { id } = useParams()
  const { sesion } = useAuth()

  const usuarioId = sesion?.user?.id ?? 'visitante'

  // La clave reinicia el estado al cambiar de vacante o de usuario.
  return <ContenidoDetalle key={`${id}:${usuarioId}`} id={id} />
}

// Convierte un texto con renglones en lista; si es un solo renglón, queda como párrafo.
function TextoEnLista({ texto }) {
  const lineas = String(texto ?? '')
    .split(/\r?\n/)
    .map(l => l.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean)

  if (lineas.length <= 1) return <p>{lineas[0] ?? ''}</p>
  return (
    <ul className="detalle-vacante__lista">
      {lineas.map(l => (
        <li key={l}>{l}</li>
      ))}
    </ul>
  )
}

function ContenidoDetalle({ id }) {
  const navigate = useNavigate()
  const { sesion, perfil, cargando: cargandoSesion } = useAuth()

  const [vacante, setVacante] = useState(null)
  const [cargando, setCargando] = useState(supabaseConfigurado)
  const [errorCarga, setErrorCarga] = useState(
    supabaseConfigurado ? '' : 'Falta configurar la conexión con Supabase.',
  )

  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [errorPostulacion, setErrorPostulacion] = useState('')
  const [postulada, setPostulada] = useState(false)

  const usuarioId = sesion?.user?.id
  const esCandidato = perfil?.rol === 'candidato'

  useEffect(() => {
    if (!supabaseConfigurado) return undefined
    let activo = true

    async function cargarVacante() {
      try {
        const { data, error } = await supabase
          .from('vacantes')
          .select('*, empresa:perfiles(nombre)')
          .eq('id', id)
          .maybeSingle()

        if (error) throw error
        if (activo) setVacante(data)
      } catch {
        if (activo) setErrorCarga('No pudimos cargar la vacante. Intente nuevamente.')
      } finally {
        if (activo) setCargando(false)
      }
    }

    cargarVacante()
    return () => {
      activo = false
    }
  }, [id])

  // Si el candidato ya se postuló antes, el botón lo refleja desde que abre la página.
  useEffect(() => {
    if (!supabaseConfigurado || !usuarioId || !esCandidato) return undefined
    let activo = true

    supabase
      .from('solicitudes')
      .select('id')
      .eq('vacante_id', id)
      .eq('candidato_id', usuarioId)
      .maybeSingle()
      .then(({ data }) => {
        if (activo && data) setPostulada(true)
      })

    return () => {
      activo = false
    }
  }, [id, usuarioId, esCandidato])

  async function postularme() {
    if (enviando || cargandoSesion || postulada) return

    setMensaje('')
    setErrorPostulacion('')

    if (!sesion) {
      navigate('/login')
      return
    }

    if (!perfil) {
      setErrorPostulacion('No pudimos obtener su perfil. Recargue la página e intente nuevamente.')
      return
    }

    if (perfil.rol !== 'candidato') {
      setErrorPostulacion('Solo los candidatos pueden postularse.')
      return
    }

    if (!perfil.aprobado) {
      setErrorPostulacion('Su registro aún no ha sido aprobado por AMAC. Por favor espere.')
      return
    }

    if (!vacante || vacante.estado !== 'activa') {
      setErrorPostulacion('Esta vacante ya no recibe postulaciones.')
      return
    }

    const seguro = window.confirm(`¿Desea postularse a "${vacante.titulo}"?`)
    if (!seguro) return

    setEnviando(true)

    try {
      const { error } = await supabase.from('solicitudes').insert({
        vacante_id: vacante.id,
        candidato_id: sesion.user.id,
        estatus: 'Enviada',
      })

      if (error) {
        if (error.code === '23505') {
          setPostulada(true)
          setErrorPostulacion('Ya se postuló a esta vacante.')
          return
        }
        throw error
      }

      setPostulada(true)
      setMensaje('¡Listo! Su solicitud fue enviada. Puede ver su estado en «Mis solicitudes».')
    } catch {
      setErrorPostulacion(
        'No pudimos enviar su solicitud. Compruebe que su cuenta esté aprobada y que la vacante siga activa.',
      )
    } finally {
      setEnviando(false)
    }
  }

  if (cargando) return <p role="status">Cargando vacante…</p>
  if (errorCarga) return <p role="alert">{errorCarga}</p>

  if (!vacante) {
    return (
      <section className="cabecera-pagina">
        <h1>Vacante no disponible</h1>
        <p className="cabecera-pagina__descripcion">
          No encontramos esta vacante o ya no tiene acceso a ella.
        </p>
        <p>
          <Boton to="/">Volver a vacantes</Boton>
        </p>
      </section>
    )
  }

  const telefono = vacante.telefono_contacto?.trim()

  return (
    <article className="detalle-vacante">
      <header className="detalle-vacante__encabezado">
        <Link className="detalle-vacante__volver" to="/">
          <img
            className="detalle-vacante__volver-icono"
            src="/img/icono-flecha-izquierda.svg"
            alt=""
            width="20"
            height="20"
          />
          Volver a vacantes
        </Link>
        <h1>{vacante.titulo}</h1>
        <p className="detalle-vacante__empresa">{vacante.empresa?.nombre ?? 'Empresa'}</p>
        <ul className="detalle-vacante__etiquetas">
          <EtiquetaDato icono="ubicacion">{vacante.ubicacion}</EtiquetaDato>
          <EtiquetaDato icono="reloj">{vacante.horario}</EtiquetaDato>
          <EtiquetaDato icono="maletin">{vacante.categoria}</EtiquetaDato>
        </ul>
      </header>

      <div className="detalle-vacante__contenido">
        <h2>Descripción</h2>
        <p>{vacante.descripcion}</p>

        <h2>Requisitos</h2>
        <TextoEnLista texto={vacante.requisitos} />

        <h2>Prestaciones</h2>
        <TextoEnLista texto={vacante.prestaciones} />
      </div>

      <aside className="detalle-vacante__lateral" aria-label="Resumen y postulación">
        <section className="detalle-vacante__resumen">
          <h2>Resumen</h2>
          <dl className="detalle-vacante__datos">
            <dt>Sueldo mensual</dt>
            <dd>{formatoSueldo(vacante.sueldo)}</dd>
            <dt>Horario</dt>
            <dd>{vacante.horario}</dd>
            <dt>Ubicación</dt>
            <dd>{vacante.ubicacion}</dd>
            <dt>Publicación</dt>
            <dd>{new Date(vacante.creada_en).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</dd>
          </dl>

          {vacante.estado === 'activa' ? (
            <Boton
              bloque
              variante="acento"
              onClick={postularme}
              disabled={enviando || cargandoSesion || postulada}
            >
              {enviando ? 'Enviando solicitud…' : postulada ? 'Ya se postuló' : 'Postularme'}
            </Boton>
          ) : (
            <p className="detalle-vacante__nota">Esta vacante ya no recibe postulaciones.</p>
          )}

          {!sesion && (
            <p className="detalle-vacante__nota">
              Para postularse necesita <Link to="/login">iniciar sesión</Link> o{' '}
              <Link to="/registro">crear una cuenta</Link>.
            </p>
          )}

          {mensaje && (
            <p className="mensaje mensaje--exito" role="status">
              {mensaje}
            </p>
          )}
          {errorPostulacion && (
            <p className="mensaje mensaje--error" role="alert">
              {errorPostulacion}
            </p>
          )}
        </section>

        {telefono && (
          <section className="detalle-vacante__ayuda">
            <h2>¿Prefiere llamar?</h2>
            <p>Puede hablar directamente con la empresa al <strong>{telefono}</strong>.</p>
            <Boton
              bloque
              variante="primario"
              href={`tel:${telefonoParaEnlace(telefono)}`}
              icono="/img/icono-telefono-claro.svg"
            >
              Llamar a la empresa
            </Boton>
          </section>
        )}
      </aside>
    </article>
  )
}
