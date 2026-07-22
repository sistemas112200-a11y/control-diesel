import { NextResponse } from 'next/server'
import PDFDocument from 'pdfkit'
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

  const doc = new PDFDocument({ margin: 50 })
  const chunks: Buffer[] = []
  doc.on('data', (chunk) => chunks.push(chunk))

  const pdfListo = new Promise<Buffer>((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)))
  })

  doc.fontSize(18).text('Reporte de unidad', { align: 'center' })
  doc.moveDown()

  doc.fontSize(12)
  doc.text(`Folio: ${reporte.folio}`)
  doc.text(`Unidad: ${reporte.vehiculos?.numero_economico ?? '—'}`)
  doc.text(`Operador que reporta: ${reporte.operadores?.nombre_completo ?? '—'}`)
  doc.text(`Fecha del reporte: ${new Date(reporte.created_at).toLocaleString('es-MX')}`)
  doc.text(`Estado: ${ESTADO_LABEL[reporte.estado]}`)
  doc.moveDown()

  doc.fontSize(13).text('Problema reportado', { underline: true })
  doc.fontSize(11).text(reporte.descripcion)
  doc.moveDown()

  if (reporte.posible_falla) {
    doc.fontSize(13).text('Posible falla', { underline: true })
    doc.fontSize(11).text(reporte.posible_falla)
    doc.moveDown()
  }

  if (reporte.solucion) {
    doc.fontSize(13).text('Falla reparada', { underline: true })
    doc.fontSize(11).text(reporte.solucion)
    doc.moveDown()
  }

  if (reporte.fecha_solucion) {
    doc.fontSize(11).text(`Fecha de solución: ${new Date(reporte.fecha_solucion).toLocaleString('es-MX')}`)
    doc.moveDown()
  }

  if (refacciones.length > 0) {
    doc.fontSize(13).text('Refacciones utilizadas', { underline: true })
    doc.moveDown(0.5)
    refacciones.forEach((r) => {
      doc.fontSize(11).text(
        `${r.descripcion} — Cantidad: ${r.cantidad} — Costo: $${r.costo.toFixed(2)} — Subtotal: $${(r.cantidad * r.costo).toFixed(2)}`
      )
    })
    doc.moveDown(0.5)
    doc.fontSize(12).text(`Total refacciones: $${totalRefacciones.toFixed(2)}`, { align: 'right' })
    doc.moveDown()
  }

  if (reporte.firma_url) {
    try {
      const base64Data = reporte.firma_url.split(',')[1]
      const imagenBuffer = Buffer.from(base64Data, 'base64')
      doc.fontSize(13).text('Firma del mecánico', { underline: true })
      doc.moveDown(0.5)
      doc.image(imagenBuffer, { width: 200 })
    } catch {
      doc.fontSize(11).text('(No se pudo incluir la firma)')
    }
  }

  doc.end()
  const pdfBuffer = await pdfListo

  return new NextResponse(new Blob([pdfBuffer], { type: 'application/pdf' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${reporte.folio}.pdf"`,
    },
  })
}