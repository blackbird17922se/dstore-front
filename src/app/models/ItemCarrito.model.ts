import { ProductoModel } from "./producto/producto.model";

export interface ItemCarrito {
  producto: ProductoModel;
  cantidad: number;
}

