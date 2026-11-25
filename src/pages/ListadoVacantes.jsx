import { useEffect, useMemo, useState } from 'react'
import { supabase, supabaseConfigurado } from '../lib/supabase.js'
import { CATEGORIAS, HORARIOS } from '../lib/catalogos.js'
import { normalizar } from '../lib/formato.js'
import Boton from '../components/Boton.jsx'
import TarjetaVacante from '../components/TarjetaVacante.jsx'

const FILTROS_VACIOS = { busqueda: '', horario: '', categoria: '' }

export default function ListadoVacantes() {
  const [vacantes, setVacantes] = useState([])
  const [cargando, setCargando] = useState(supabaseConfigurado)
  const [error, setError] = useState(
    supabaseConfigurado ? '' : 'Falta configurar la conexión con Supabase.',
  )
  const [filtros, setFiltros] = useState(FILTROS_VACIOS)

  // RF-001: solo vacantes activas (la política RLS también lo exige al público).
  useEffect(() => {
    if (!supabaseConfigurado) return undefined
    let activo = true

    supabase
      .from('vacantes')
      .select('*, empresa:perfiles(nombre)')
      .eq('estado', 'activa')
      .order('creada_en', { ascending: false })
      .then(({ data, error: errorConsulta }) => {
        if (!activo) return
        if (errorConsulta) setError('No pudimos cargar las vacantes. Intente de nuevo en unos minutos.')
        else setVacantes(data ?? [])
        setCargando(false)
      })

    return () => {
      activo = false
    }
  }, [])

  // RF-002 y RF-007: palabra clave + horario + categoría.
  const resultados = useMemo(() => {
    const palabras = normalizar(filtros.busqueda).split(/\s+/).filter(Boolean)
    return vacantes.filter(v => {
      if (filtros.horario && v.horario !== filtros.horario) return false
      if (filtros.categoria && v.categoria !== filtros.categoria) return false
      if (palabras.length === 0) return true
      const texto = normalizar(
        [v.titulo, v.empresa?.nombre, v.ubicacion, v.categoria, v.descripcion].join(' '),
      )
      return palabras.every(p => texto.includes(p))
    })
  }, [vacantes, filtros])

  function cambiar(evento) {
    const { name, value } = evento.target
    setFiltros(anteriores => ({ ...anteriores, [name]: value }))
  }

  const hayFiltros = Object.values(filtros).some(Boolean)

  return (
    <>
      <div className="cabecera-pagina">
        <h1>Vacantes disponibles</h1>
        <p className="cabecera-pagina__descripcion">
          Encuentre un empleo y postúlese en pocos pasos.
        </p>
      </div>

      <form
        className="buscador-filtros"
        role="search"
        aria-label="Buscar vacantes"
        onSubmit={evento => evento.preventDefault()}
      >
        <div className="buscador-filtros__campos">
          <div className="buscador-filtros__campo">
            <label className="buscador-filtros__etiqueta" htmlFor="buscar-vacante">
              Buscar una vacante
            </label>
            <input
              className="buscador-filtros__control"
              type="search"
              id="buscar-vacante"
              name="busqueda"
              autoComplete="off"
              placeholder="Ejemplo: recepcionista"
              value={filtros.busqueda}
              onChange={cambiar}
            />
          </div>
          <div className="buscador-filtros__campo">
            <label className="buscador-filtros__etiqueta" htmlFor="horario">
              Horario
            </label>
            <select
              className="buscador-filtros__control"
              id="horario"
              name="horario"
              value={filtros.horario}
              onChange={cambiar}
            >
              <option value="">Todos los horarios</option>
              {HORARIOS.map(h => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
          <div className="buscador-filtros__campo">
            <label className="buscador-filtros__etiqueta" htmlFor="categoria">
              Categoría
            </label>
            <select
              className="buscador-filtros__control"
              id="categoria"
              name="categoria"
              value={filtros.categoria}
              onChange={cambiar}
            >
              <option value="">Todas las categorías</option>
              {CATEGORIAS.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hayFiltros && (
          <div className="buscador-filtros__acciones">
            <Boton variante="secundario" onClick={() => setFiltros(FILTROS_VACIOS)}>
              Quitar filtros
            </Boton>
          </div>
        )}
      </form>

      {error && <p role="alert">{error}</p>}
      {cargando && <p role="status">Cargando vacantes…</p>}

      {!cargando && !error && (
        <>
          <p className="conteo-resultados" role="status">
            {resultados.length === 1
              ? '1 vacante encontrada'
              : `${resultados.length} vacantes encontradas`}
          </p>

          {resultados.length === 0 ? (
            <p>
              No hay vacantes con esos datos. Pruebe con otra palabra o quite los filtros.
            </p>
          ) : (
            <section className="lista-vacantes" aria-label="Resultados de vacantes">
              {resultados.map(v => (
                <TarjetaVacante key={v.id} vacante={v} />
              ))}
            </section>
          )}
        </>
      )}
    </>
  )
}
