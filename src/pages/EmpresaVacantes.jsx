import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'
import Boton from '../components/Boton.jsx'

// Reutilizamos los colores de .etiqueta-estatus para el estado de la vacante
const CLASE_ESTADO = {
  activa: 'etiqueta-estatus--aceptada',
  pausada: 'etiqueta-estatus--en-revision',
  cerrada: 'etiqueta-estatus--rechazada',
}

export default function EmpresaVacantes() {
  const { sesion } = useAuth()
  const [vacantes, setVacantes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState('')
  const [version, setVersion] = useState(0) // al cambiar, se vuelve a consultar

  useEffect(() => {
    let cancelado = false

    async function cargar() {
      const { data, error } = await supabase
        .from('vacantes')
        .select('*, solicitudes(count)') // cuenta las solicitudes de cada vacante
        .eq('empresa_id', sesion.user.id)
        .order('creada_en', { ascending: false })

      if (cancelado) return
      if (error) setMensaje('No se pudieron cargar sus vacantes.')
      else setVacantes(data)
      setCargando(false)
    }

    cargar()
    return () => {
      cancelado = true
    }
  }, [sesion.user.id, version])

  async function cambiarEstado(vacante, estado) {
    if (estado === 'cerrada') {
      const seguro = window.confirm(
        `¿Seguro que quiere cerrar la vacante "${vacante.titulo}"? Ya no se podrá reactivar.`,
      )
      if (!seguro) return
    }

    setMensaje('')
    const { error } = await supabase
      .from('vacantes')
      .update({ estado })
      .eq('id', vacante.id)

    if (error) {
      setMensaje('No se pudo cambiar el estado de la vacante.')
      return
    }
    setVersion(v => v + 1)
  }

  return (
    <>
      <h1>Mis vacantes</h1>
      <p>
        <Boton to="/empresa/publicar">Publicar vacante</Boton>{' '}
        <Boton to="/empresa/solicitudes" variante="secundario">
          Ver solicitudes recibidas
        </Boton>
      </p>

      {mensaje && <p role="alert">{mensaje}</p>}
      {cargando && <p role="status">Cargando sus vacantes…</p>}
      {!cargando && vacantes.length === 0 && (
        <p>
          Aún no tiene vacantes publicadas. <Link to="/empresa/publicar">Publique la primera</Link>.
        </p>
      )}

      {vacantes.length > 0 && (
        <div className="tabla-responsiva">
          <table>
            <caption>Vacantes publicadas por su empresa</caption>
            <thead>
              <tr>
                <th scope="col">Vacante</th>
                <th scope="col">Estado</th>
                <th scope="col">Solicitudes</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vacantes.map(v => (
                <tr key={v.id}>
                  <th scope="row">{v.titulo}</th>
                  <td>
                    <span className={`etiqueta-estatus ${CLASE_ESTADO[v.estado]}`}>
                      {v.estado}
                    </span>
                  </td>
                  <td>{v.solicitudes?.[0]?.count ?? 0}</td>
                  <td>
                    {v.estado === 'activa' && (
                      <Boton variante="secundario" onClick={() => cambiarEstado(v, 'pausada')}>
                        Pausar
                      </Boton>
                    )}
                    {v.estado === 'pausada' && (
                      <Boton variante="secundario" onClick={() => cambiarEstado(v, 'activa')}>
                        Reactivar
                      </Boton>
                    )}
                    {v.estado !== 'cerrada' && (
                      <Boton variante="acento" onClick={() => cambiarEstado(v, 'cerrada')}>
                        Cerrar
                      </Boton>
                    )}
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
