'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { agregarProductoAction } from '@/app/(dashboard)/almacen/salidas/[id]/actions'

declare global {
  interface Window {
    BarcodeDetector?: any
  }
}

export function EscanerProducto({ salidaId }: { salidaId: string }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [codigo, setCodigo] = useState('')
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)
  const [isPending, startTransition] = useTransition()
  const [camaraAbierta, setCamaraAbierta] = useState(false)
  const [camaraSoportada, setCamaraSoportada] = useState(false)

  useEffect(() => {
    inputRef.current?.focus()
    setCamaraSoportada(typeof window !== 'undefined' && 'BarcodeDetector' in window)
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  function procesarCodigo(valor: string) {
    const limpio = valor.trim()
    if (!limpio) return
    startTransition(async () => {
      const resultado = await agregarProductoAction(salidaId, limpio)
      if (resultado.ok) {
        setMensaje({ tipo: 'ok', texto: `Agregado: ${resultado.nombre}` })
      } else {
        setMensaje({ tipo: 'error', texto: resultado.mensaje })
      }
      setCodigo('')
      inputRef.current?.focus()
    })
  }

  function alPresionarTecla(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      procesarCodigo(codigo)
    }
  }

  async function abrirCamara() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      setCamaraAbierta(true)
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
          escanearFrame()
        }
      }, 100)
    } catch {
      setMensaje({ tipo: 'error', texto: 'No se pudo abrir la cámara. Revisa los permisos del navegador.' })
    }
  }

  function cerrarCamara() {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setCamaraAbierta(false)
  }

  function escanearFrame() {
    if (!videoRef.current || !window.BarcodeDetector) return
    const detector = new window.BarcodeDetector({
      formats: ['code_128', 'ean_13', 'ean_8', 'upc_a', 'upc_e'],
    })

    const intervalo = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) return
      try {
        const codigos = await detector.detect(videoRef.current)
        if (codigos.length > 0) {
          clearInterval(intervalo)
          cerrarCamara()
          procesarCodigo(codigos[0].rawValue)
        }
      } catch {
        // sigue intentando en el próximo intervalo
      }
    }, 400)

    streamRef.current?.getTracks()[0]?.addEventListener('ended', () => clearInterval(intervalo))
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Escanear producto</p>

      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          onKeyDown={alPresionarTecla}
          disabled={isPending}
          placeholder="Escanea con tu lector o escribe el código y da Enter"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          autoComplete="off"
        />
        {camaraSoportada && (
          <button
            type="button"
            onClick={camaraAbierta ? cerrarCamara : abrirCamara}
            className="rounded-md border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium px-3 py-2 transition-colors whitespace-nowrap"
          >
            {camaraAbierta ? 'Cerrar cámara' : '📷 Usar cámara'}
          </button>
        )}
      </div>

      {!camaraSoportada && (
        <p className="text-xs text-slate-400">
          Tu navegador no soporta escaneo con cámara — usa un lector físico o escribe el código manualmente.
        </p>
      )}

      {camaraAbierta && (
        <div className="rounded-md overflow-hidden border border-slate-200">
          <video ref={videoRef} className="w-full" muted playsInline />
        </div>
      )}

      {mensaje && (
        <p className={`text-sm ${mensaje.tipo === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
          {mensaje.texto}
        </p>
      )}
    </div>
  )
}