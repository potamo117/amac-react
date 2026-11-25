import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'
import Boton from '../components/Boton.jsx'

const CLASE_ESTATUS = {
  Enviada: 'etiqueta-estatus--enviada',
  'En revisión': 'etiqueta-estatus--en-revision',
  Aceptada: 'etiqueta-estatus--aceptada',
  Rechazada: 'etiqueta-estatus--rechazada',
  Cancelada: 'etiqueta-estatus--cancelada',
}

// Solo se puede cancelar mientras la empresa no resuelva (lo exige también la política RLS).
const CANCELABLES = ['Enviada', 'En revisión']

export default function MisSolicitudes() {
  const { sesion } = useAuth()
  const [solicitudes, setSolicitudes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cancelando, setCancelando] = useState(null)

  useEffect(() => {
    let activo = true

    supabase
      .from('solicitudes')
      .select('id, estatus, creada_en, vacante:vacantes(id, titulo, ubicacion, empresa:perfiles(nombre))')
      .eq('candidato_id', sesion.user.id)
      .order('creada_en', { ascending: false })
      .then(({ data, error: errorConsulta }) => {
        if (!activo) return
        if (errorConsulta) setError('No pudimos cargar sus solicitudes. Intente de nuevo.')
        else setSolicitudes(data ?? [])
        setCargando(false)
      })

    return () => {
      activo = false
    }
  }, [sesion.user.id])

  async function cancelar(solicitud) {
    const titulo = solicitud.vacante?.titulo ?? 'esta vacante'
    const seguro = window.confirm(
      `¿Seguro que quiere cancelar su solicitud para "${titulo}"? Ya no podrá volver a postularse a esta vacante.`,
    )
    if (!seguro) return

    setMensaje('')
    setError('')
    setCancelando(solicitud.id)

    const { data, error: errorCancelar } = await supabase
      .from('solicitudes')
      .update({ estatus: 'Cancelada' })
      .eq('id', solicitud.id)
      .select('id')

    setCancelando(null)

    if (errorCancelar || !data || data.length === 0) {
      setError('No se pudo cancelar. Es posible que la empresa ya haya respondido; recargue la página.')
      return
    }

    setSolicitudes(actuales =>
      actuales.map(s => (s.id === solicitud.id ? { ...s, estatus: 'Cancelada' } : s)),
    )
    setMensaje(`Su solicitud para "${titulo}" fue cancelada.`)
  }

  return (
    <>
      <div className="cabecera-pagina">
        <h1>Mis solicitudes</h1>
        <p className="cabecera-pagina__descripcion">Consulte el estado de sus postulaciones.</p>
      </div>

      {error && <p role="alert">{error}</p>}
      {mensaje && <p role="status">{mensaje}</p>}
      {cargando && <p role="status">Cargando sus solicitudes…</p>}

      {!cargando && !error && solicitudes.length === 0 && (
        <p>
          Todavía no se ha postulado a ninguna vacante. <Link to="/">Ver vacantes disponibles</Link>.
        </p>
      )}

      {solicitudes.length > 0 && (
        <ul className="lista-solicitudes">
          {solicitudes.map(s => {
            const titulo = s.vacante?.titulo ?? 'Vacante no disponible'
            return (
              <li key={s.id} className="lista-solicitudes__item">
                <h2 className="lista-solicitudes__titulo">
                  {s.vacante ? <Link to={`/vacante/${s.vacante.id}`}>{titulo}</Link> : titulo}
                </h2>
                <p className="lista-solicitudes__empresa">{s.vacante?.empresa?.nombre ?? 'Empresa'}</p>
                <p className="lista-solicitudes__fecha">
                  Enviada el {new Date(s.creada_en).toLocaleDateString('es-MX')}
                </p>
                <p>
                  <span className={`etiqueta-estatus ${CLASE_ESTATUS[s.estatus] ?? ''}`}>
                    {s.estatus}
                  </span>
                </p>
                {CANCELABLES.includes(s.estatus) && (
                  <Boton
                    variante="secundario"
                    onClick={() => cancelar(s)}
                    disabled={cancelando === s.id}
                    aria-label={`Cancelar solicitud para ${titulo}`}
                  >
                    {cancelando === s.id ? 'Cancelando…' : 'Cancelar'}
                  </Boton>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
