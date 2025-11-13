export interface VentaModel {
  id: number | null;
  fecha: Date;
  cliente: string;
  total: number;
  subtotal: number;
  ivaTotal: number;
  idVendedor: number;
}
