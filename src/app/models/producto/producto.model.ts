export interface MarcaModel {
  id: number;
  nombre?: string; // opcional si quieres mostrarlo en el select
}

export interface PresentacionModel {
  id: number;
  nombre?: string;
}

export interface CategoriaModel {
  id: number;
  nombre?: string;
}

export interface ProductoModel {
  controlaVencimiento: boolean;
  id: number | null;
  codigoBarras: string;
  nombre: string;
  descripcion: string;
  idTarifaIva: number | null;
  precio: number;
  stock: number;

  idPresentacion: number | null;
  nombrePresentacion: string;

  activo: boolean;
  porcentajeIva: number;
  nombreTarifaIva: string;

  idCategoria: number | null;
  nombreCategoria: string;

  idMarca: number | null;
  nombreMarca?: string;
}
