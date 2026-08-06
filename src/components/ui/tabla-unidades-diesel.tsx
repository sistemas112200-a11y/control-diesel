'use client'

import { useMemo, useState } from 'react'

interface FilaUnidad {
  vehiculoId: string
  unidad: string
  litros: number
  gasto: number
  rendimientoPromedio: number | null
}

type Columna = 'unidad' | 'litros' | 'gasto' | 'rendimiento'

function formatoLitros(v: number) {
  return `${v.toLocaleString('es-MX', { maximumFractionDigits: 0 })} L`
}

function formatoDinero(v: number) {
  return `$${v.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`
}

export function TablaUnidadesDiesel({ datos }: { datos: FilaUnidad[] }) {
  const [columna, setColumna] = useState<Columna>('unidad')
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
      if (columna === 'unidad') {
        comparacion = a.unidad.localeCompare(b.unidad, undefined, { numeric: true })
      } else if (columna === 'litros') {
        comparacion = a.litros - b.litros
      } else if (columna === 'gasto') {
        comparacion = a.gasto - b.gasto
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
          <Encabezado col="unidad" etiqueta="Unidad" />
          <Encabezado col="litros" etiqueta="Litros" alinear="right" />
          <Encabezado col="gasto" etiqueta="Gasto" alinear="right" />
          <Encabezado col="rendimiento" etiqueta="Rendimiento" alinear="right" />
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {datosOrdenados.length === 0 ? (
          <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">Sin datos.</td></tr>
        ) : (
          datosOrdenados.map((u) => (
            <tr key={u.vehiculoId}>
              <td className="px-4 py-2 font-medium text-slate-900">{u.unidad}</td>
              <td className="px-4 py-2 text-right text-slate-600">{formatoLitros(u.litros)}</td>
              <td className="px-4 py-2 text-right text-slate-600">{formatoDinero(u.gasto)}</td>
              <td className="px-4 py-2 text-right text-slate-600">
                {u.rendimientoPromedio != null ? `${u.rendimientoPromedio.toFixed(2)} km/L` : '—'}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  )
}