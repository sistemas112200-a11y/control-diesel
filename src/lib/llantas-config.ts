export interface PosicionDefinicion {
  posicion: string
  etiqueta: string
}

export interface EjeLlantas {
  tipo: 'delantero' | 'trasero_doble' | 'trasero_sencillo'
  numero: number
  posiciones: PosicionDefinicion[]
}

export function generarEjes(numeroLlantas: number, tieneEjeDelantero: boolean): EjeLlantas[] {
  const ejes: EjeLlantas[] = []
  let restantes = numeroLlantas

  if (tieneEjeDelantero) {
    ejes.push({
      tipo: 'delantero',
      numero: 0,
      posiciones: [
        { posicion: 'delantera_izquierda', etiqueta: 'Delantera izquierda' },
        { posicion: 'delantera_derecha', etiqueta: 'Delantera derecha' },
      ],
    })
    restantes -= 2
  }

  let numEje = 1
  while (restantes >= 4) {
    ejes.push({
      tipo: 'trasero_doble',
      numero: numEje,
      posiciones: [
        { posicion: `trasera${numEje}_izquierda_externa`, etiqueta: `Trasera ${numEje} izquierda externa` },
        { posicion: `trasera${numEje}_izquierda_interna`, etiqueta: `Trasera ${numEje} izquierda interna` },
        { posicion: `trasera${numEje}_derecha_interna`, etiqueta: `Trasera ${numEje} derecha interna` },
        { posicion: `trasera${numEje}_derecha_externa`, etiqueta: `Trasera ${numEje} derecha externa` },
      ],
    })
    restantes -= 4
    numEje++
  }

  if (restantes === 2) {
    ejes.push({
      tipo: 'trasero_sencillo',
      numero: numEje,
      posiciones: [
        { posicion: `trasera${numEje}_izquierda`, etiqueta: `Trasera ${numEje} izquierda` },
        { posicion: `trasera${numEje}_derecha`, etiqueta: `Trasera ${numEje} derecha` },
      ],
    })
  }

  return ejes
}

export function generarPosiciones(numeroLlantas: number, tieneEjeDelantero: boolean): PosicionDefinicion[] {
  return generarEjes(numeroLlantas, tieneEjeDelantero).flatMap((eje) => eje.posiciones)
}

export function etiquetaPosicion(posicion: string | null): string {
  if (!posicion) return 'Sin posición'
  if (posicion === 'refaccion') return 'Refacción'
  if (posicion === 'otra') return 'Otra'
  if (posicion === 'delantera_izquierda') return 'Delantera izquierda'
  if (posicion === 'delantera_derecha') return 'Delantera derecha'

  const matchDual = posicion.match(/^trasera(\d+)_(izquierda|derecha)_(interna|externa)$/)
  if (matchDual) {
    const [, eje, lado, parte] = matchDual
    return `Trasera ${eje} ${lado} ${parte}`
  }

  const matchSencillo = posicion.match(/^trasera(\d+)_(izquierda|derecha)$/)
  if (matchSencillo) {
    const [, eje, lado] = matchSencillo
    return `Trasera ${eje} ${lado}`
  }

  return posicion
}