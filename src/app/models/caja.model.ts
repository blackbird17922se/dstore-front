export interface CajaModel {
  cliente: string | null;
  productos: {
    idProducto: number;
    cantidad: number;
  }[];
}

