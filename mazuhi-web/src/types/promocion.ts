export interface Promocion {
  id: string
  nombre: string
  descripcion: string
  imagen_url?: string
  activa: boolean
  sucursal: boolean
  domicilio: boolean
}

export interface PromocionFilters {
  sucursal?: boolean
  domicilio?: boolean
  activa?: boolean
}