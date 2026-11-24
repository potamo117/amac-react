import { useId } from 'react'

export default function CampoFormulario({
  etiqueta,
  id,
  name,
  multilinea = false,
  ayuda,
  error,
  'aria-describedby': descripcionExterna,
  ...propiedades
}) {
  const idGenerado = useId()
  const campoId = id ?? idGenerado
  const ayudaId = ayuda ? `${campoId}-ayuda` : undefined
  const errorId = error ? `${campoId}-error` : undefined
  const descripcion = [descripcionExterna, ayudaId, errorId]
    .filter(Boolean)
    .join(' ') || undefined

  const atributos = {
    ...propiedades,
    id: campoId,
    name,
    'aria-describedby': descripcion,
    'aria-invalid': error ? true : propiedades['aria-invalid']
  }

  return (
    <div className="campo-formulario">
      <label htmlFor={campoId}>{etiqueta}</label>
      {multilinea
        ? <textarea {...atributos} />
        : <input {...atributos} />}
      {ayuda && (
        <p id={ayudaId} className="campo-formulario__ayuda">
          {ayuda}
        </p>
      )}
      {error && <p id={errorId} role="alert">{error}</p>}
    </div>
  )
}
