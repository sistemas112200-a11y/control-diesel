const ZONA_HORARIA = 'America/Chihuahua'

export function formatoFechaHora(fecha: string) {
  return new Date(fecha).toLocaleString('es-MX', {
    timeZone: ZONA_HORARIA,
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatoFechaHoraCorta(fecha: string) {
  return new Date(fecha).toLocaleString('es-MX', {
    timeZone: ZONA_HORARIA,
    dateStyle: 'short',
    timeStyle: 'short',
  })
}