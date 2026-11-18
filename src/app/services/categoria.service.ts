import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CategoriaModel } from "../models/categoria.model";
import { CategoriaBusquedaParams } from "../models/categoria-busqueda-params";
import { PageResponse } from "../models/common/page-response.model";
import { crearPaginacionHttpParams } from "../shared/utils/paginacion-http-params";


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
    

    getPaginados(
        filtros: CategoriaBusquedaParams
    ): Observable<PageResponse<CategoriaModel>> {

        let params = crearPaginacionHttpParams(filtros);

        const nombre = filtros.nombre.trim();

        if (nombre) {
            params = params.set('nombre', nombre);
        }

        if (filtros.activo !== null) {
            params = params.set('activo', filtros.activo);
        }

        return this.http.get<PageResponse<CategoriaModel>>(
            `${this.apiUrl}/paginadas`,
            { params }
        );
    }
}
