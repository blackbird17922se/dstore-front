import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginResponse } from '../models/login-response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}/auth`;

  private loggedInSubject = new BehaviorSubject<boolean>(
    this.checkInitialLogin()
  );

  loggedIn$ = this.loggedInSubject.asObservable();

  constructor(private http: HttpClient) {}

  private checkInitialLogin(): boolean {
    const token = localStorage.getItem('token');

    if (!token) {
      return false;
    }

    if (this.tokenExpirado(token)) {
      localStorage.removeItem('token');
      localStorage.removeItem('rol');
      localStorage.removeItem('usuario');
      return false;
    }

    return true;
  }

  login(
    nombreUsuario: string,
    contrasena: string
  ): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      {
        nombreUsuario,
        contrasena
      }
    );
  }

  guardarUsuario(usuario: string) {
    localStorage.setItem('usuario', usuario);
    this.loggedInSubject.next(true);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('usuario');

    this.loggedInSubject.next(false);
  }

  isLoggedIn(): boolean {
    return this.loggedInSubject.value;
  }

  getUsuario(): string | null {
    return localStorage.getItem('usuario');
  }

  getRol(): string | null {
    return localStorage.getItem('rol');
  }

  esAdmin(): boolean {
    return this.getRol() === 'ADMIN';
  }

  private tokenExpirado(token: string): boolean {
    try {
      const payload = JSON.parse(
        atob(token.split('.')[1])
      );

      const expiracion = payload.exp * 1000;

      return Date.now() >= expiracion;
    } catch {
      return true;
    }
  }
}