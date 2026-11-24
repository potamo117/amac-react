import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const llave = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabaseConfigurado = Boolean(url && llave)

if (!supabaseConfigurado) {
  console.warn(
    'Faltan VITE_SUPABASE_URL o VITE_SUPABASE_PUBLISHABLE_KEY. Cree .env.local (vea .env.example).',
  )
}

// Con valores de relleno la app abre aunque todavía no existan las llaves.
export const supabase = createClient(
  url || 'http://localhost:54321',
  llave || 'llave-pendiente',
)
