import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Observable } from "rxjs";
import { TarifaIvaModel } from "../models/tarifaIva.model";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class TarifaIvaService {

    private apiUrl = `${environment.apiUrl}/tarifas-iva`;

    constructor(private http: HttpClient) {}

    listarTarifas(): Observable<TarifaIvaModel[]>{
        return this.http.get<TarifaIvaModel[]>(this.apiUrl);
    }

    listarTarifasIvaActivas(): Observable<TarifaIvaModel[]>{
        return this.http.get<TarifaIvaModel[]>(`${this.apiUrl}/activas`);
    }
}