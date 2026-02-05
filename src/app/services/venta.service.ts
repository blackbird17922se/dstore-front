import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/internal/Observable";
import { VentaModel } from "../models/venta.model";

@Injectable({ providedIn: 'root' })
export class VentaService {
    private apiUrl = `${environment.apiUrl}/ventas`;

    constructor(private http: HttpClient) {}

    getAll(): Observable<VentaModel[]> {
        return this.http.get<VentaModel[]>(this.apiUrl);
    }

    anularVenta(id: number, motivo?: string): Observable<VentaModel> {
        return this.http.patch<VentaModel>(
            `${this.apiUrl}/${id}/anular`,
            motivo ? {motivo} : {});
    }
}