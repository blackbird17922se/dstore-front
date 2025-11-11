import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Proveedor } from '../models/Proveedor.model';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

/** El servicio se encarga de:
Conectarse con el backend (API)
Procesar o transformar datos antes de entregarlos al componente */
@Injectable({ providedIn: 'root' }) // establece que el servicio es singleton (una sola instancia en toda la app)
export class ProveedorService {
  private apiUrl = `${environment.apiUrl}/proveedores`;

  constructor(private http: HttpClient) {}

  /* * Proveedor[] → el método devolverá un array de objetos tipo Proveedor.
     * Observable → indica que el método devuelve un flujo de datos asíncrono.
      Observable<...> → significa que no devuelve el array directamente, sino un 
      observable que emitirá ese array cuando la respuesta del servidor llegue.

      * Lo que hace es pedirle al backend la lista de proveedores (GET /api/proveedores)
        y devolver un Observable que, al suscribirte, te entregará el resultado.
   */
  getAll(): Observable<Proveedor[]> { //Observable es un flujo de datos que puede emitir múltiples valores a lo largo del tiempo
    return this.http.get<Proveedor[]>(this.apiUrl);
  }

  /** función del service que crea (POST) un proveedor en el backend y devuelve un 
   * Observable que emitirá el proveedor creado cuando la petición termine 
   * 
   * * create(proveedor: Proveedor)
   * → El método recibe un objeto proveedor del tipo Proveedor (tu interfaz/modelo).
   * 
   * * : Observable<Proveedor>
   * → Indica el tipo de retorno: un Observable que emitirá un objeto Proveedor. 
   *  No devuelve el objeto directamente, devuelve un flujo asíncrono que lo entregará 
   *  cuando la petición responda.
   * */
  create(proveedor: Proveedor): Observable<Proveedor> {

    /** return this.http.post<Proveedor>(this.apiUrl, proveedor);
        → Usa HttpClient.post para enviar una petición POST a this.apiUrl con el cuerpo proveedor.
        → <Proveedor> le dice a TypeScript que esperamos que la respuesta tenga la forma de un 
          Proveedor (por ejemplo, con el id ya asignado por el backend). */
    return this.http.post<Proveedor>(this.apiUrl, proveedor);
  }

  update(proveedor: Proveedor): Observable<Proveedor> {
    return this.http.put<Proveedor>(`${this.apiUrl}/${proveedor.id}`, proveedor);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
