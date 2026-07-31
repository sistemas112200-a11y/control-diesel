import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getProductoById } from '@/repositories/producto.repository'
import { BarcodeLabel } from '@/components/ui/barcode-label'
import { PrintButton } from '@/components/ui/print-button'

export default async function CodigoProductoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ nuevo?: string }>
}) {
  const { id } = await params
  const { nuevo } = await searchParams
  const supabase = await createClient()
  const producto = await getProductoById(supabase, id)

  return (
    <div className="max-w-md space-y-6">
      <Link href="/almacen/productos" className="text-sm text-slate-500 hover:text-slate-700 print:hidden">← Productos</Link>

      {nuevo === '1' && (
        <div className="rounded-md bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 print:hidden">
          Producto guardado correctamente.
        </div>
      )}

      <h1 className="text-lg font-semibold text-slate-900">Código de barras</h1>
      <p className="text-sm text-slate-500 print:hidden">Imprime esta etiqueta y pégala en el producto.</p>

      <BarcodeLabel codigo={producto.codigo} nombre={producto.nombre} />

      <PrintButton />
    </div>
  )
}