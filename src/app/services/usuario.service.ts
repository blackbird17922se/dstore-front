import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UsuarioModel } from '../models/usuario.model';
import { UsuarioResponseModel } from '../models/usuario/usuario-response.model';
import { UsuarioUpdateRequest } from '../models/usuario/usuario-update-request.model';
import { UsuarioCreateRequest } from '../models/usuario/usuario-create-request.model';


@Injectable({providedIn: 'root'})
export class UsuarioService {

  private apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  listarUsuarios(): Observable<UsuarioResponseModel[]> {
    return this.http.get<UsuarioResponseModel[]>(this.apiUrl);
  }
  crearUsuario(rol: UsuarioCreateRequest): Observable<UsuarioCreateRequest> {
    return this.http.post<UsuarioCreateRequest>(this.apiUrl, rol);
  }
  actualizarUsuario(id: number, rol: UsuarioUpdateRequest): 
    Observable<UsuarioUpdateRequest> {
    return this.http.put<UsuarioUpdateRequest>(`${this.apiUrl}/${id}`, rol);
  }
  cambiarEstado(id: number, activo: boolean): Observable<UsuarioResponseModel>{

      return this.http.patch<UsuarioResponseModel>(
          `${this.apiUrl}/${id}/estado`,
          { activo }
      );
  }
}
