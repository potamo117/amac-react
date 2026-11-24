import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase, supabaseConfigurado } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function DetalleVacante() {
  const { id } = useParams()
  const { sesion } = useAuth()

  const usuarioId = sesion?.user?.id ?? 'visitante'

  return (
    <ContenidoDetalle
      key={`${id}:${usuarioId}`}
      id={id}
    />
  )
}

function ContenidoDetalle({ id }) {
  const navigate = useNavigate()
  const { sesion, perfil, cargando: cargandoSesion } = useAuth()

  const [vacante, setVacante] = useState(null)
  const [cargando, setCargando] = useState(supabaseConfigurado)
  const [errorCarga, setErrorCarga] = useState(
    supabaseConfigurado
      ? ''
      : 'Falta configurar la conexión con Supabase.'
  )

  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [errorPostulacion, setErrorPostulacion] = useState('')
  const [postulada, setPostulada] = useState(false)

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

        if (activo) {
          setVacante(data)
        }
      } catch {
        if (activo) {
          setErrorCarga(
            'No pudimos cargar la vacante. Intenta nuevamente.'
          )
        }
      } finally {
        if (activo) {
          setCargando(false)
        }
      }
    }

    cargarVacante()

    return () => {
      activo = false
    }
  }, [id])

  async function postularme() {
    if (enviando || cargandoSesion || postulada) return

    setMensaje('')
    setErrorPostulacion('')

    if (!sesion) {
      navigate('/login')
      return
    }

    if (!perfil) {
      setErrorPostulacion(
        'No pudimos obtener tu perfil. Recarga la página e intenta nuevamente.'
      )
      return
    }

    if (perfil.rol !== 'candidato') {
      setErrorPostulacion('Solo los candidatos pueden postularse.')
      return
    }

    if (!perfil.aprobado) {
      setErrorPostulacion(
        'Tu registro aún no ha sido aprobado por AMAC. Por favor espera.'
      )
      return
    }

    if (!vacante || vacante.estado !== 'activa') {
      setErrorPostulacion(
        'Esta vacante ya no recibe postulaciones.'
      )
      return
    }

    setEnviando(true)

    try {
      const { error } = await supabase
        .from('solicitudes')
        .insert({
          vacante_id: vacante.id,
          candidato_id: sesion.user.id,
          estatus: 'Enviada'
        })

      if (error) {
        if (error.code === '23505') {
          setPostulada(true)
          setErrorPostulacion(
            'Ya te postulaste a esta vacante.'
          )
          return
        }

        throw error
      }

      setPostulada(true)
      setMensaje('¡Listo! Tu solicitud fue enviada.')
    } catch {
      setErrorPostulacion(
        'No pudimos enviar tu solicitud. Comprueba que tu cuenta esté aprobada y la vacante siga activa.'
      )
    } finally {
      setEnviando(false)
    }
  }

  if (cargando) {
    return <p role="status">Cargando vacante…</p>
  }

  if (errorCarga) {
    return <p role="alert">{errorCarga}</p>
  }

  if (!vacante) {
    return (
      <section>
        <h1>Vacante no disponible</h1>
        <p>
          No encontramos esta vacante o no tienes acceso a ella.
        </p>
        <Link to="/">Volver a vacantes</Link>
      </section>
    )
  }

  return (
    <section>
      <Link to="/">Volver a vacantes</Link>

      <h1>{vacante.titulo}</h1>

      <p>
        <strong>Empresa:</strong>{' '}
        {vacante.empresa?.nombre ?? 'Empresa'}
      </p>

      <dl>
        <dt>Sueldo mensual</dt>
        <dd>
          {Number(vacante.sueldo).toLocaleString('es-MX', {
            style: 'currency',
            currency: 'MXN'
          })}
        </dd>

        <dt>Ubicación</dt>
        <dd>{vacante.ubicacion}</dd>

        <dt>Horario</dt>
        <dd>{vacante.horario}</dd>

        <dt>Categoría</dt>
        <dd>{vacante.categoria}</dd>

        <dt>Estado</dt>
        <dd>{vacante.estado}</dd>

        <dt>Fecha de publicación</dt>
        <dd>
          {new Date(vacante.creada_en).toLocaleDateString('es-MX')}
        </dd>
      </dl>

      <h2>Descripción</h2>
      <p>{vacante.descripcion}</p>

      <h2>Requisitos</h2>
      <p>{vacante.requisitos}</p>

      <h2>Prestaciones</h2>
      <p>{vacante.prestaciones}</p>

      {vacante.telefono_contacto?.trim() && (
        <p>
          <a
            className="boton boton--secundario"
            href={`tel:${vacante.telefono_contacto.replace(/[^\d+]/g, '')}`}
          >
            Llamar
          </a>
        </p>
      )}

      {vacante.estado === 'activa' ? (
        <button
          className="boton boton--primario"
          type="button"
          onClick={postularme}
          disabled={enviando || cargandoSesion || postulada}
        >
          {enviando
            ? 'Enviando solicitud…'
            : postulada
              ? 'Postulación registrada'
              : 'Postularme'}
        </button>
      ) : (
        <p>Esta vacante ya no recibe postulaciones.</p>
      )}

      <p role="status">{mensaje}</p>

      {errorPostulacion && (
        <p role="alert">{errorPostulacion}</p>
      )}
    </section>
  )
}