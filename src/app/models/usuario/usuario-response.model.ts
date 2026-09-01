import { RolModel } from "../rol.model";

export interface UsuarioResponseModel {
  id: number | null;
  nombre: string;
  apellido: string;
  nombreUsuario: string;
  idRol: number;
  nombreRol: string;
  activo: boolean;
  rol: RolModel[];
}