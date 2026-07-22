'use client'

import { useRef, useState } from 'react'

export function FirmaPad({ name }: { name: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dibujando = useRef(false)
  const [dataUrl, setDataUrl] = useState('')

  function obtenerPosicion(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    if ('touches' in e) {
      const touch = e.touches[0]
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top }
    }
    const evento = e as React.MouseEvent
    return { x: evento.clientX - rect.left, y: evento.clientY - rect.top }
  }

  function iniciar(e: React.MouseEvent | React.TouchEvent) {
    dibujando.current = true
    const ctx = canvasRef.current!.getContext('2d')!
    const { x, y } = obtenerPosicion(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  function mover(e: React.MouseEvent | React.TouchEvent) {
    if (!dibujando.current) return
    e.preventDefault()
    const ctx = canvasRef.current!.getContext('2d')!
    const { x, y } = obtenerPosicion(e)
    ctx.lineTo(x, y)
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 2
    ctx.stroke()
  }

  function terminar() {
    if (!dibujando.current) return
    dibujando.current = false
    setDataUrl(canvasRef.current!.toDataURL('image/png'))
  }

  function limpiar() {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setDataUrl('')
  }

  return (
    <div>
      <input type="hidden" name={name} value={dataUrl} />
      <canvas
        ref={canvasRef}
        width={400}
        height={150}
        className="w-full border border-slate-300 rounded-md bg-white touch-none"
        onMouseDown={iniciar}
        onMouseMove={mover}
        onMouseUp={terminar}
        onMouseLeave={terminar}
        onTouchStart={iniciar}
        onTouchMove={mover}
        onTouchEnd={terminar}
      />
      <div className="flex items-center justify-between mt-1">
        <p className="text-xs text-slate-500">Firma aquí con el dedo o el mouse</p>
        <button type="button" onClick={limpiar} className="text-xs font-medium text-brand-dark hover:underline">
          Borrar firma
        </button>
      </div>
    </div>
  )
}