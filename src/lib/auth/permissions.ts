import type { RolUsuario } from '@/lib/supabase/types'

type Modulo = 'vehiculos' | 'operadores' | 'cargas' | 'compras' | 'vales' | 'usuarios'
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
}

export function puede(rol: RolUsuario, modulo: Modulo, accion: Accion): boolean {
  return PERMISOS[modulo][accion].includes(rol)
}