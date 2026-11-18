export interface PaginacionParams<
  TOrden extends string = string
> {
  page: number;
  size: number;
  ordenarPor: TOrden;
  direccion: 'asc' | 'desc';
}