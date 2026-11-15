import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PageResponse } from '../models/common/page-response.model';
import { ProductoBusquedaParams } from '../models/producto/producto-busqueda-params.model';
import { ProductoModel } from '../models/producto/producto.model';
import { ProductoRequest } from '../models/producto/producto-request.model';
import { ProductoResponse } from '../models/producto/producto-response.model';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private apiUrl = `${environment.apiUrl}/productos`;

  constructor(private http: HttpClient) {}

  /** Se conserva para consumidores que necesiten todos los productos. */
  getAll(): Observable<ProductoModel[]> {
    return this.http.get<ProductoModel[]>(this.apiUrl);
  }

  /** Solo la tabla administrativa utiliza este endpoint paginado. */
  getPaginados(filtros: ProductoBusquedaParams): Observable<PageResponse<ProductoResponse>> {
    let params = new HttpParams()
      .set('page', filtros.page)
      .set('size', filtros.size)
      .set('ordenarPor', filtros.ordenarPor)
      .set('direccion', filtros.direccion);

    const texto = filtros.texto?.trim();
    if (texto) params = params.set('texto', texto);
    if (filtros.activo !== null && filtros.activo !== undefined) {
      params = params.set('activo', filtros.activo);
    }
    if (filtros.idCategoria !== null && filtros.idCategoria !== undefined) {
      params = params.set('idCategoria', filtros.idCategoria);
    }
    if (filtros.idMarca !== null && filtros.idMarca !== undefined) {
      params = params.set('idMarca', filtros.idMarca);
    }
    if (filtros.idPresentacion !== null && filtros.idPresentacion !== undefined) {
      params = params.set('idPresentacion', filtros.idPresentacion);
    }

    return this.http.get<PageResponse<ProductoResponse>>(`${this.apiUrl}/paginados`, { params });
  }

  create(request: ProductoRequest): Observable<ProductoModel> {
    return this.http.post<ProductoModel>(this.apiUrl, request);
  }

  update(id: number, request: ProductoRequest): Observable<ProductoModel> {
    return this.http.put<ProductoModel>(`${this.apiUrl}/${id}`, request);
  }

  cambiarEstado(id: number, activo: boolean): Observable<ProductoModel> {
    return this.http.patch<ProductoModel>(`${this.apiUrl}/${id}/estado`, { activo });
  }

  listarProductosActivos(): Observable<ProductoModel[]> {
    return this.http.get<ProductoModel[]>(`${this.apiUrl}/activos`);
  }
}
