import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { CajaModel } from "../models/caja.model";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class CajaService {
    private apiUrl = `${environment.apiUrl}/ventas`;

    constructor(private http: HttpClient) {}

    create(venta: CajaModel): Observable<{ mensaje: string }> {
        return this.http.post<{ mensaje: string }>(this.apiUrl, venta);
    }


}