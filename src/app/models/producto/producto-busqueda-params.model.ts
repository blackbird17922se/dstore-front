/** Filtros soportados por GET /api/v2/productos/paginados. */
export type CampoOrdenProducto = 'nombre' | 'precio' | 'codigoBarras' | 'id';
export type DireccionOrden = 'asc' | 'desc';

export interface ProductoBusquedaParams {
  texto?: string;
  activo?: boolean | null;
  idCategoria?: number | null;
  idMarca?: number | null;
  idPresentacion?: number | null;
  page: number;
  size: number;
  ordenarPor: CampoOrdenProducto;
  direccion: DireccionOrden;
}
