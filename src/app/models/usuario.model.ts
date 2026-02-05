export interface RolModel {
  id: number;
  nombre?: string;
}

export interface UsuarioModel {
  id: number | null;
  nombre: string;
  apellido?: string;
  nombreUsuario: string;
  contrasena: string;
  rol: RolModel;
}
