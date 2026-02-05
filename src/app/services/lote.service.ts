import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { LoteModel } from "../models/lote.model";
import { Observable } from "rxjs/internal/Observable";

@Injectable({ providedIn: 'root' })
export class LoteService {
    private apiUrl = `${environment.apiUrl}/lotes`;

    constructor(private http: HttpClient) {}

    getAll(): Observable<LoteModel[]> {
        return this.http.get<LoteModel[]>(this.apiUrl);
    }

    create(Lote: LoteModel): Observable<LoteModel> {
        return this.http.post<LoteModel>(this.apiUrl, Lote);
    }

    update(Lote: LoteModel): Observable<LoteModel> {
        return this.http.put<LoteModel>(`${this.apiUrl}/${Lote.id}`, Lote);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}