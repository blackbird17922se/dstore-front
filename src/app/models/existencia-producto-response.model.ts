export interface ExistenciaProductoResponse {
    id: number | null,
    idProducto: number | null,
    nombreProducto: string,
    cantidad: number,
    numeroLote: string,
    fechaVencimiento: string,
    fechaIngreso: string
}