import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { HORARIOS, CATEGORIAS } from '../lib/catalogos.js'
import CampoFormulario from '../components/CampoFormulario.jsx'

const INICIAL = {
  titulo: '', sueldo: '', ubicacion: '', horario: '', categoria: '',
  descripcion: '', requisitos: '', prestaciones: '',
  postulaciones: 'plataforma', telefono: '',
}

export default function PublicarVacante() {
  const { sesion } = useAuth()
  const navigate = useNavigate()
  const [datos, setDatos] = useState(INICIAL)
  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)

  const pideTelefono = datos.postulaciones === 'telefono'

  function cambiar(e) {
    setDatos({ ...datos, [e.target.name]: e.target.value })
  }

  function validar() {
    const e = {}
    if (!datos.titulo.trim()) e.titulo = 'Escriba el título del puesto.'
    if (!(Number(datos.sueldo) > 0)) e.sueldo = 'Escriba un sueldo mayor que 0.'
    if (!datos.ubicacion.trim()) e.ubicacion = 'Escriba la ubicación.'
    if (!datos.horario) e.horario = 'Elija un horario.'
    if (!datos.categoria) e.categoria = 'Elija una categoría.'
    if (!datos.descripcion.trim()) e.descripcion = 'Escriba la descripción.'
    if (!datos.requisitos.trim()) e.requisitos = 'Escriba los requisitos.'
    if (!datos.prestaciones.trim()) e.prestaciones = 'Escriba las prestaciones.'
    if (pideTelefono && datos.telefono.replace(/\D/g, '').length !== 10)
      e.telefono = 'Escriba un teléfono de 10 dígitos.'
    return e
  }

  async function enviar(evento) {
    evento.preventDefault()
    const encontrados = validar()
    setErrores(encontrados)
    setMensaje('')
    if (Object.keys(encontrados).length > 0) return

    setEnviando(true)
    const { error } = await supabase.from('vacantes').insert({
      empresa_id: sesion.user.id,
      titulo: datos.titulo.trim(),
      sueldo: Number(datos.sueldo),
      ubicacion: datos.ubicacion.trim(),
      horario: datos.horario,
      categoria: datos.categoria,
      descripcion: datos.descripcion.trim(),
      requisitos: datos.requisitos.trim(),
      prestaciones: datos.prestaciones.trim(),
      telefono_contacto: pideTelefono ? datos.telefono.trim() : null,
    })
    setEnviando(false)

    if (error) {
      setMensaje('No se pudo publicar la vacante. Intente de nuevo.')
      return
    }
    navigate('/empresa/vacantes')
  }

  return (
    <section className="acceso">
      <h1>Publicar vacante</h1>
      <form onSubmit={enviar} noValidate>
        <fieldset disabled={enviando}>
          <legend>Datos del puesto</legend>
          <CampoFormulario etiqueta="Título del puesto" name="titulo"
            value={datos.titulo} onChange={cambiar} error={errores.titulo} required />
          <CampoFormulario etiqueta="Sueldo mensual (pesos)" name="sueldo" type="number"
            min="1" step="0.01" value={datos.sueldo} onChange={cambiar}
            error={errores.sueldo} required />
          <CampoFormulario etiqueta="Ubicación" name="ubicacion"
            ayuda="Colonia o zona de Monterrey."
            value={datos.ubicacion} onChange={cambiar} error={errores.ubicacion} required />

          <div className="campo-formulario">
            <label htmlFor="horario">Horario</label>
            <select id="horario" name="horario" value={datos.horario} onChange={cambiar}
              aria-invalid={errores.horario ? true : undefined}
              aria-describedby={errores.horario ? 'horario-error' : undefined} required>
              <option value="">Elija un horario</option>
              {HORARIOS.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
            {errores.horario && <p id="horario-error" role="alert">{errores.horario}</p>}
          </div>

          <div className="campo-formulario">
            <label htmlFor="categoria">Categoría</label>
            <select id="categoria" name="categoria" value={datos.categoria} onChange={cambiar}
              aria-invalid={errores.categoria ? true : undefined}
              aria-describedby={errores.categoria ? 'categoria-error' : undefined} required>
              <option value="">Elija una categoría</option>
              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errores.categoria && <p id="categoria-error" role="alert">{errores.categoria}</p>}
          </div>

          <CampoFormulario etiqueta="Descripción" name="descripcion" multilinea rows="4"
            value={datos.descripcion} onChange={cambiar} error={errores.descripcion} required />
          <CampoFormulario etiqueta="Requisitos" name="requisitos" multilinea rows="4"
            value={datos.requisitos} onChange={cambiar} error={errores.requisitos} required />
          <CampoFormulario etiqueta="Prestaciones" name="prestaciones" multilinea rows="4"
            value={datos.prestaciones} onChange={cambiar} error={errores.prestaciones} required />
        </fieldset>

        <fieldset disabled={enviando}>
          <legend>¿Cómo desea recibir las postulaciones?</legend>
          <label className="opcion-radio">
            <input type="radio" name="postulaciones" value="plataforma"
              checked={!pideTelefono} onChange={cambiar} />
            Solo en la plataforma
          </label>
          <label className="opcion-radio">
            <input type="radio" name="postulaciones" value="telefono"
              checked={pideTelefono} onChange={cambiar} />
            En la plataforma y por teléfono
          </label>
          {pideTelefono && (
            <CampoFormulario etiqueta="Teléfono de contacto" name="telefono" type="tel"
              autoComplete="tel" value={datos.telefono} onChange={cambiar}
              error={errores.telefono} required />
          )}
        </fieldset>

        {mensaje && <p role="alert">{mensaje}</p>}
        <button className="boton boton--primario" type="submit" disabled={enviando}>
          {enviando ? 'Publicando…' : 'Publicar vacante'}
        </button>
      </form>
    </section>
  )
}