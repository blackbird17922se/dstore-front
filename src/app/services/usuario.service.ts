import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UsuarioModel } from '../models/usuario.model';


@Injectable({providedIn: 'root'})
export class UsuarioService {

  private apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<UsuarioModel[]> {
    return this.http.get<UsuarioModel[]>(this.apiUrl);
  }
  create(rol: UsuarioModel): Observable<UsuarioModel> {
    return this.http.post<UsuarioModel>(this.apiUrl, rol);
  }
  update(rol: UsuarioModel): Observable<UsuarioModel> {
    return this.http.put<UsuarioModel>(`${this.apiUrl}/${rol.id}`, rol);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
