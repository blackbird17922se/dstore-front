import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Rol {
  id: number;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class RolService {
  private apiUrl = 'http://localhost:8080/api/roles'; // 👈 tu endpoint backend

  constructor(private http: HttpClient) {}

  listarRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.apiUrl);
  }
}
