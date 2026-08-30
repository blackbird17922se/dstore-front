export interface MovimientoInventarioResponse {
    id: number,
    idExistencia: number,
    idProducto: number,
    nombreProducto: string,
    tipo: string,
    cantidad: number,
    fechaMovimiento: string,
    tipoOrigen: string,
    idOrigen: number,
    observacion :string | null
}