import { Link } from 'react-router-dom'

export default function Pie() {
  return (
    <footer className="pie">
      <div className="contenedor pie__rejilla">
        <div>
          <p className="pie__marca">AMAC</p>
          <p>
            Plataforma de empleo para personas adultas mayores en Monterrey y su área
            metropolitana.
          </p>
        </div>
        <nav aria-label="Enlaces del pie de página">
          <p className="pie__titulo">Explorar</p>
          <ul className="pie__lista">
            <li>
              <Link className="pie__enlace" to="/">
                Vacantes disponibles
              </Link>
            </li>
            <li>
              <Link className="pie__enlace" to="/mis-solicitudes">
                Mis solicitudes
              </Link>
            </li>
            <li>
              <Link className="pie__enlace" to="/registro-empresa">
                Para empresas
              </Link>
            </li>
          </ul>
        </nav>
        <div>
          <p className="pie__titulo">¿Necesita ayuda?</p>
          <p>Llámenos y con gusto le ayudamos a postularse.</p>
          <p>
            <a className="pie__enlace" href="tel:+528100000000">
              81 0000 0000
            </a>
          </p>
        </div>
      </div>
      <div className="contenedor">
        <p className="pie__legal">© 2026 AMAC · Proyecto escolar OT2026-WEB</p>
      </div>
    </footer>
  )
}
