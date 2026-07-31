'use client'

import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    JsBarcode: any
  }
}

const SCRIPT_SRC = 'https://unpkg.com/jsbarcode@3.11.6/dist/JsBarcode.all.min.js'
const SCRIPT_ID = 'jsbarcode-cdn-script'

export function BarcodeLabel({ codigo, nombre }: { codigo: string; nombre: string }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [cargado, setCargado] = useState(false)
  const [error, setError] = useState(false)
  const [anchoMm, setAnchoMm] = useState(50)
  const [altoMm, setAltoMm] = useState(30)
  const [barraAlto, setBarraAlto] = useState(40)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.JsBarcode) {
      setCargado(true)
      return
    }

    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
    if (!script) {
      script = document.createElement('script')
      script.id = SCRIPT_ID
      script.src = SCRIPT_SRC
      script.async = true
      document.body.appendChild(script)
    }

    function alCargar() {
      setCargado(true)
    }
    function alFallar() {
      setError(true)
    }

    script.addEventListener('load', alCargar)
    script.addEventListener('error', alFallar)

    const intervalo = setInterval(() => {
      if (window.JsBarcode) {
        setCargado(true)
        clearInterval(intervalo)
      }
    }, 300)

    const limite = setTimeout(() => {
      if (!window.JsBarcode) setError(true)
      clearInterval(intervalo)
    }, 8000)

    return () => {
      script?.removeEventListener('load', alCargar)
      script?.removeEventListener('error', alFallar)
      clearInterval(intervalo)
      clearTimeout(limite)
    }
  }, [])

  useEffect(() => {
    if (cargado && svgRef.current && window.JsBarcode) {
      try {
        window.JsBarcode(svgRef.current, codigo, {
          format: 'CODE128',
          width: 2,
          height: barraAlto,
          displayValue: true,
          fontSize: 13,
          margin: 6,
        })
      } catch {
        setError(true)
      }
    }
  }, [cargado, codigo, barraAlto])

  return (
    <div className="space-y-5">
      <style>{`
        @media print {
          @page { size: ${anchoMm}mm ${altoMm}mm; margin: 0; }
          body { margin: 0; }
        }
      `}</style>

      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 print:hidden">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Medidas de la etiqueta</p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Ancho (mm)</label>
            <input
              type="number"
              value={anchoMm}
              onChange={(e) => setAnchoMm(Number(e.target.value) || 0)}
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Alto (mm)</label>
            <input
              type="number"
              value={altoMm}
              onChange={(e) => setAltoMm(Number(e.target.value) || 0)}
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Alto de barras (px)</label>
            <input
              type="number"
              value={barraAlto}
              onChange={(e) => setBarraAlto(Number(e.target.value) || 0)}
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
          </div>
        </div>
        <p className="text-xs text-slate-400">Ajusta las medidas según el tamaño de tus etiquetas y dale "Imprimir".</p>
      </div>

      <div className="flex justify-center print:block">
        <div
          className="border-2 border-slate-300 rounded-lg bg-white flex flex-col items-center justify-center px-3 py-4 print:border-0 print:rounded-none print:p-0"
          style={{ width: `${anchoMm}mm`, minHeight: `${altoMm}mm` }}
        >
          <p className="text-sm font-semibold text-slate-900 mb-1 text-center leading-tight">{nombre}</p>

          {error && (
            <p className="text-xs text-red-600 text-center px-2">
              No se pudo cargar el generador de código de barras. Revisa tu conexión a internet y recarga la página.
            </p>
          )}

          {!cargado && !error && (
            <p className="text-xs text-slate-400 text-center px-2">Generando código de barras…</p>
          )}

          <svg ref={svgRef} className="max-w-full"></svg>
        </div>
      </div>
    </div>
  )
}