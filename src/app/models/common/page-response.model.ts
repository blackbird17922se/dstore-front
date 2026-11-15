/** Contrato compartido con PageResponseDTO<T> del backend RDStore. */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number; // Spring Data comienza en cero
  size: number;
}
