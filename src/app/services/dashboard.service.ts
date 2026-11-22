import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DashboardResumen } from '../models/dashboard/dashboard-resumen.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly apiUrl = `${environment.apiUrl}/dashboard/resumen`;

  constructor(private readonly http: HttpClient) {}

  obtenerResumen(umbralStockBajo = 5): Observable<DashboardResumen> {
    const params = new HttpParams()
      .set('umbralStockBajo', String(umbralStockBajo));
    return this.http.get<DashboardResumen>(this.apiUrl, { params });
  }
}
