import { NextResponse } from 'next/server'
import { jsPDF } from 'jspdf'
import { createClient } from '@/lib/supabase/server'
import { getReporteById, getRefaccionesPorReporte } from '@/repositories/reporte.repository'
import { getUsuarioActual } from '@/lib/auth/session'

const ESTADO_LABEL: Record<string, string> = {
  abierto: 'Abierto',
  en_proceso: 'En proceso',
  resuelto: 'Resuelto',
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const usuario = await getUsuarioActual()
  if (!usuario) {
    return new NextResponse('No autorizado', { status: 401 })
  }

  const { id } = await params
  const supabase = await createClient()
  const reporte = await getReporteById(supabase, id)
  const refacciones = await getRefaccionesPorReporte(supabase, id)
  const totalRefacciones = refacciones.reduce((suma, r) => suma + r.cantidad * r.costo, 0)

  const doc = new jsPDF()
  const margenIzquierdo = 20
  const anchoUtil = 170
  let y = 20

  doc.setFontSize(18)
  doc.text('Reporte de unidad', 105, y, { align: 'center' })
  y += 12

  doc.setFontSize(11)
  doc.text(`Folio: ${reporte.folio}`, margenIzquierdo, y); y += 7
  doc.text(`Unidad: ${reporte.vehiculos?.numero_economico ?? '—'}`, margenIzquierdo, y); y += 7
  doc.text(`Operador que reporta: ${reporte.operadores?.nombre_completo ?? '—'}`, margenIzquierdo, y); y += 7
  doc.text(`Fecha del reporte: ${new Date(reporte.created_at).toLocaleString('es-MX')}`, margenIzquierdo, y); y += 7
  doc.text(`Estado: ${ESTADO_LABEL[reporte.estado]}`, margenIzquierdo, y); y += 10

  function seccion(titulo: string, texto: string) {
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text(titulo, margenIzquierdo, y)
    y += 7
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    const lineas = doc.splitTextToSize(texto, anchoUtil)
    doc.text(lineas, margenIzquierdo, y)
    y += lineas.length * 6 + 6
  }

  seccion('Problema reportado', reporte.descripcion)

  if (reporte.posible_falla) {
    seccion('Posible falla', reporte.posible_falla)
  }

  if (reporte.solucion) {
    seccion('Falla reparada', reporte.solucion)
  }

  if (reporte.fecha_solucion) {
    doc.setFontSize(11)
    doc.text(`Fecha de solución: ${new Date(reporte.fecha_solucion).toLocaleString('es-MX')}`, margenIzquierdo, y)
    y += 10
  }

  if (refacciones.length > 0) {
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text('Refacciones utilizadas', margenIzquierdo, y)
    y += 7
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    refacciones.forEach((r) => {
      doc.text(
        `${r.descripcion} — Cantidad: ${r.cantidad} — Costo: $${r.costo.toFixed(2)} — Subtotal: $${(r.cantidad * r.costo).toFixed(2)}`,
        margenIzquierdo,
        y
      )
      y += 6
    })
    y += 2
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(`Total refacciones: $${totalRefacciones.toFixed(2)}`, margenIzquierdo + anchoUtil, y, { align: 'right' })
    doc.setFont('helvetica', 'normal')
    y += 12
  }

  if (reporte.firma_url) {
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text('Firma del mecánico', margenIzquierdo, y)
    y += 5
    doc.setFont('helvetica', 'normal')
    try {
      doc.addImage(reporte.firma_url, 'PNG', margenIzquierdo, y, 60, 25)
    } catch {
      doc.setFontSize(11)
      doc.text('(No se pudo incluir la firma)', margenIzquierdo, y + 5)
    }
  }

  const pdfArrayBuffer = doc.output('arraybuffer')

  return new NextResponse(pdfArrayBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${reporte.folio}.pdf"`,
    },
  })
}