import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Encabezado() {
  const { sesion, rol, cerrarSesion } = useAuth()

  return (
    <header className="encabezado">
      <div className="contenedor encabezado__interior">
        <Link className="encabezado__marca" to="/" aria-label="AMAC, ir al inicio">
          AMAC
        </Link>
        <nav className="navegacion" aria-label="Navegación principal">
          <ul className="navegacion__lista">
            <li>
              <NavLink className="navegacion__enlace" to="/" end>
                Vacantes
              </NavLink>
            </li>
            {rol === 'candidato' && (
              <li>
                <NavLink className="navegacion__enlace" to="/mis-solicitudes">
                  Mis solicitudes
                </NavLink>
              </li>
            )}
            {rol === 'empresa' && (
              <li>
                <NavLink className="navegacion__enlace" to="/empresa/vacantes">
                  Mis vacantes
                </NavLink>
              </li>
            )}
            {!sesion && (
              <>
                <li>
                  <NavLink className="navegacion__enlace" to="/registro-empresa">
                    Para empresas
                  </NavLink>
                </li>
                <li>
                  <NavLink className="navegacion__enlace" to="/login">
                    Iniciar sesión
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    className="navegacion__enlace navegacion__enlace--destacado"
                    to="/registro"
                  >
                    Crear cuenta
                  </NavLink>
                </li>
              </>
            )}
            {sesion && (
              <li>
                <button
                  className="navegacion__enlace navegacion__enlace--destacado"
                  type="button"
                  onClick={cerrarSesion}
                >
                  Cerrar sesión
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  )
}
