import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";

import { VentaRequest } from "../models/venta/venta-request.model";
import { VentaDetalleResponse } from "../models/venta/venta-detalle-response.model";
import { VentaResponse } from "../models/venta/venta-response.model";
import { Observable } from "rxjs";


@Injectable({ providedIn: 'root' })
export class VentaService {
    private apiUrl = `${environment.apiUrl}/ventas`;

    constructor(private http: HttpClient) {}

    registrarVenta(request: VentaRequest): Observable<{mensaje: string}>{
        return this.http.post<{mensaje: string}>(
            this.apiUrl,
            request
        );
    }

    listarVentas(): Observable<VentaResponse[]> {
        return this.http.get<VentaResponse[]>(this.apiUrl);
    }

    obtenerVentaPorId(id: number): Observable<VentaDetalleResponse> {
        return this.http.get<VentaDetalleResponse>(
        `${this.apiUrl}/${id}`
        );
    }

    anularVenta(id: number, motivo: string): Observable<VentaResponse> {
        return this.http.patch<VentaResponse>(
            `${this.apiUrl}/${id}/anular`, {motivo});
    }
}