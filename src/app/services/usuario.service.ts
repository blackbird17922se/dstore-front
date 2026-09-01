import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UsuarioModel } from '../models/usuario.model';
import { UsuarioResponseModel } from '../models/usuario/usuario-response.model';
import { UsuarioUpdateRequest } from '../models/usuario/usuario-update-request.model';
import { UsuarioCreateRequest } from '../models/usuario/usuario-create-request.model';
import { PerfilUsuarioResponse } from '../models/usuario/perfil-usuario-response.model';
import { CambiarContrasenaRequest } from '../models/usuario/cambiar-contrasena.model';
import { PerfilUsuarioUpdate } from '../models/usuario/perfil-usuario-update.model';


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

  /************* GESTION DE PERFIL ****************/
  obtenerPerfil(): Observable<PerfilUsuarioResponse> {
    return this.http.get<PerfilUsuarioResponse>(
      `${this.apiUrl}/perfil`
    );
  }

  actualizarPerfil(
    request: PerfilUsuarioUpdate
  ): Observable<PerfilUsuarioResponse> {
    return this.http.put<PerfilUsuarioResponse>(
      `${this.apiUrl}/perfil`,
      request
    );
  }

  cambiarContrasena(
    request: CambiarContrasenaRequest
  ): Observable<{ mensaje: string }> {
    return this.http.patch<{ mensaje: string }>(
      `${this.apiUrl}/perfil/contrasena`,
      request
    );
  }

}
