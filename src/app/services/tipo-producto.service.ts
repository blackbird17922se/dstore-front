import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { TipoProductoModel } from "../models/tipo-producto.model";


@Injectable({ providedIn: 'root' })
export class TipoProductoService {
    private apiUrl = `${environment.apiUrl}/categorias`;

    constructor(private http: HttpClient) { };

    getAll(): Observable<TipoProductoModel[]>{
        return this.http.get<TipoProductoModel[]>(this.apiUrl)
    }

    create(tipoProducto: TipoProductoModel): Observable<TipoProductoModel>{
        return this.http.post<TipoProductoModel>(this.apiUrl, tipoProducto);
    }

    update(tipoProducto: TipoProductoModel): Observable<TipoProductoModel>{
        return this.http.put<TipoProductoModel>(`${this.apiUrl}/${tipoProducto.id}`, tipoProducto);
    }

    delete(id: number): Observable<void>{
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
