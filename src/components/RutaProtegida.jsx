import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

/**
 * Esconde pantallas según la sesión y el rol (RF-010).
 * La seguridad real está en RLS; esto solo mejora la experiencia.
 */
export default function RutaProtegida({ rol }) {
  const { sesion, rol: rolActual, cargando } = useAuth()

  if (cargando) return <p aria-live="polite">Cargando…</p>
  if (!sesion) return <Navigate to="/login" replace />
  if (rol && rolActual !== rol) return <Navigate to="/" replace />

  return <Outlet />
}
