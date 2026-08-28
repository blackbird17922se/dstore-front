import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { MarcaModel } from "../models/marca.model";
import { Observable } from "rxjs/internal/Observable";

@Injectable({ providedIn: 'root' })
export class MarcaService {
    private apiUrl = `${environment.apiUrl}/marcas`;

    constructor(private http: HttpClient) {}

    getAll(): Observable<MarcaModel[]> {
        return this.http.get<MarcaModel[]>(this.apiUrl);
    }

    create(Marca: MarcaModel): Observable<MarcaModel> {
        return this.http.post<MarcaModel>(this.apiUrl, Marca);
    }

    update(Marca: MarcaModel): Observable<MarcaModel> {
        return this.http.put<MarcaModel>(`${this.apiUrl}/${Marca.id}`, Marca);
    }

    cambiarEstado(
        id: number,
        activo: boolean
    ): Observable<MarcaModel> {

        return this.http.patch<MarcaModel>(
            `${this.apiUrl}/${id}/estado`,
            { activo }
        );
    }
}