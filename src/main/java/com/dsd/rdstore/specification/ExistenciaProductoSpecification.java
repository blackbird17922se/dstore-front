package com.dsd.rdstore.specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.springframework.data.jpa.domain.Specification;

import com.dsd.rdstore.model.ExistenciaProducto;

import jakarta.persistence.criteria.Predicate;

/** Filtros opcionales para la consulta paginada de existencias por lote/ingreso. */
public final class ExistenciaProductoSpecification {

    private ExistenciaProductoSpecification() {
        // Clase de utilidad: no instanciable.
    }

    public static Specification<ExistenciaProducto> filtrar(
            String texto,
            Boolean conStock,
            Long idProducto,
            String numeroLote,
            Long cantidadMin,
            Long cantidadMax,
            LocalDate vencimientoDesde,
            LocalDate vencimientoHasta,
            LocalDate ingresoDesde,
            LocalDate ingresoHasta) {

        return (root, query, cb) -> {
            List<Predicate> filtros = new ArrayList<>();

            // Buscar por nombre del producto, código de barras o número de lote.
            if (texto != null && !texto.isBlank()) {
                String patron = "%" + escaparLike(texto.trim().toLowerCase(Locale.ROOT)) + "%";

                filtros.add(cb.or(
                        cb.like(cb.lower(root.get("producto").get("nombre")), patron, '\\'),
                        cb.like(cb.lower(root.get("producto").get("codigoBarras")), patron, '\\'),
                        cb.like(cb.lower(root.get("numeroLote")), patron, '\\')));
            }

            // El filtro indica si quedan unidades físicas, no si el lote está vigente.
            if (conStock != null) {
                filtros.add(Boolean.TRUE.equals(conStock)
                        ? cb.greaterThan(root.get("cantidad"), 0L)
                        : cb.lessThanOrEqualTo(root.get("cantidad"), 0L));
            }

            if (idProducto != null) {
                filtros.add(cb.equal(root.get("producto").get("id"), idProducto));
            }

            // Filtro de lote independiente de la búsqueda general.
            if (numeroLote != null && !numeroLote.isBlank()) {
                String patronLote = "%" + escaparLike(numeroLote.trim().toLowerCase(Locale.ROOT)) + "%";
                filtros.add(cb.like(cb.lower(root.get("numeroLote")), patronLote, '\\'));
            }

            if (cantidadMin != null) {
                filtros.add(cb.greaterThanOrEqualTo(root.get("cantidad"), cantidadMin));
            }
            if (cantidadMax != null) {
                filtros.add(cb.lessThanOrEqualTo(root.get("cantidad"), cantidadMax));
            }

            if (vencimientoDesde != null) {
                filtros.add(cb.greaterThanOrEqualTo(root.get("fechaVencimiento"), vencimientoDesde));
            }
            if (vencimientoHasta != null) {
                filtros.add(cb.lessThanOrEqualTo(root.get("fechaVencimiento"), vencimientoHasta));
            }

            // La fecha de ingreso es LocalDateTime: abarcamos todo el día final.
            if (ingresoDesde != null) {
                filtros.add(cb.greaterThanOrEqualTo(root.get("fechaIngreso"), ingresoDesde.atStartOfDay()));
            }
            if (ingresoHasta != null) {
                filtros.add(cb.lessThan(root.get("fechaIngreso"), ingresoHasta.plusDays(1).atStartOfDay()));
            }

            return cb.and(filtros.toArray(Predicate[]::new));
        };
    }

    // % y _ ingresados por el usuario se tratan como texto, no como comodines SQL.
    private static String escaparLike(String texto) {
        return texto.replace("\\", "\\\\")
                    .replace("%", "\\%")
                    .replace("_", "\\_");
    }
}
