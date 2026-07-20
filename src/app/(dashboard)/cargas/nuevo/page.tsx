import { createClient } from '@/lib/supabase/server'
import { getVehiculos } from '@/repositories/vehiculo.repository'
import { crearCargaAction } from './actions'

export default async function NuevaCargaPage() {
  const supabase = await createClient()
  const vehiculos = await getVehiculos(supabase)

  const { data: operadores } = await supabase
    .from('operadores')
    .select('id, nombre_completo')
    .is('deleted_at', null)
    .eq('activo', true)

  const { data: { user } } = await supabase.auth.getUser()
  const { data: terminal } = await supabase
    .from('usuario_terminales')
    .select('terminal_id')
    .eq('usuario_id', user!.id)
    .limit(1)
    .maybeSingle()

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-lg font-semibold text-slate-900">Nueva carga de combustible</h1>

      <form action={crearCargaAction} encType="multipart/form-data" className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <input type="hidden" name="terminal_id" value={terminal?.terminal_id ?? ''} />

        <div className="grid grid-cols-2 gap-4">
          <Select label="Unidad" name="vehiculo_id" required options={vehiculos.map((v) => ({ value: v.id, label: v.numero_economico }))} />
          <Select label="Operador" name="operador_id" required options={(operadores ?? []).map((o) => ({ value: o.id, label: o.nombre_completo }))} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Campo label="Kilometraje" name="kilometraje" type="number" required />
          <Campo label="Folio de ticket" name="folio_ticket" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Campo label="Litros cargados" name="litros_cargados" type="number" step="0.01" required />
          <Campo label="Precio por litro" name="precio_litro" type="number" step="0.01" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Método de pago</label>
          <select name="metodo_pago" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="tarjeta_empresa">Tarjeta empresa</option>
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="credito_proveedor">Crédito proveedor</option>
            <option value="vale">Vale</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Foto label="Foto del ticket" name="foto_ticket" required />
          <Foto label="Foto del kilometraje" name="foto_kilometraje" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Foto label="Foto de la bomba" name="foto_bomba" required />
          <Foto label="Foto del tanque 1" name="foto_tanque1" required />
        </div>
        <Foto label="Foto del tanque 2 (opcional)" name="foto_tanque2" />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones</label>
          <textarea name="observaciones" rows={2} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>

        <button type="submit" className="w-full rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium py-2 transition-colors">
          Guardar carga
        </button>
      </form>
    </div>
  )
}

function Campo({ label, name, type = 'text', required = false, step }: { label: string; name: string; type?: string; required?: boolean; step?: string }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input id={name} name={name} type={type} step={step} required={required} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
    </div>
  )
}

function Select({ label, name, required = false, options }: { label: string; name: string; required?: boolean; options: { value: string; label: string }[] }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <select id={name} name={name} required={required} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
        <option value="">Selecciona...</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

function Foto({ label, name, required = false }: { label: string; name: string; required?: boolean }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input id={name} name={name} type="file" accept="image/*" capture="environment" required={required} className="w-full text-sm" />
    </div>
  )
}