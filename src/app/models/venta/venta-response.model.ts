export interface VentaResponse {
  id: number;
  fecha: string;

  idCliente: number | null;
  nombreCliente: string | null;

  subtotal: number;
  valorIva: number;
  total: number;

  vendedor: string;

  estado: string;

  fechaAnulacion: string | null;
  motivoAnulacion: string | null;
}