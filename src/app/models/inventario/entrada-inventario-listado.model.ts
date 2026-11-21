/** Cabecera de una entrada; el detalle completo se consulta por ID. */
export interface EntradaInventarioListado {
  id: number;
  fechaEntrada: string;
  fechaRegistro: string;
  numeroDocumento: string | null;
  observacion: string | null;
}
