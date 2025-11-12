export interface LoteModel {
  id: number | null;
  stock: number;
  vencimiento: Date;
  idProducto: number;
  idProveedor: number;
}
