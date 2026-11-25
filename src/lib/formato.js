export function formatoSueldo(valor) {
  return Number(valor).toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  })
}

export function publicadaHace(fechaIso) {
  const dias = Math.floor((Date.now() - new Date(fechaIso).getTime()) / 86400000)
  if (dias <= 0) return 'Publicada hoy'
  if (dias === 1) return 'Publicada hace 1 día'
  if (dias < 7) return `Publicada hace ${dias} días`
  const semanas = Math.floor(dias / 7)
  if (semanas < 5) return semanas === 1 ? 'Publicada hace 1 semana' : `Publicada hace ${semanas} semanas`
  return `Publicada el ${new Date(fechaIso).toLocaleDateString('es-MX')}`
}

// Quita acentos y mayúsculas para que «cajero» encuentre «Cajero(a)» y «atencion» encuentre «Atención».
export function normalizar(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

export function telefonoParaEnlace(telefono) {
  return String(telefono ?? '').replace(/[^\d+]/g, '')
}
