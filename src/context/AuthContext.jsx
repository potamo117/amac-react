import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, supabaseConfigurado } from '../lib/supabase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(null)
  const [sesionLista, setSesionLista] = useState(!supabaseConfigurado)
  const [resultadoPerfil, setResultadoPerfil] = useState(null)

  useEffect(() => {
    if (!supabaseConfigurado) return undefined

    let activo = true
    let eventoRecibido = false

    const { data: suscripcion } = supabase.auth.onAuthStateChange(
      (_evento, nuevaSesion) => {
        if (!activo) return

        eventoRecibido = true
        setSesion(nuevaSesion)
        setSesionLista(true)

        if (!nuevaSesion) {
          setResultadoPerfil(null)
        }
      }
    )

    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (!activo || eventoRecibido) return

        setSesion(error ? null : data.session)
        setSesionLista(true)
      })
      .catch(() => {
        if (!activo || eventoRecibido) return

        setSesion(null)
        setSesionLista(true)
      })

    return () => {
      activo = false
      suscripcion.subscription.unsubscribe()
    }
  }, [])

  const usuarioId = sesion?.user?.id ?? null

  useEffect(() => {
    if (!usuarioId) return undefined

    let cancelado = false

    async function cargarPerfil() {
      try {
        const { data, error } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', usuarioId)
          .single()

        if (cancelado) return

        setResultadoPerfil({
          usuarioId,
          perfil: error ? null : data
        })
      } catch {
        if (cancelado) return

        setResultadoPerfil({
          usuarioId,
          perfil: null
        })
      }
    }

    cargarPerfil()

    return () => {
      cancelado = true
    }
  }, [usuarioId])

  async function cerrarSesion() {
    const { error } = await supabase.auth.signOut()

    if (error) throw error

    setSesion(null)
    setResultadoPerfil(null)
    setSesionLista(true)
  }

  const perfilResuelto =
    Boolean(usuarioId) && resultadoPerfil?.usuarioId === usuarioId

  const perfilActual = perfilResuelto
    ? resultadoPerfil.perfil
    : null

  const cargando =
    !sesionLista || (Boolean(usuarioId) && !perfilResuelto)

  const valor = {
    sesion,
    perfil: perfilActual,
    rol: perfilActual?.rol ?? null,
    cargando,
    cerrarSesion
  }

  return (
    <AuthContext.Provider value={valor}>
      {children}
    </AuthContext.Provider>
  )
}

// Conservamos el hook aquí para mantener los imports actuales.
// oxlint-disable-next-line react/only-export-components
export function useAuth() {
  const contexto = useContext(AuthContext)

  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }

  return contexto
}