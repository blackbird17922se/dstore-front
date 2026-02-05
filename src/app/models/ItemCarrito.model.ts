import { ProductoConStockModel } from "./ProductoConStock.model";

export interface ItemCarrito {
  producto: ProductoConStockModel;
  cantidad: number;
}

