import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { getModulosVisibles } from '@/repositories/permiso.repository'
import { getMantenimientosVencidosYProximos } from '@/repositories/mantenimiento.repository'
import { estaVencido, estaProximo } from '@/lib/mantenimiento-estado'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('usuarios')
    .select('nombre_completo, rol, empresa_id')
    .eq('id', user.id)
    .single()

  if (!perfil) redirect('/login')

  if (perfil.rol === 'desarrollador') redirect('/desarrollador')

  const { data: terminal } = await supabase
    .from('usuario_terminales')
    .select('terminales(nombre)')
    .eq('usuario_id', user.id)
    .limit(1)
    .maybeSingle()

  const modulosVisibles = await getModulosVisibles(supabase, perfil.rol, perfil.empresa_id)

  let alertasMantenimiento: { id: string; mensaje: string; tipo: 'vencido' | 'proximo' }[] = []

  if (modulosVisibles.has('mantenimientos')) {
    const mantenimientos = await getMantenimientosVencidosYProximos(supabase)
    for (const m of mantenimientos) {
      if (!m.vehiculos) continue
      const kmActual = m.vehiculos.km_actual
      if (estaVencido(m, kmActual)) {
        alertasMantenimiento.push({
          id: m.id,
          mensaje: `${m.descripcion} — unidad ${m.vehiculos.numero_economico}`,
          tipo: 'vencido',
        })
      } else if (estaProximo(m, kmActual)) {
        alertasMantenimiento.push({
          id: m.id,
          mensaje: `${m.descripcion} — unidad ${m.vehiculos.numero_economico}`,
          tipo: 'proximo',
        })
      }
    }
  }

  return (
    <div className="flex">
      <Sidebar modulosVisibles={[...modulosVisibles]} />
      <div className="flex-1 min-h-screen">
        <Header
          nombreCompleto={perfil.nombre_completo ?? user.email ?? ''}
          rol={perfil.rol ?? ''}
          terminalNombre={(terminal?.terminales as any)?.nombre ?? 'Todas las terminales'}
          alertas={alertasMantenimiento}
        />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}