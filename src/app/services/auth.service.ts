import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from "../../environments/environment";
import { BehaviorSubject, Observable } from 'rxjs';
import { LoginResponse } from '../models/login-response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}/auth`;

  // 🔥 Creamos estado reactivo
  private loggedInSubject = new BehaviorSubject<boolean>(this.checkInitialLogin());

  loggedIn$ = this.loggedInSubject.asObservable();

  constructor(private http: HttpClient) {}

  // 🔹 Método privado para revisar localStorage al iniciar
  private checkInitialLogin(): boolean {
    return !!localStorage.getItem('token');
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
}