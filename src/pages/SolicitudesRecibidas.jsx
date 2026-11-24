import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const CLASE_ESTATUS = {
  'En revisión': 'etiqueta-estatus--en-revision',
  Aceptada: 'etiqueta-estatus--aceptada',
  Rechazada: 'etiqueta-estatus--rechazada',
}

const OPCIONES = ['En revisión', 'Aceptada', 'Rechazada']

export default function SolicitudesRecibidas() {
  const [solicitudes, setSolicitudes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    let cancelado = false

    async function cargar() {
      const { data, error } = await supabase
        .from('solicitudes')
        .select(
          'id, estatus, creada_en, vacante:vacantes(titulo), candidato:perfiles(nombre, edad, colonia, experiencia)',
        )
        .neq('estatus', 'Cancelada')
        .order('creada_en', { ascending: false })

      if (cancelado) return
      if (error) setMensaje('No se pudieron cargar las solicitudes.')
      else setSolicitudes(data)
      setCargando(false)
    }

    cargar()
    return () => {
      cancelado = true
    }
  }, [])

  async function cambiarEstatus(solicitud, estatus) {
    setMensaje('')
    const { error } = await supabase
      .from('solicitudes')
      .update({ estatus })
      .eq('id', solicitud.id)

    if (error) {
      setMensaje('No se pudo cambiar el estatus. Es posible que el candidato haya cancelado.')
      return
    }
    setSolicitudes(lista =>
      lista.map(s => (s.id === solicitud.id ? { ...s, estatus } : s)),
    )
  }

  return (
    <>
      <h1>Solicitudes recibidas</h1>

      {mensaje && <p role="alert">{mensaje}</p>}
      {cargando && <p role="status">Cargando solicitudes…</p>}
      {!cargando && solicitudes.length === 0 && (
        <p>Aún no ha recibido solicitudes.</p>
      )}

      {solicitudes.length > 0 && (
        <div className="tabla-responsiva">
          <table>
            <caption>Solicitudes a las vacantes de su empresa</caption>
            <thead>
              <tr>
                <th scope="col">Candidato</th>
                <th scope="col">Vacante</th>
                <th scope="col">Edad</th>
                <th scope="col">Colonia</th>
                <th scope="col">Experiencia</th>
                <th scope="col">Estatus</th>
                <th scope="col">Cambiar estatus</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map(s => (
                <tr key={s.id}>
                  <th scope="row">{s.candidato?.nombre}</th>
                  <td>{s.vacante?.titulo}</td>
                  <td>{s.candidato?.edad}</td>
                  <td>{s.candidato?.colonia}</td>
                  <td>{s.candidato?.experiencia}</td>
                  <td>
                    <span className={`etiqueta-estatus ${CLASE_ESTATUS[s.estatus] ?? ''}`}>
                      {s.estatus}
                    </span>
                  </td>
                  <td>
                    <label className="visualmente-oculto" htmlFor={`estatus-${s.id}`}>
                      Estatus de la solicitud de {s.candidato?.nombre}
                    </label>
                    <select
                      id={`estatus-${s.id}`}
                      value={s.estatus}
                      onChange={e => cambiarEstatus(s, e.target.value)}
                    >
                      {s.estatus === 'Enviada' && (
                        <option value="Enviada" disabled>
                          Enviada
                        </option>
                      )}
                      {OPCIONES.map(o => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}