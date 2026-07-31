'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'

interface AlertaMantenimiento {
  id: string
  mensaje: string
  tipo: 'vencido' | 'proximo'
}

export function CampanitaNotificaciones({ alertas }: { alertas: AlertaMantenimiento[] }) {
  const [abierto, setAbierto] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="relative flex items-center justify-center rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        title="Notificaciones de mantenimiento"
      >
        <Bell className="w-4 h-4" />
        {alertas.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
            {alertas.length}
          </span>
        )}
      </button>

      {abierto && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setAbierto(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg z-20">
            <div className="px-4 py-2 border-b border-slate-100">
              <p className="text-sm font-medium text-slate-900">Notificaciones de mantenimiento</p>
            </div>
            {alertas.length === 0 ? (
              <p className="px-4 py-6 text-sm text-slate-500 text-center">No hay alertas por ahora.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {alertas.map((a) => (
                  <li key={a.id} className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium mb-1 ${
                        a.tipo === 'vencido' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {a.tipo === 'vencido' ? 'Vencido' : 'Se aproxima'}
                    </span>
                    <p className="text-sm text-slate-700">{a.mensaje}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}