export interface ProductoRequest {
  codigoBarras: string | null;
  nombre: string;
  descripcion: string;
  precio: number;
  idMarca: number | null;
  idCategoria: number | null;
  idPresentacion: number | null;
  idTarifaIva: number | null;
  controlaVencimiento: boolean;
}