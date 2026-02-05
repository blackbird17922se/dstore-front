export interface ProveedorModel {
  id: number;
  nombre?: string; // opcional si quieres mostrarlo en el select
}

export interface ProductoModel {
  id: number;
  nombre?: string; // opcional si quieres mostrarlo en el select
}

export interface LoteModel {
  id: number | null;
  stock: number;
  fechaVencimiento: Date;
  producto: ProductoModel;
  proveedor: ProveedorModel;
}
