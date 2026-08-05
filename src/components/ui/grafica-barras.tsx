export function GraficaBarras({
  datos,
  formatoValor = (v: number) => v.toLocaleString('es-MX'),
  color = '#378add',
}: {
  datos: { etiqueta: string; valor: number }[]
  formatoValor?: (v: number) => string
  color?: string
}) {
  if (datos.length === 0) {
    return <p className="text-sm text-slate-400 py-8 text-center">Sin datos para mostrar.</p>
  }

  const max = Math.max(...datos.map((d) => d.valor), 1)
  const alturaGrafica = 160
  const anchoBarra = 100 / datos.length

  return (
    <div className="w-full">
      <svg viewBox={`0 0 100 ${alturaGrafica}`} className="w-full" style={{ height: 180 }} preserveAspectRatio="none">
        {datos.map((d, i) => {
          const alturaBarra = (d.valor / max) * alturaGrafica
          const x = i * anchoBarra
          const y = alturaGrafica - alturaBarra
          return (
            <rect
              key={i}
              x={x + anchoBarra * 0.15}
              y={y}
              width={anchoBarra * 0.7}
              height={alturaBarra}
              fill={color}
              rx="1"
            />
          )
        })}
      </svg>
      <div className="flex mt-1">
        {datos.map((d, i) => (
          <div key={i} className="text-center" style={{ width: `${anchoBarra}%` }}>
            <p className="text-[10px] text-slate-500 truncate px-0.5">{d.etiqueta}</p>
            <p className="text-[10px] font-medium text-slate-700 truncate px-0.5">{formatoValor(d.valor)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}