import type { RolUsuario } from '@/lib/supabase/types'

type Modulo = 'vehiculos' | 'operadores' | 'mecanicos' | 'cargas' | 'compras' | 'vales' | 'usuarios' | 'alertas' | 'reportes_unidad' | 'pases_salida' | 'llantas'
type Accion = 'crear' | 'editar' | 'eliminar'

const PERMISOS: Record<Modulo, Record<Accion, RolUsuario[]>> = {
  vehiculos: {
    crear: ['administrador', 'supervisor'],
    editar: ['administrador', 'supervisor'],
    eliminar: ['administrador'],
  },
  operadores: {
    crear: ['administrador', 'supervisor'],
    editar: ['administrador', 'supervisor'],
    eliminar: ['administrador'],
  },
  mecanicos: {
    crear: ['administrador', 'supervisor'],
    editar: ['administrador', 'supervisor'],
    eliminar: ['administrador'],
  },
  cargas: {
    crear: ['administrador', 'supervisor', 'capturista', 'operador'],
    editar: ['administrador', 'supervisor'],
    eliminar: ['administrador'],
  },
  compras: {
    crear: ['administrador', 'supervisor', 'capturista'],
    editar: ['administrador', 'supervisor'],
    eliminar: ['administrador'],
  },
  vales: {
    crear: ['administrador', 'supervisor', 'capturista'],
    editar: ['administrador', 'supervisor'],
    eliminar: ['administrador'],
  },
  usuarios: {
    crear: ['administrador'],
    editar: ['administrador'],
    eliminar: ['administrador'],
  },
  alertas: {
    crear: ['administrador', 'supervisor'],
    editar: ['administrador', 'supervisor'],
    eliminar: ['administrador'],
  },
  reportes_unidad: {
    crear: ['administrador', 'supervisor', 'capturista', 'operador'],
    editar: ['administrador', 'supervisor'],
    eliminar: ['administrador'],
  },
  pases_salida: {
    crear: ['administrador', 'supervisor', 'guardia'],
    editar: ['administrador', 'supervisor'],
    eliminar: ['administrador'],
  },
  llantas: {
    crear: ['administrador', 'supervisor', 'capturista'],
    editar: ['administrador', 'supervisor'],
    eliminar: ['administrador'],
  },
}

export function puede(rol: RolUsuario, modulo: Modulo, accion: Accion): boolean {
  return PERMISOS[modulo][accion].includes(rol)
}

// --- Qué puede VER cada rol (menú y acceso directo a la pantalla) ---
// Nota: esto ya no se usa para el menú (ahora se controla desde Configuración → Permisos por rol),
// pero se deja vigente por si algo más lo sigue usando.

export type ModuloVista =
  | 'dashboard'
  | 'vehiculos'
  | 'operadores'
  | 'mecanicos'
  | 'cargas'
  | 'alertas'
  | 'reportes'
  | 'usuarios'
  | 'configuracion'
  | 'mantenimientos'
  | 'reportes_unidad'
  | 'pases_salida'
  | 'almacen'
  | 'dashboard_diesel'
  | 'llantas'

const VISTA_POR_ROL: Record<ModuloVista, RolUsuario[]> = {
  dashboard: ['administrador', 'supervisor', 'contabilidad', 'auditor'],
  vehiculos: ['administrador', 'supervisor', 'capturista', 'auditor'],
  operadores: ['administrador', 'supervisor', 'auditor'],
  mecanicos: ['administrador', 'supervisor'],
  cargas: ['administrador', 'supervisor', 'capturista', 'operador', 'contabilidad', 'auditor'],
  alertas: ['administrador', 'supervisor', 'auditor'],
  reportes: ['administrador', 'supervisor', 'contabilidad', 'auditor'],
  usuarios: ['administrador'],
  configuracion: ['administrador'],
  mantenimientos: ['administrador', 'supervisor', 'capturista', 'auditor'],
  reportes_unidad: ['administrador', 'supervisor'],
  pases_salida: ['administrador', 'supervisor', 'guardia'],
  almacen: ['administrador', 'supervisor', 'capturista', 'operador'],
  dashboard_diesel: ['administrador', 'supervisor', 'contabilidad'],
  llantas: ['administrador', 'supervisor', 'capturista', 'operador', 'auditor'],
}

export function puedeVer(rol: RolUsuario, modulo: ModuloVista): boolean {
  return VISTA_POR_ROL[modulo]?.includes(rol) ?? false
}

// --- Detalle de una carga (fotos, folio, observaciones) ---

const DETALLE_CARGAS_ROLES: RolUsuario[] = ['administrador', 'supervisor', 'capturista', 'contabilidad', 'auditor']

export function puedeVerDetalleCargas(rol: RolUsuario): boolean {
  return DETALLE_CARGAS_ROLES.includes(rol)
}