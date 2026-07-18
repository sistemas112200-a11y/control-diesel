import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('usuarios')
    .select('nombre_completo, rol, empresa_id')
    .eq('id', user.id)
    .single()

  const { data: terminal } = await supabase
    .from('usuario_terminales')
    .select('terminales(nombre)')
    .eq('usuario_id', user.id)
    .limit(1)
    .maybeSingle()

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 min-h-screen">
        <Header
          nombreCompleto={perfil?.nombre_completo ?? user.email ?? ''}
          rol={perfil?.rol ?? ''}
          terminalNombre={(terminal?.terminales as any)?.nombre ?? 'Todas las terminales'}
        />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}