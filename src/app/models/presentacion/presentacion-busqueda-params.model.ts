/** Petición para el listado administrativo paginado de Presentaciones. */
export interface PresentacionBusquedaParams {
  nombre: string;
  activo: boolean | null;
  page: number;
  size: number;
  ordenarPor: 'nombre';
  direccion: 'asc' | 'desc';
}
