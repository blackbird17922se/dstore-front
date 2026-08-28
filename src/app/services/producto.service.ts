import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { ProductoModel } from "../models/producto.model";
import { Observable } from "rxjs";
import { ProductoConStockModel } from "../models/ProductoConStock.model";

@Injectable({ providedIn: 'root' })
export class ProductoService {
    private apiUrl = `${environment.apiUrl}/productos`;

    constructor(private http: HttpClient) {}

    getAll(): Observable<ProductoModel[]> {
        return this.http.get<ProductoModel[]>(this.apiUrl);
    }

    create(Producto: ProductoModel): Observable<ProductoModel> {
        return this.http.post<ProductoModel>(this.apiUrl, Producto);
    }

    update(Producto: ProductoModel): Observable<ProductoModel> {
        return this.http.put<ProductoModel>(`${this.apiUrl}/${Producto.id}`, Producto);
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

}