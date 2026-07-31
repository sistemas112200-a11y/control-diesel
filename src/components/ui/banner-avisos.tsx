import type { Aviso } from '@/lib/supabase/types'

const ESTILO: Record<string, string> = {
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  advertencia: 'bg-amber-50 border-amber-200 text-amber-800',
  critica: 'bg-red-50 border-red-200 text-red-800',
}

const ICONO: Record<string, string> = {
  info: 'ℹ️',
  advertencia: '⚠️',
  critica: '🚨',
}

export function BannerAvisos({ avisos }: { avisos: Aviso[] }) {
  if (avisos.length === 0) return null

  return (
    <div className="space-y-2">
      {avisos.map((a) => (
        <div key={a.id} className={`rounded-md border px-4 py-3 text-sm ${ESTILO[a.tipo]}`}>
          <span className="mr-2">{ICONO[a.tipo]}</span>
          {a.mensaje}
        </div>
      ))}
    </div>
  )
}