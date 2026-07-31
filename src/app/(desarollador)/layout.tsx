import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogOut } from 'lucide-react'
import { logoutAction } from '@/lib/auth/actions'

export default async function DesarrolladorLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('usuarios')
    .select('nombre_completo, rol')
    .eq('id', user.id)
    .single()

  if (!perfil || perfil.rol !== 'desarrollador') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="h-14 border-b border-slate-200 bg-slate-900 flex items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <span className="text-white font-semibold text-sm">FlotaTotal — Panel de desarrollador</span>
          <nav className="flex items-center gap-4">
            <Link href="/desarrollador" className="text-slate-300 hover:text-white text-sm transition-colors">
              Empresas
            </Link>
            <Link href="/desarrollador/avisos" className="text-slate-300 hover:text-white text-sm transition-colors">
              Avisos
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-300 text-sm">{perfil.nombre_completo}</span>
          <form action={logoutAction}>
            <button type="submit" title="Cerrar sesión" className="flex items-center gap-1 rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </header>
      <main className="p-6 max-w-5xl mx-auto">{children}</main>
    </div>
  )
}