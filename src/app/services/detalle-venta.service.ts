import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { VentaDetalleModel } from "../models/ventaDetalle.model";

@Injectable({ providedIn: 'root' })
export class DetalleVentaService {
    private apiUrl = `${environment.apiUrl}/detalle-venta`;

    constructor(private http: HttpClient) {}

    obtenerDetalleVenta(id: number) {
        return this.http.get<VentaDetalleModel>(
            `${this.apiUrl}/${id}`
        );
    }
}