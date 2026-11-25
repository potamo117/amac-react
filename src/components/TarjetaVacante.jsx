import Boton from './Boton.jsx'
import EtiquetaDato from './EtiquetaDato.jsx'
import { formatoSueldo, publicadaHace } from '../lib/formato.js'

export default function TarjetaVacante({ vacante }) {
  const empresa = vacante.empresa?.nombre ?? 'Empresa'

  return (
    <article className="tarjeta-vacante">
      <h2 className="tarjeta-vacante__titulo">{vacante.titulo}</h2>
      <p className="tarjeta-vacante__empresa">{empresa}</p>
      <ul className="tarjeta-vacante__datos">
        <EtiquetaDato icono="ubicacion">{vacante.ubicacion}</EtiquetaDato>
        <EtiquetaDato icono="reloj">{vacante.horario}</EtiquetaDato>
        <EtiquetaDato icono="maletin">{vacante.categoria}</EtiquetaDato>
      </ul>
      <p className="tarjeta-vacante__sueldo">{formatoSueldo(vacante.sueldo)} al mes</p>
      <p className="tarjeta-vacante__publicada">{publicadaHace(vacante.creada_en)}</p>
      <div className="tarjeta-vacante__accion">
        <Boton
          to={`/vacante/${vacante.id}`}
          bloque
          aria-label={`Ver vacante de ${vacante.titulo} en ${empresa}`}
        >
          Ver vacante
        </Boton>
      </div>
    </article>
  )
}
