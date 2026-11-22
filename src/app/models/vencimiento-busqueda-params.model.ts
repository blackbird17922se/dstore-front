import { EstadoVencimiento } from './vencimiento-alerta.model';

/** Campos de orden permitidos por ExistenciaProductoService.CAMPOS_ORDEN_ALERTAS. */
export type OrdenAlerta = 'id' | 'producto.nombre' | 'cantidad' | 'numeroLote' | 'fechaVencimiento' | 'fechaIngreso';

export interface VencimientoBusquedaParams {
  texto: string;
  idProducto: number | null;
  estado: EstadoVencimiento | '';
  dias: number;
  vencimientoDesde: string;
  vencimientoHasta: string;
  page: number;
  size: number;
  ordenarPor: OrdenAlerta;
  direccion: 'asc' | 'desc';
}
