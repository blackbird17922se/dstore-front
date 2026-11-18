import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MarcaModel } from '../models/marca.model';
import { MarcaBusquedaParams } from '../models/marca-busqueda-params';
import { PageResponse } from '../models/common/page-response.model';
import { crearPaginacionHttpParams } from '../shared/utils/paginacion-http-params';

@Injectable({ providedIn: 'root' })
export class MarcaService {
  private apiUrl = `${environment.apiUrl}/marcas`;

  constructor(private http: HttpClient) {}

  // Se conserva para los consumidores actuales (por ejemplo, selectores de Producto).
  getAll(): Observable<MarcaModel[]> {
    return this.http.get<MarcaModel[]>(this.apiUrl);
  }

  create(marca: MarcaModel): Observable<MarcaModel> {
    return this.http.post<MarcaModel>(this.apiUrl, marca);
  }

  update(marca: MarcaModel): Observable<MarcaModel> {
    return this.http.put<MarcaModel>(`${this.apiUrl}/${marca.id}`, marca);
  }

  listarMarcasActivas(): Observable<MarcaModel[]> {
    return this.http.get<MarcaModel[]>(`${this.apiUrl}/activas`);
  }

  cambiarEstado(id: number, activo: boolean): Observable<MarcaModel> {
    return this.http.patch<MarcaModel>(`${this.apiUrl}/${id}/estado`, { activo });
  }

  // Listado administrativo. Requiere GET /marcas/paginadas en el backend.
  getPaginados(filtros: MarcaBusquedaParams): Observable<PageResponse<MarcaModel>> {
    let params = crearPaginacionHttpParams(filtros);

    const nombre = filtros.nombre.trim();
    if (nombre) {
      params = params.set('nombre', nombre);
    }
    if (filtros.activo !== null) {
      params = params.set('activo', filtros.activo);
    }

    return this.http.get<PageResponse<MarcaModel>>(
      `${this.apiUrl}/paginadas`,
      { params }
    );
  }
}
