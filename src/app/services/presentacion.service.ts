import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { PresentacionModel } from "../models/presentacion.model";
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PresentacionService {

    private apiUrl = `${environment.apiUrl}/presentaciones`;

    constructor(private http: HttpClient) {}

    getAll(): Observable<PresentacionModel[]> {
        return this.http.get<PresentacionModel[]>(this.apiUrl);
    }

    create(presentacion: PresentacionModel): Observable<PresentacionModel> {
        return this.http.post<PresentacionModel>(
            this.apiUrl,
            presentacion
        );
    }

    update(presentacion: PresentacionModel): Observable<PresentacionModel> {
        return this.http.put<PresentacionModel>(
            `${this.apiUrl}/${presentacion.id}`,
            presentacion
        );
    }

    listarPresentacionesActivas(): Observable<PresentacionModel[]>{
        return this.http.get<PresentacionModel[]>(`${this.apiUrl}/activas`)
    }

    cambiarEstado(
        id: number,
        activo: boolean
    ): Observable<PresentacionModel> {

        return this.http.patch<PresentacionModel>(
        `${this.apiUrl}/${id}/estado`,
        { activo }
        );
    }
}