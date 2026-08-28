import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CategoriaModel } from "../models/categoria.model";


@Injectable({ providedIn: 'root' })
export class CategoriaService {
    private apiUrl = `${environment.apiUrl}/categorias`;

    constructor(private http: HttpClient) { };

    getAll(): Observable<CategoriaModel[]>{
        return this.http.get<CategoriaModel[]>(this.apiUrl)
    }

    create(Categoria: CategoriaModel): Observable<CategoriaModel>{
        return this.http.post<CategoriaModel>(this.apiUrl, Categoria);
    }

    update(Categoria: CategoriaModel): Observable<CategoriaModel>{
        return this.http.put<CategoriaModel>(`${this.apiUrl}/${Categoria.id}`, Categoria);
    }

    cambiarEstado(
        id: number,
        activo: boolean
    ): Observable<CategoriaModel> {

        return this.http.patch<CategoriaModel>(
            `${this.apiUrl}/${id}/estado`,
            { activo }
        );
    }

    listarCategoriasActivas(): Observable<CategoriaModel[]>{
        return this.http.get<CategoriaModel[]>(`${this.apiUrl}/activas`)
    }
}
