import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { MovimientoInventarioResponse } from "../models/movimiento-inventario.model";

@Injectable({providedIn:'root'})
export class MovimientoInventarioService {

    private apiUrl = `${environment.apiUrl}/movimientos-inventario`;

    constructor( private http: HttpClient) {};

    listarPorProducto(id : number): Observable<MovimientoInventarioResponse[]>{
        return this.http.get<MovimientoInventarioResponse[]>(`${this.apiUrl}/producto/${id}`);
    }
}