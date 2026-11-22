import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ExistenciaProductoResponse } from "../models/existencia-producto-response.model";
import { ExistenciaBusquedaParams } from '../models/existencia-busqueda-params.model';
import { PageResponse } from '../models/common/page-response.model';
import { crearPaginacionHttpParams } from '../shared/utils/paginacion-http-params';

/** @author mauro a */
@Injectable({ providedIn: 'root' })
export class ExistenciaProductoService {

    apiUrl = `${environment.apiUrl}/existencias`;

    constructor(private http: HttpClient) { };

    listarExistencias(): Observable<ExistenciaProductoResponse[]> {
        return this.http.get<ExistenciaProductoResponse[]>(this.apiUrl);
    }

    obtenerExistencia(id: number): Observable<ExistenciaProductoResponse> {
        return this.http.get<ExistenciaProductoResponse>(`${this.apiUrl}/${id}`);
    }

    listarPorProducto(idProducto: number): Observable<ExistenciaProductoResponse[]> {
        return this.http.get<ExistenciaProductoResponse[]>(`${this.apiUrl}/producto/${idProducto}`);
    }

    proximosAVencer(dias: number): Observable<ExistenciaProductoResponse[]> {

        return this.http.get<ExistenciaProductoResponse[]>(
            `${this.apiUrl}/proximas-vencer`,
            {
                params: {
                    dias: dias
                }
            }
        );
    }

    /** Paginación administrativa; el listado original sigue disponible para otros consumidores. */
    listarExistenciasPaginadas(
        filtros: ExistenciaBusquedaParams
    ): Observable<PageResponse<ExistenciaProductoResponse>> {
        let params = crearPaginacionHttpParams(filtros);

        if (filtros.texto.trim()) params = params.set('texto', filtros.texto.trim());
        if (filtros.idProducto !== null) params = params.set('idProducto', filtros.idProducto);
        if (filtros.conStock !== null) params = params.set('conStock', filtros.conStock);
        if (filtros.numeroLote.trim()) params = params.set('numeroLote', filtros.numeroLote.trim());
        if (filtros.cantidadMin !== null) params = params.set('cantidadMin', filtros.cantidadMin);
        if (filtros.cantidadMax !== null) params = params.set('cantidadMax', filtros.cantidadMax);
        if (filtros.vencimientoDesde) params = params.set('vencimientoDesde', filtros.vencimientoDesde);
        if (filtros.vencimientoHasta) params = params.set('vencimientoHasta', filtros.vencimientoHasta);
        if (filtros.ingresoDesde) params = params.set('ingresoDesde', filtros.ingresoDesde);
        if (filtros.ingresoHasta) params = params.set('ingresoHasta', filtros.ingresoHasta);

        return this.http.get<PageResponse<ExistenciaProductoResponse>>(
            `${this.apiUrl}/paginados`, { params }
        );
    }

}