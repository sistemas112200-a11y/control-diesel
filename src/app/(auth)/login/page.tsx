import { Fuel, Route, AlertTriangle, BarChart3, ArrowRight } from 'lucide-react'
import { login } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-3xl flex rounded-xl overflow-hidden border border-slate-200 shadow-sm">
        <div className="hidden md:flex flex-col justify-between flex-[1.3] bg-slate-900 text-white p-8">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center">
              <Fuel className="w-4 h-4 text-slate-900" />
            </div>
            <span className="text-sm font-medium">Control de Diésel</span>
          </div>

          <div>
            <h2 className="text-2xl font-medium leading-snug mb-2">
              Control total<br />de tu flota
            </h2>
            <p className="text-sm text-slate-400">
              Trazabilidad de cada litro, de la compra al kilómetro recorrido.
            </p>
          </div>

          <ul className="space-y-3">
            <li className="flex items-center gap-2 text-sm text-slate-300">
              <Route className="w-4 h-4 text-brand shrink-0" />
              Rendimiento por unidad en tiempo real
            </li>
            <li className="flex items-center gap-2 text-sm text-slate-300">
              <AlertTriangle className="w-4 h-4 text-brand shrink-0" />
              Alertas automáticas de posible robo
            </li>
            <li className="flex items-center gap-2 text-sm text-slate-300">
              <BarChart3 className="w-4 h-4 text-brand shrink-0" />
              Reportes financieros por terminal
            </li>
          </ul>
        </div>

        <div className="flex-1 bg-white p-8 flex flex-col justify-center">
          <h1 className="text-lg font-semibold text-slate-900 mb-1">Bienvenido de vuelta</h1>
          <p className="text-sm text-slate-500 mb-6">Inicia sesión para continuar</p>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <form action={login} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Correo
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium py-2 transition-colors flex items-center justify-center gap-2"
            >
              Iniciar sesión
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}