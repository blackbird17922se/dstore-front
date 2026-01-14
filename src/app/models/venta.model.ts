export interface VentaModel{
    id: number | null;
    fecha: Date;
    cliente: string;
    total: number;
    vendedor: string;
}