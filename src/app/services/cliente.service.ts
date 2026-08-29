import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ClienteModel } from "../models/cliente/cliente.model";
import { ClienteResponse } from "../models/cliente/cliente-response.model";
import { ClienteRequest } from "../models/cliente/cliente-request.model";

/** @author Mauricio A. */
@Injectable({providedIn: 'root'})
export class ClienteService {

    private apiUrl = `${environment.apiUrl}/clientes`;
    constructor(private http: HttpClient){};
    

    listarClientes(): Observable<ClienteResponse[]>{
        return this.http.get<ClienteResponse[]>(this.apiUrl);
    }

    listarClientesActivos(): Observable<ClienteResponse[]>{
        return this.http.get<ClienteResponse[]>(`${this.apiUrl}/activas`);
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
        )
    }

    cambiarEstadoCliente(id: number, estado: boolean): Observable<ClienteResponse>{
        return this.http.patch<ClienteResponse>(
            `${this.apiUrl}/${id}/estado`,
            {activo: estado} 
        );
    }
}