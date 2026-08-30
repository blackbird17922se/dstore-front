import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { EntradaInventarioRequest } from "../models/inventario/entrada-inventario-request.model";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { EntradaInventarioResponse } from "../models/inventario/entrada-inventario-response.model";

@Injectable({
  providedIn: 'root'
})
export class EntradaInventarioService {

  private apiUrl =
    `${environment.apiUrl}/entradas-inventario`;

  constructor(private http: HttpClient) {}

  registrarEntrada(
    request: EntradaInventarioRequest
  ): Observable<EntradaInventarioRequest> {

    return this.http.post<EntradaInventarioRequest>(
      this.apiUrl,
      request
    );
  }

  listar(): Observable<EntradaInventarioResponse[]> {
    return this.http.get<EntradaInventarioResponse[]>(
      this.apiUrl
    );
  }
}