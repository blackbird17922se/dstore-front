import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { AjusteInventarioRequest } from '../models/ajuste-inventario/ajuste-inventario-request.model';
import { AjusteInventarioResponse } from '../models/ajuste-inventario/ajuste-inventario-response.model';


@Injectable({
  providedIn: 'root'
})
export class AjusteInventarioService {

  private apiUrl = `${environment.apiUrl}/ajustes-inventario`;

  constructor(private http: HttpClient) {}

  registrarAjuste(
    request: AjusteInventarioRequest
  ): Observable<AjusteInventarioResponse> {

    return this.http.post<AjusteInventarioResponse>(
      this.apiUrl,
      request
    );
  }

  listar(): Observable<AjusteInventarioResponse[]> {

    return this.http.get<AjusteInventarioResponse[]>(
      this.apiUrl
    );
  }

  listarPorProducto(
    idProducto: number
  ): Observable<AjusteInventarioResponse[]> {

    return this.http.get<AjusteInventarioResponse[]>(
      `${this.apiUrl}/producto/${idProducto}`
    );
  }

  listarPorExistencia(
    idExistencia: number
  ): Observable<AjusteInventarioResponse[]> {

    return this.http.get<AjusteInventarioResponse[]>(
      `${this.apiUrl}/existencia/${idExistencia}`
    );
  }
}