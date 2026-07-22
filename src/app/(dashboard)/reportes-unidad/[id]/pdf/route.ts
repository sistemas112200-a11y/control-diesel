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

const AZUL_OSCURO: [number, number, number] = [15, 23, 42]
const AZUL: [number, number, number] = [29, 78, 216]
const GRIS_CLARO: [number, number, number] = [241, 245, 249]
const GRIS_TEXTO: [number, number, number] = [71, 85, 105]
const GRIS_SUAVE: [number, number, number] = [148, 163, 184]
const GRIS_BORDE: [number, number, number] = [226, 232, 240]
const BLANCO: [number, number, number] = [255, 255, 255]

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

  const doc = new jsPDF({ unit: 'mm', format: 'letter' })
  const margen = 16
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const anchoUtil = pageWidth - margen * 2
  let y = margen

  function nuevaPaginaSiNecesario(alturaNecesaria: number) {
    if (y + alturaNecesaria > pageHeight - margen - 10) {
      doc.addPage()
      y = margen
    }
  }

  // Encabezado
  const altoEncabezado = 24
  doc.setFillColor(...AZUL_OSCURO)
  doc.roundedRect(margen, y, anchoUtil, altoEncabezado, 3, 3, 'F')
  doc.setTextColor(...BLANCO)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('FlotaTotal', margen + 6, y + 11)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...GRIS_BORDE)
  doc.text('Reporte de unidad / orden de taller', margen + 6, y + 18)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  const folioAncho = doc.getTextWidth(reporte.folio) + 12
  doc.setFillColor(...BLANCO)
  doc.roundedRect(margen + anchoUtil - folioAncho - 6, y + altoEncabezado / 2 - 5, folioAncho, 10, 2, 2, 'F')
  doc.setTextColor(...AZUL_OSCURO)
  doc.text(reporte.folio, margen + anchoUtil - folioAncho / 2 - 6, y + altoEncabezado / 2 + 1.5, { align: 'center' })

  y += altoEncabezado + 6

  // Caja de datos generales
  const datos: [string, string][] = [
    ['Unidad', reporte.vehiculos?.numero_economico ?? '—'],
    ['Estado', ESTADO_LABEL[reporte.estado]],
    ['Operador que reporta', reporte.operadores?.nombre_completo ?? '—'],
    ['Fecha del reporte', new Date(reporte.created_at).toLocaleString('es-MX')],
  ]
  const altoCaja = 32
  doc.setFillColor(...GRIS_CLARO)
  doc.roundedRect(margen, y, anchoUtil, altoCaja, 3, 3, 'F')
  const colAncho = anchoUtil / 2
  datos.forEach(([label, valor], i) => {
    const col = i % 2
    const fila = Math.floor(i / 2)
    const x = margen + 6 + col * colAncho
    const yFila = y + 7 + fila * 14
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRIS_TEXTO)
    doc.text(label.toUpperCase(), x, yFila)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...AZUL_OSCURO)
    doc.text(valor, x, yFila + 5)
  })
  y += altoCaja + 8

  function tituloSeccion(texto: string) {
    doc.setDrawColor(...AZUL)
    doc.setLineWidth(1.2)
    doc.line(margen, y - 3.5, margen, y + 1.5)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...AZUL_OSCURO)
    doc.text(texto, margen + 4, y)
    y += 6
  }

  function parrafo(texto: string) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRIS_TEXTO)
    const lineas = doc.splitTextToSize(texto, anchoUtil)
    doc.text(lineas, margen, y)
    y += lineas.length * 5 + 6
  }

  tituloSeccion('Problema reportado')
  parrafo(reporte.descripcion)

  if (reporte.posible_falla) {
    tituloSeccion('Posible falla')
    parrafo(reporte.posible_falla)
  }

  if (reporte.solucion) {
    tituloSeccion('Falla reparada')
    parrafo(reporte.solucion)
    if (reporte.fecha_solucion) {
      doc.setFontSize(8)
      doc.setTextColor(...GRIS_SUAVE)
      doc.text(`Fecha de solución: ${new Date(reporte.fecha_solucion).toLocaleString('es-MX')}`, margen, y)
      y += 8
    }
  }

  if (refacciones.length > 0) {
    nuevaPaginaSiNecesario(20 + refacciones.length * 8)
    tituloSeccion('Refacciones utilizadas')

    const colDescripcion = margen
    const colCantidad = margen + 100
    const colCosto = margen + 130
    const colSubtotal = margen + anchoUtil - 3
    const altoFila = 8
    const inicioTabla = y

    doc.setFillColor(...AZUL_OSCURO)
    doc.rect(margen, y, anchoUtil, altoFila, 'F')
    doc.setTextColor(...BLANCO)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('Refacción', colDescripcion + 3, y + 5.5)
    doc.text('Cantidad', colCantidad, y + 5.5, { align: 'center' })
    doc.text('Costo unit.', colCosto, y + 5.5, { align: 'center' })
    doc.text('Subtotal', colSubtotal, y + 5.5, { align: 'right' })
    y += altoFila

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    refacciones.forEach((r, i) => {
      if (i % 2 === 1) {
        doc.setFillColor(...GRIS_CLARO)
        doc.rect(margen, y, anchoUtil, altoFila, 'F')
      }
      doc.setTextColor(...GRIS_TEXTO)
      doc.text(r.descripcion, colDescripcion + 3, y + 5.5)
      doc.text(String(r.cantidad), colCantidad, y + 5.5, { align: 'center' })
      doc.text(`$${r.costo.toFixed(2)}`, colCosto, y + 5.5, { align: 'center' })
      doc.text(`$${(r.cantidad * r.costo).toFixed(2)}`, colSubtotal, y + 5.5, { align: 'right' })
      y += altoFila
    })

    doc.setDrawColor(...GRIS_BORDE)
    doc.setLineWidth(0.3)
    doc.rect(margen, inicioTabla, anchoUtil, y - inicioTabla, 'S')

    y += 6
    doc.setDrawColor(...AZUL_OSCURO)
    doc.setLineWidth(0.5)
    doc.line(margen + 100, y, margen + anchoUtil, y)
    y += 5
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...AZUL_OSCURO)
    doc.text('Total refacciones:', margen + 100, y)
    doc.text(`$${totalRefacciones.toFixed(2)}`, margen + anchoUtil, y, { align: 'right' })
    y += 12
  }

  if (reporte.firma_url) {
    nuevaPaginaSiNecesario(40)
    tituloSeccion('Firma del mecánico')
    doc.setDrawColor(...GRIS_BORDE)
    doc.setLineWidth(0.3)
    doc.rect(margen, y, 70, 26, 'S')
    try {
      doc.addImage(reporte.firma_url, 'PNG', margen + 3, y + 3, 60, 20)
    } catch {
      doc.setFontSize(9)
      doc.setTextColor(...GRIS_TEXTO)
      doc.text('(No se pudo incluir la firma)', margen + 4, y + 14)
    }
    y += 32
  }

  doc.setDrawColor(...GRIS_BORDE)
  doc.setLineWidth(0.3)
  doc.line(margen, pageHeight - margen - 6, margen + anchoUtil, pageHeight - margen - 6)
  doc.setFontSize(7)
  doc.setTextColor(...GRIS_SUAVE)
  doc.text('Generado automáticamente por FlotaTotal', margen, pageHeight - margen - 2)

  const pdfArrayBuffer = doc.output('arraybuffer')

  return new NextResponse(pdfArrayBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${reporte.folio}.pdf"`,
    },
  })
}