'use client'

import { useMemo, useState } from 'react'
import { formatoRendimiento, type SistemaUnidades } from '@/lib/unidades'

interface FilaOperador {
  operadorId: string
  operador: string
  cargas: number
  rendimientoPromedio: number | null
}

type Columna = 'operador' | 'cargas' | 'rendimiento'

export function TablaOperadoresDiesel({ datos, unidadMedida }: { datos: FilaOperador[]; unidadMedida: SistemaUnidades }) {
  const [columna, setColumna] = useState<Columna>('operador')
  const [direccion, setDireccion] = useState<'asc' | 'desc'>('asc')

  function ordenarPor(col: Columna) {
    if (columna === col) {
      setDireccion((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setColumna(col)
      setDireccion('asc')
    }
  }

  const datosOrdenados = useMemo(() => {
    const copia = [...datos]
    copia.sort((a, b) => {
      let comparacion = 0
      if (columna === 'operador') {
        comparacion = a.operador.localeCompare(b.operador)
      } else if (columna === 'cargas') {
        comparacion = a.cargas - b.cargas
      } else {
        comparacion = (a.rendimientoPromedio ?? 0) - (b.rendimientoPromedio ?? 0)
      }
      return direccion === 'asc' ? comparacion : -comparacion
    })
    return copia
  }, [datos, columna, direccion])

  function Encabezado({ col, etiqueta, alinear = 'left' }: { col: Columna; etiqueta: string; alinear?: 'left' | 'right' }) {
    const activa = columna === col
    return (
      <th
        onClick={() => ordenarPor(col)}
        className={`px-4 py-2 cursor-pointer select-none hover:text-slate-700 ${alinear === 'right' ? 'text-right' : 'text-left'}`}
      >
        {etiqueta} {activa && (direccion === 'asc' ? '▲' : '▼')}
      </th>
    )
  }

  return (
    <table className="w-full text-sm">
      <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
        <tr>
          <Encabezado col="operador" etiqueta="Operador" />
          <Encabezado col="cargas" etiqueta="Cargas" alinear="right" />
          <Encabezado col="rendimiento" etiqueta="Rendimiento" alinear="right" />
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {datosOrdenados.length === 0 ? (
          <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-400">Sin datos.</td></tr>
        ) : (
          datosOrdenados.map((o) => (
            <tr key={o.operadorId}>
              <td className="px-4 py-2 font-medium text-slate-900">{o.operador}</td>
              <td className="px-4 py-2 text-right text-slate-600">{o.cargas}</td>
              <td className="px-4 py-2 text-right text-slate-600">
                {o.rendimientoPromedio != null ? formatoRendimiento(o.rendimientoPromedio, unidadMedida) : '—'}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  )
}