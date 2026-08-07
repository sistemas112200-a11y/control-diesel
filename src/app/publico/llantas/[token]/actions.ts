'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getEnlacePorToken, guardarFirmaEnlace } from '@/repositories/enlace-publico-llanta.repository'

export async function guardarFirmaPublicaAction(token: string, formData: FormData) {
  try {
    const firmadoPor = (formData.get('firmado_por') as string)?.trim()
    const firmaDataUrl = formData.get('firma_url') as string

    if (!firmadoPor) return { ok: false as const, mensaje: 'Falta el nombre del operador.' }
    if (!firmaDataUrl) return { ok: false as const, mensaje: 'Falta la firma.' }

    const supabase = createAdminClient()
    await getEnlacePorToken(supabase, token)

    const base64 = firmaDataUrl.split(',')[1]
    const buffer = Buffer.from(base64, 'base64')
    const nombreArchivo = `${token}-${Date.now()}.png`

    const { error: errorSubida } = await supabase.storage
      .from('firmas-llantas')
      .upload(nombreArchivo, buffer, { contentType: 'image/png' })

    if (errorSubida) throw errorSubida

    const { data: urlPublica } = supabase.storage.from('firmas-llantas').getPublicUrl(nombreArchivo)

    await guardarFirmaEnlace(supabase, token, {
      firma_url: urlPublica.publicUrl,
      firmado_por: firmadoPor,
    })

    revalidatePath(`/publico/llantas/${token}`)
    return { ok: true as const }
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'No se pudo guardar la firma.'
    return { ok: false as const, mensaje }
  }
}