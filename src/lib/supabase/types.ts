export type RolUsuario = 'administrador' | 'supervisor' | 'capturista' | 'operador' | 'contabilidad' | 'auditor'
export type EstadoVehiculo = 'activo' | 'taller' | 'baja'
export type EstadoVale = 'pendiente' | 'autorizado' | 'usado' | 'cancelado'
export type MetodoPago = 'efectivo' | 'tarjeta_empresa' | 'transferencia' | 'credito_proveedor' | 'vale'
export type TipoAlerta =
  | 'rendimiento_bajo' | 'carga_duplicada' | 'litros_fuera_rango'
  | 'consumo_excesivo' | 'sin_movimiento' | 'ticket_repetido' | 'posible_robo'
  | 'mantenimiento_vencido'
export type SeveridadAlerta = 'info' | 'advertencia' | 'critica'
export type EstadoAlerta = 'nueva' | 'revisada' | 'descartada'
export type TipoMantenimiento = 'preventivo' | 'correctivo'
export type EstadoReporte = 'abierto' | 'en_proceso' | 'resuelto'

export interface Empresa {
  id: string
  nombre: string
  rfc: string | null
  created_at: string
  updated_at: string
}

export interface Terminal {
  id: string
  empresa_id: string
  nombre: string
  ubicacion: string | null
  created_at: string
  updated_at: string
}

export interface Usuario {
  id: string
  nombre_completo: string
  rol: RolUsuario
  empresa_id: string
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Proveedor {
  id: string
  empresa_id: string
  nombre: string
  rfc: string | null
  contacto: string | null
  telefono: string | null
  created_at: string
  updated_at: string
}

export interface Vehiculo {
  id: string
  empresa_id: string
  terminal_id: string
  numero_economico: string
  placas: string | null
  marca: string | null
  modelo: string | null
  anio: number | null
  tipo_combustible: string
  capacidad_tanque1_litros: number
  capacidad_tanque2_litros: number | null
  rendimiento_esperado_km_l: number
  estado: EstadoVehiculo
  foto_url: string | null
  km_actual: number
  intervalo_mantenimiento_km: number | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Operador {
  id: string
  empresa_id: string
  nombre_completo: string
  licencia_numero: string | null
  licencia_vigencia: string | null
  telefono: string | null
  direccion: string | null
  fecha_ingreso: string | null
  activo: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface ValeCombustible {
  id: string
  folio: string
  terminal_id: string
  vehiculo_id: string
  operador_id: string
  cantidad_autorizada_litros: number
  fecha: string
  estado: EstadoVale
  responsable_id: string | null
  evidencia_url: string | null
  created_at: string
  updated_at: string
}

export interface CompraDiesel {
  id: string
  empresa_id: string
  terminal_id: string
  proveedor_id: string
  numero_factura: string
  fecha: string
  cantidad_litros: number
  precio_unitario: number
  iva: number
  total: number
  forma_pago: MetodoPago
  factura_pdf_url: string | null
  factura_xml_url: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface CargaCombustible {
  id: string
  terminal_id: string
  vehiculo_id: string
  operador_id: string
  vale_id: string | null
  proveedor_id: string | null
  estacion_id: string | null
  fecha_hora: string
  kilometraje: number
  horometro: number | null
  litros_cargados: number
  precio_litro: number
  total_pagado: number
  metodo_pago: MetodoPago
  folio_ticket: string | null
  foto_ticket_url: string
  foto_kilometraje_url: string
  foto_bomba_url: string
  foto_tanque1_url: string
  foto_tanque2_url: string | null
  ubicacion_lat: number | null
  ubicacion_lng: number | null
  observaciones: string | null
  km_recorridos: number | null
  rendimiento_km_l: number | null
  costo_por_km: number | null
  created_by: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Alerta {
  id: string
  terminal_id: string
  tipo: TipoAlerta
  severidad: SeveridadAlerta
  estado: EstadoAlerta
  vehiculo_id: string | null
  operador_id: string | null
  carga_id: string | null
  descripcion: string
  responsable_id: string | null
  created_at: string
  updated_at: string
}

export interface Mantenimiento {
  id: string
  terminal_id: string
  vehiculo_id: string
  tipo: TipoMantenimiento
  descripcion: string
  kilometraje: number
  fecha: string
  intervalo_km: number | null
  intervalo_dias: number | null
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface ReporteUnidad {
  id: string
  terminal_id: string
  vehiculo_id: string
  descripcion: string
  estado: EstadoReporte
  tomado_por: string | null
  posible_falla: string | null
  solucion: string | null
  firma_url: string | null
  fecha_solucion: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface RefaccionReporte {
  id: string
  reporte_id: string
  terminal_id: string
  descripcion: string
  cantidad: number
  costo: number
  created_by: string | null
  created_at: string
}