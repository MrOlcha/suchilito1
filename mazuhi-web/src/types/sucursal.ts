export interface Sucursal {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  horario: string;
  ciudad: string;
  estado: string;
  codigo_postal: string;
  imagen_url?: string;
  activa: boolean;
}

export interface SucursalFilters {
  ciudad?: string;
  estado?: string;
  activa?: boolean;
}