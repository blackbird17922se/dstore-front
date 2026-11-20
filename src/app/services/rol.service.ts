import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RolModel } from '../models/rol.model';

@Injectable({ providedIn: 'root' })
export class RolService {
  private readonly apiUrl = `${environment.apiUrl}/roles`;

  constructor(private readonly http: HttpClient) {}

  // Roles V1: el backend expone únicamente GET /api/v2/roles.
  // No llamar endpoints de creación, modificación o eliminación inexistentes.
  getAll(): Observable<RolModel[]> {
    return this.http.get<RolModel[]>(this.apiUrl);
  }
}
