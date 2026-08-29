import { TipoDocumento } from "./tipo-documento.type";

export interface ClienteRequest {
  tipoDocumento: TipoDocumento | null;
  numeroDocumento: string | null;
  nombresApellidos: string;
  telefono: string | null;
  correo: string | null;
  direccion: string | null;
  observacion: string | null;
}