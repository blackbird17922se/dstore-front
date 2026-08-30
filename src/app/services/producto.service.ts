import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { ProductoModel } from "../models/producto/producto.model";
import { Observable } from "rxjs";
import { ProductoConStockModel } from "../models/ProductoConStock.model";
import { ProductoRequest } from "../models/producto/producto-request.model";
import { ProductoResponse } from "../models/producto/producto-response.model";

@Injectable({ providedIn: 'root' })
export class ProductoService {
    private apiUrl = `${environment.apiUrl}/productos`;

    constructor(private http: HttpClient) {}

    getAll(): Observable<ProductoModel[]> {
        return this.http.get<ProductoModel[]>(this.apiUrl);
    }

    create(request: ProductoRequest): Observable<ProductoModel> {
        return this.http.post<ProductoModel>(this.apiUrl, request);
    }

    update(id: number, request: ProductoRequest): Observable<ProductoModel> {
        return this.http.put<ProductoModel>(`${this.apiUrl}/${id}`, request);
    }

    cambiarEstado(id: number, activo: boolean): Observable<ProductoModel>{

        return this.http.patch<ProductoModel>(
            `${this.apiUrl}/${id}/estado`,
            { activo }
        );
    }

    getAllConStock(): Observable<ProductoConStockModel[]> {
        return this.http.get<ProductoConStockModel[]>(this.apiUrl);
    }

    listarProductosActivos(): Observable<ProductoModel[]>{
        return this.http.get<ProductoModel[]>(`${this.apiUrl}/activos`,)
    }

}