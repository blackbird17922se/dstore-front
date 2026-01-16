import { DetalleVentaItemModel } from "./DetalleVentaItem.model";

export interface VentaDetalleModel {
  id: number;
  fecha: string;
  cliente: string | null;
  total: number;
  vendedor: string;
  estado: string;
  fechaAnulacion: string | null;
  motivoAnulacion: string | null;
  items: DetalleVentaItemModel[];
}
