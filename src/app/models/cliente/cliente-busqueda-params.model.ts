import { PaginacionParams } from '../common/paginacion-params';

/** Parámetros soportados por GET /api/v2/clientes/paginados. */
export type CampoOrdenCliente = 'nombresApellidos' | 'numeroDocumento' | 'fechaRegistro';

export interface ClienteBusquedaParams extends PaginacionParams<CampoOrdenCliente> {
  nombre: string;
  documento: string;
  activo: boolean | null;
}
