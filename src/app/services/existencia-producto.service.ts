import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ExistenciaProductoResponse } from "../models/existencia-producto-response.model";

/** @author mauro a */
@Injectable({providedIn: 'root'})
export class ExistenciaProductoService {

    apiUrl = `${environment.apiUrl}/existencias`;

    constructor(private http: HttpClient) {};

    listarExistencias(): Observable<ExistenciaProductoResponse[]>{
        return this.http.get<ExistenciaProductoResponse[]>(this.apiUrl);
    }

    obtenerExistencia(id: number): Observable<ExistenciaProductoResponse>{
        return this.http.get<ExistenciaProductoResponse>(`${this.apiUrl}/${id}`);
    }

    listarPorProducto(idProducto: number): Observable<ExistenciaProductoResponse[]> {
        return this.http.get<ExistenciaProductoResponse[]>(`${this.apiUrl}/producto/${idProducto}`);
    }

    proximosAVencer(dias: number): Observable<ExistenciaProductoResponse[]> {

        return this.http.get<ExistenciaProductoResponse[]>(
            `${this.apiUrl}/proximas-vencer`,
            {
                params: {
                    dias: dias
                }
            }
        );
    }


}