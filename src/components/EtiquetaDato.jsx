const ICONOS = {
  ubicacion: '/img/icono-ubicacion.svg',
  maletin: '/img/icono-maletin.svg',
  reloj: '/img/icono-reloj.svg',
}

export default function EtiquetaDato({ icono, children }) {
  return (
    <li className="etiqueta-dato">
      <img className="etiqueta-dato__icono" src={ICONOS[icono]} alt="" width="20" height="20" />
      <span>{children}</span>
    </li>
  )
}
