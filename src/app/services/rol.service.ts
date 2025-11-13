import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RolModel } from '../models/rol.model';


@Injectable({providedIn: 'root'})
export class RolService {

  private apiUrl = `${environment.apiUrl}/roles`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<RolModel[]> {
    return this.http.get<RolModel[]>(this.apiUrl);
  }
  create(rol: RolModel): Observable<RolModel> {
    return this.http.post<RolModel>(this.apiUrl, rol);
  }
  update(rol: RolModel): Observable<RolModel> {
    return this.http.put<RolModel>(`${this.apiUrl}/${rol.id}`, rol);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
