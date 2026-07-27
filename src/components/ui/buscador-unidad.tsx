'use client'

import { useState, useRef, useEffect } from 'react'

type Opcion = { id: string; label: string }

export function BuscadorUnidad({
  opciones,
  name,
  placeholder = 'Buscar unidad...',
  valorInicial,
}: {
  opciones: Opcion[]
  name: string
  placeholder?: string
  valorInicial?: string
}) {
  const opcionInicial = opciones.find((o) => o.id === valorInicial)
  const [texto, setTexto] = useState(opcionInicial?.label ?? '')
  const [seleccionId, setSeleccionId] = useState(opcionInicial?.id ?? '')
  const [abierto, setAbierto] = useState(false)
  const contenedorRef = useRef<HTMLDivElement>(null)

  const filtradas =
    texto.trim() === ''
      ? opciones
      : opciones.filter((o) => o.label.toLowerCase().includes(texto.toLowerCase()))

  useEffect(() => {
    function alClickFuera(e: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierto(false)
      }
    }
    document.addEventListener('mousedown', alClickFuera)
    return () => document.removeEventListener('mousedown', alClickFuera)
  }, [])

  return (
    <div ref={contenedorRef} className="relative">
      <input type="hidden" name={name} value={seleccionId} />
      <input
        type="text"
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value)
          setSeleccionId('')
          setAbierto(true)
        }}
        onFocus={() => setAbierto(true)}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
      />
      {abierto && (
        <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg">
          {filtradas.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-400">Sin resultados</div>
          ) : (
            filtradas.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  setTexto(o.label)
                  setSeleccionId(o.id)
                  setAbierto(false)
                }}
                className="block w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
              >
                {o.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}