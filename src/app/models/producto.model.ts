export interface MarcaModel {
  id: number;
  nombre?: string; // opcional si quieres mostrarlo en el select
}

export interface PresentacionModel {
  id: number;
  nombre?: string;
}

export interface TipoProductoModel {
  id: number;
  nombre?: string;
}

export interface ProductoModel {
  id: number | null;
  codigoBarras: string;
  nombre: string;
  descripcion: string;
  iva: number;
  precio: number;
  tipoProducto: TipoProductoModel;
  presentacion: PresentacionModel;
  marca: MarcaModel;
}
