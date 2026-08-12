export type SistemaUnidades = 'metrico' | 'imperial'

const KM_POR_MILLA = 1.609344
const LITROS_POR_GALON = 3.785411784

export function kmAMillas(km: number): number {
  return km / KM_POR_MILLA
}

export function millasAKm(millas: number): number {
  return millas * KM_POR_MILLA
}

export function litrosAGalones(litros: number): number {
  return litros / LITROS_POR_GALON
}

export function galonesALitros(galones: number): number {
  return galones * LITROS_POR_GALON
}

// rendimiento_esperado_km_l -> MPG
export function kmLaMpg(kmPorLitro: number): number {
  return kmPorLitro * (LITROS_POR_GALON / KM_POR_MILLA)
}

export function mpgAKmL(mpg: number): number {
  return mpg * (KM_POR_MILLA / LITROS_POR_GALON)
}

export function formatoDistancia(km: number, unidad: SistemaUnidades, decimales = 0): string {
  if (unidad === 'imperial') {
    return `${kmAMillas(km).toLocaleString('en-US', { maximumFractionDigits: decimales })} mi`
  }
  return `${km.toLocaleString('es-MX', { maximumFractionDigits: decimales })} km`
}

export function formatoVolumen(litros: number, unidad: SistemaUnidades, decimales = 1): string {
  if (unidad === 'imperial') {
    return `${litrosAGalones(litros).toLocaleString('en-US', { maximumFractionDigits: decimales })} gal`
  }
  return `${litros.toLocaleString('es-MX', { maximumFractionDigits: decimales })} L`
}

export function formatoRendimiento(kmPorLitro: number, unidad: SistemaUnidades, decimales = 1): string {
  if (unidad === 'imperial') {
    return `${kmLaMpg(kmPorLitro).toFixed(decimales)} MPG`
  }
  return `${kmPorLitro.toFixed(decimales)} km/L`
}

export function formatoCostoPorDistancia(costoPorKm: number, unidad: SistemaUnidades): string {
  if (unidad === 'imperial') {
    return `$${(costoPorKm * KM_POR_MILLA).toFixed(2)}/mi`
  }
  return `$${costoPorKm.toFixed(2)}/km`
}

export const ETIQUETA_DISTANCIA: Record<SistemaUnidades, string> = { metrico: 'km', imperial: 'mi' }
export const ETIQUETA_VOLUMEN: Record<SistemaUnidades, string> = { metrico: 'L', imperial: 'gal' }
export const ETIQUETA_RENDIMIENTO: Record<SistemaUnidades, string> = { metrico: 'km/L', imperial: 'MPG' }