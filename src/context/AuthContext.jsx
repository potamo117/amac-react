import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, supabaseConfigurado } from '../lib/supabase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(supabaseConfigurado)

  useEffect(() => {
    if (!supabaseConfigurado) return undefined

    supabase.auth.getSession().then(({ data }) => {
      setSesion(data.session)
      if (!data.session) setCargando(false)
    })

    const { data: suscripcion } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => {
      setSesion(nuevaSesion)
      if (!nuevaSesion) {
        setPerfil(null)
        setCargando(false)
      }
    })

    return () => suscripcion.subscription.unsubscribe()
  }, [])

  const usuarioId = sesion?.user?.id

  useEffect(() => {
    if (!usuarioId) return undefined
    let cancelado = false

    supabase
      .from('perfiles')
      .select('*')
      .eq('id', usuarioId)
      .single()
      .then(({ data, error }) => {
        if (cancelado) return
        if (error) console.error('No se pudo cargar el perfil', error.message)
        setPerfil(data ?? null)
        setCargando(false)
      })

    return () => {
      cancelado = true
    }
  }, [usuarioId])

  async function cerrarSesion() {
    await supabase.auth.signOut()
  }

  const valor = { sesion, perfil, rol: perfil?.rol ?? null, cargando, cerrarSesion }
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return contexto
}
