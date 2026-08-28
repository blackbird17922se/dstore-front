export interface ProductoResponse {
  id: number;
  codigoBarras: string | null;
  nombre: string;
  descripcion: string;
  precio: number;

  idMarca: number;
  nombreMarca: string;

  idCategoria: number;
  nombreCategoria: string;

  idPresentacion: number;
  nombrePresentacion: string;

  idTarifaIva: number;
  nombreTarifaIva: string;
  porcentajeIva: number;

  stock: number;
  activo: boolean;
  controlaVencimiento: boolean;
}