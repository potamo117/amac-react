import { Link } from 'react-router-dom'

/**
 * Botón reutilizable. Variantes: primario (por defecto), acento, secundario.
 * Con `to` se muestra como enlace de React Router; con `href`, como enlace normal.
 */
export default function Boton({
  variante = 'primario',
  bloque = false,
  icono,
  to,
  href,
  className = '',
  children,
  ...resto
}) {
  const clases = ['boton', `boton--${variante}`, bloque && 'boton--bloque', className]
    .filter(Boolean)
    .join(' ')

  const contenido = (
    <>
      {icono && <img className="boton__icono" src={icono} alt="" width="24" height="24" />}
      {children}
    </>
  )

  if (to) {
    return (
      <Link className={clases} to={to} {...resto}>
        {contenido}
      </Link>
    )
  }
  if (href) {
    return (
      <a className={clases} href={href} {...resto}>
        {contenido}
      </a>
    )
  }
  return (
    <button className={clases} type="button" {...resto}>
      {contenido}
    </button>
  )
}
