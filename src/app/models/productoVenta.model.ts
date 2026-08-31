export interface ProductoVenta {
  id: number;
  codigoBarras: string | null;
  nombre: string;
  precio: number;
  stockDisponible: number;
  controlaVencimiento: boolean;
}