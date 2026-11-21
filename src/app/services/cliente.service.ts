import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClienteResponse } from '../models/cliente/cliente-response.model';
import { ClienteRequest } from '../models/cliente/cliente-request.model';
import { ClienteBusquedaParams } from '../models/cliente/cliente-busqueda-params.model';
import { PageResponse } from '../models/common/page-response.model';
import { crearPaginacionHttpParams } from '../shared/utils/paginacion-http-params';

/** @author Mauricio A. */
@Injectable({providedIn: 'root'})
export class ClienteService {

    private apiUrl = `${environment.apiUrl}/clientes`;
    constructor(private http: HttpClient){};

    // Se conservan los listados originales: otras pantallas (como Nueva venta) pueden utilizarlos.
    listarClientes(): Observable<ClienteResponse[]>{
        return this.http.get<ClienteResponse[]>(this.apiUrl);
    }

    listarClientesActivos(): Observable<ClienteResponse[]>{
        return this.http.get<ClienteResponse[]>(`${this.apiUrl}/activas`);
    }

    /** Consulta paginada del mantenimiento de clientes; filtros opcionales. */
    listarClientesPaginados(filtros: ClienteBusquedaParams): Observable<PageResponse<ClienteResponse>> {
        let params = crearPaginacionHttpParams(filtros);
        const nombre = filtros.nombre.trim();
        const documento = filtros.documento.trim();

        if (nombre) {
            params = params.set('nombre', nombre);
        }
        if (documento) {
            params = params.set('documento', documento);
        }
        if (filtros.activo !== null) {
            params = params.set('activo', filtros.activo);
        }

        return this.http.get<PageResponse<ClienteResponse>>(
            `${this.apiUrl}/paginados`, { params }
        );
    }

    crearCliente(cliente: ClienteRequest): Observable<ClienteResponse>{
        return this.http.post<ClienteResponse>(
            this.apiUrl,
            cliente
        );
    }

    actualizarCliente(id: number, cliente: ClienteRequest): Observable<ClienteResponse>{
        return this.http.put<ClienteResponse>(
            `${this.apiUrl}/${id}`,
            cliente
        );
    }

    cambiarEstadoCliente(id: number, estado: boolean): Observable<ClienteResponse>{
        return this.http.patch<ClienteResponse>(
            `${this.apiUrl}/${id}/estado`,
            {activo: estado}
        );
    }
}
