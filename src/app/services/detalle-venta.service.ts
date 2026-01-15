import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/internal/Observable";
import { DetalleVentaModel } from "../models/detalle-venta.model";

@Injectable({ providedIn: 'root' })
export class DetalleVentaService {
    private apiUrl = `${environment.apiUrl}/detalle-venta`;

    constructor(private http: HttpClient) {}

    getByVentaId(idVenta: number): Observable<DetalleVentaModel[]> {
        return this.http.get<DetalleVentaModel[]>(`${this.apiUrl}/${idVenta}`);
    }
}