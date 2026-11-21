import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { VentaRequest } from '../models/venta/venta-request.model';
import { VentaDetalleResponse } from '../models/venta/venta-detalle-response.model';
import { VentaResponse } from '../models/venta/venta-response.model';
import { VentaBusquedaParams } from '../models/venta/venta-busqueda-params.model';
import { PageResponse } from '../models/common/page-response.model';

@Injectable({ providedIn: 'root' })
export class VentaService {
  private apiUrl = `${environment.apiUrl}/ventas`;

  constructor(private http: HttpClient) {}

  registrarVenta(request: VentaRequest): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(this.apiUrl, request);
  }

  /** Consulta histórica original; se conserva por compatibilidad con otras pantallas. */
  listarVentas(): Observable<VentaResponse[]> {
    return this.http.get<VentaResponse[]>(this.apiUrl);
  }

  /** Los filtros y el ordenamiento se aplican antes de paginar en la base de datos. */
  listarVentasPaginadas(filtros: VentaBusquedaParams): Observable<PageResponse<VentaResponse>> {
    let params = new HttpParams()
      .set('page', filtros.page)
      .set('size', filtros.size)
      .set('ordenarPor', filtros.ordenarPor)
      .set('direccion', filtros.direccion);

    if (filtros.texto.trim()) params = params.set('texto', filtros.texto.trim());
    if (filtros.estado) params = params.set('estado', filtros.estado);
    if (filtros.idCliente !== null) params = params.set('idCliente', filtros.idCliente);
    if (filtros.idVendedor !== null) params = params.set('idVendedor', filtros.idVendedor);
    if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde);
    if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta);
    if (filtros.totalMin !== null) params = params.set('totalMin', filtros.totalMin);
    if (filtros.totalMax !== null) params = params.set('totalMax', filtros.totalMax);

    return this.http.get<PageResponse<VentaResponse>>(`${this.apiUrl}/paginados`, { params });
  }

  obtenerVentaPorId(id: number): Observable<VentaDetalleResponse> {
    return this.http.get<VentaDetalleResponse>(`${this.apiUrl}/${id}`);
  }

  anularVenta(id: number, motivo: string): Observable<{ mensaje: string }> {
    return this.http.patch<{ mensaje: string }>(`${this.apiUrl}/${id}/anular`, { motivo });
  }
}
