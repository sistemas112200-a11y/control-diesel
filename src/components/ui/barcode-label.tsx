'use client'

import { useEffect, useRef } from 'react'
import Script from 'next/script'

declare global {
  interface Window {
    JsBarcode: any
  }
}

export function BarcodeLabel({ codigo, nombre }: { codigo: string; nombre: string }) {
  const svgRef = useRef<SVGSVGElement>(null)

  function dibujar() {
    if (svgRef.current && window.JsBarcode) {
      window.JsBarcode(svgRef.current, codigo, {
        format: 'CODE128',
        width: 2,
        height: 60,
        displayValue: true,
        fontSize: 14,
        margin: 8,
      })
    }
  }

  useEffect(() => {
    dibujar()
  }, [codigo])

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/JsBarcode/3.11.5/JsBarcode.all.min.js"
        strategy="afterInteractive"
        onLoad={dibujar}
      />
      <div className="border border-slate-300 rounded-md p-4 inline-block bg-white print:border-0">
        <p className="text-sm font-medium text-slate-900 mb-2">{nombre}</p>
        <svg ref={svgRef}></svg>
      </div>
    </>
  )
}