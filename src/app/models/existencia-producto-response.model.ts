export interface ExistenciaProductoResponse {
    id: number,
    idProducto: number,
    nombreProducto: string,
    cantidad: number,
    numeroLote: string | null,
    fechaVencimiento: string | null,
    fechaIngreso: string
}