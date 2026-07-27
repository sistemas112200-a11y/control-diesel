import { NextResponse } from 'next/server'
import { jsPDF } from 'jspdf'
import { createClient } from '@/lib/supabase/server'
import { getPaseSalidaById } from '@/repositories/pase-salida.repository'
import { getUsuarioActual } from '@/lib/auth/session'

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
  const pase = await getPaseSalidaById(supabase, id)

  const doc = new jsPDF({ unit: 'mm', format: 'letter' })
  const margen = 16
  const pageWidth = doc.internal.pageSize.getWidth()
  const anchoUtil = pageWidth - margen * 2
  let y = margen

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
  doc.text('Pase de salida', margen + 6, y + 18)
  y += altoEncabezado + 6

  const datos: [string, string][] = [
    ['Unidad', pase.vehiculos?.numero_economico ?? '—'],
    ['Destino / ruta', pase.destino ?? '—'],
    ['Fecha y hora de salida', new Date(pase.created_at).toLocaleString('es-MX')],
  ]
  const altoCaja = 32
  doc.setFillColor(...GRIS_CLARO)
  doc.roundedRect(margen, y, anchoUtil, altoCaja, 3, 3, 'F')
  datos.forEach(([label, valor], i) => {
    const yFila = y + 7 + i * 8.5
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRIS_TEXTO)
    doc.text(label.toUpperCase(), margen + 6, yFila)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...AZUL_OSCURO)
    doc.text(valor, margen + 55, yFila)
  })
  y += altoCaja + 8

  doc.setDrawColor(...AZUL)
  doc.setLineWidth(1.2)
  doc.line(margen, y - 3.5, margen, y + 1.5)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...AZUL_OSCURO)
  doc.text('La unidad está disponible para salir a ruta', margen + 4, y)
  y += 14

  doc.setFontSize(11)
  doc.setTextColor(...AZUL_OSCURO)
  doc.text('Autorizaciones', margen, y)
  y += 6

  const firmas = [
    { nombre: pase.firma1_nombre, url: pase.firma1_url },
    { nombre: pase.firma2_nombre, url: pase.firma2_url },
    { nombre: pase.firma3_nombre, url: pase.firma3_url },
  ]

  const anchoFirma = (anchoUtil - 12) / 3
  firmas.forEach((f, i) => {
    const x = margen + i * (anchoFirma + 6)
    doc.setDrawColor(...GRIS_BORDE)
    doc.setLineWidth(0.3)
    doc.rect(x, y, anchoFirma, 32, 'S')
    if (f.url) {
      try {
        doc.addImage(f.url, 'PNG', x + 2, y + 2, anchoFirma - 4, 22)
      } catch {
        // si la firma no se pudo cargar, se deja el recuadro vacío
      }
    }
    doc.setFontSize(8)
    doc.setTextColor(...GRIS_TEXTO)
    doc.text(f.nombre ?? 'Sin firmar', x + anchoFirma / 2, y + 29, { align: 'center' })
  })
  y += 40

  doc.setDrawColor(...GRIS_BORDE)
  doc.setLineWidth(0.3)
  doc.line(margen, y, margen + anchoUtil, y)
  y += 5
  doc.setFontSize(7)
  doc.setTextColor(...GRIS_SUAVE)
  doc.text('Generado automáticamente por FlotaTotal', margen, y)

  const pdfArrayBuffer = doc.output('arraybuffer')

  return new NextResponse(pdfArrayBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="pase-salida-${pase.vehiculos?.numero_economico ?? pase.id}.pdf"`,
    },
  })
}