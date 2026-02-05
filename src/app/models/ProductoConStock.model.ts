export interface MarcaModel {
  id: number;
  nombre?: string; // opcional si quieres mostrarlo en el select
}

export interface PresentacionModel {
  id: number;
  nombre?: string;
}

export interface ProductoConStockModel {
  id: number;
  nombre: string;
  descripcion: string;
  codigoBarras: string;
  precio: number;
  presentacion: PresentacionModel;
  marca: MarcaModel;
  stock: number;
}
