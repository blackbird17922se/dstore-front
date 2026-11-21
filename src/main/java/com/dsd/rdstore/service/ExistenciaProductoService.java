package com.dsd.rdstore.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dsd.rdstore.common.util.SpecificationPageUtils;
import com.dsd.rdstore.dto.common.PageResponseDTO;
import com.dsd.rdstore.dto.existencia.ExistenciaProductoResponseDTO;
import com.dsd.rdstore.exception.BusinessRuleException;
import com.dsd.rdstore.exception.ResourceNotFoundException;
import com.dsd.rdstore.model.ExistenciaProducto;
import com.dsd.rdstore.model.Producto;
import com.dsd.rdstore.repository.ExistenciaProductoRepository;
import com.dsd.rdstore.repository.ProductoRepository;
import com.dsd.rdstore.specification.ExistenciaProductoSpecification;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ExistenciaProductoService {

    private final ExistenciaProductoRepository existenciaProductoRepository;
    private final ProductoRepository productoRepository;

    // Solo campos de la entidad autorizados para ordenar el listado administrativo.
    private static final Set<String> CAMPOS_ORDEN = Set.of(
            "id", "producto.nombre", "cantidad", "numeroLote",
            "fechaVencimiento", "fechaIngreso");


    
    public List<ExistenciaProductoResponseDTO> listarExistencias() {

        return existenciaProductoRepository
                .findAllByOrderByFechaIngresoDesc()
                .stream()
                .map(this::mapResponse)
                .toList();
    }


    /**
     * Consulta administrativa paginada por registro/lote.
     * No modifica cantidades ni las reglas de selección FEFO/FIFO.
     * conStock = null: todos; true: cantidad > 0; false: cantidad <= 0.
     */
    @Transactional(readOnly = true)
    public PageResponseDTO<ExistenciaProductoResponseDTO> listarExistenciasPaginadas(
            String texto,
            Boolean conStock,
            Long idProducto,
            String numeroLote,
            Long cantidadMin,
            Long cantidadMax,
            LocalDate vencimientoDesde,
            LocalDate vencimientoHasta,
            LocalDate ingresoDesde,
            LocalDate ingresoHasta,
            int page,
            int size,
            String ordenarPor,
            String direccion) {

        // Las combinaciones inválidas se rechazan ANTES de consultar la base de datos.
        if ((cantidadMin != null && cantidadMin < 0)
                || (cantidadMax != null && cantidadMax < 0)
                || (cantidadMin != null && cantidadMax != null && cantidadMin > cantidadMax)) {
            throw new IllegalArgumentException("Rango de cantidad inválido");
        }
        if ((vencimientoDesde != null && vencimientoHasta != null
                && vencimientoDesde.isAfter(vencimientoHasta))
                || (ingresoDesde != null && ingresoHasta != null
                && ingresoDesde.isAfter(ingresoHasta))) {
            throw new IllegalArgumentException("Rango de fechas inválido");
        }

        return SpecificationPageUtils.buscar(
                existenciaProductoRepository,
                ExistenciaProductoSpecification.filtrar(
                        texto, conStock, idProducto, numeroLote, cantidadMin, cantidadMax,
                        vencimientoDesde, vencimientoHasta, ingresoDesde, ingresoHasta),
                this::mapResponse,
                page,
                size,
                ordenarPor,
                direccion,
                CAMPOS_ORDEN);
    }


    public List<ExistenciaProductoResponseDTO>
            listarExistenciasPorProducto(Long idProducto) {

        obtenerProductoPorId(idProducto);

        return existenciaProductoRepository
                .findByProductoIdOrderByFechaIngresoAsc(idProducto)
                .stream()
                .map(this::mapResponse)
                .toList();
    }


    public List<ExistenciaProductoResponseDTO>
            listarExistenciasDisponiblesPorProducto(Long idProducto) {

        obtenerProductoPorId(idProducto);

        return existenciaProductoRepository
                .findByProductoIdAndCantidadGreaterThanOrderByFechaVencimientoAsc(
                        idProducto,
                        0L
                )
                .stream()
                .map(this::mapResponse)
                .toList();
    }


    public List<ExistenciaProductoResponseDTO>
            listarProximosAVencer(Integer dias) {

        if (dias == null || dias <= 0) {
            throw new BusinessRuleException(
                    "La cantidad de días debe ser mayor a cero"
            );
        }

        LocalDate fechaInicial = LocalDate.now();
        LocalDate fechaFinal = fechaInicial.plusDays(dias);

        return existenciaProductoRepository
                .findByFechaVencimientoBetweenAndCantidadGreaterThanOrderByFechaVencimientoAsc(
                        fechaInicial,
                        fechaFinal,
                        0L
                )
                .stream()
                .map(this::mapResponse)
                .toList();
    }


    public ExistenciaProductoResponseDTO
            obtenerExistenciaPorId(Long id) {

        return mapResponse(
                obtenerExistencia(id)
        );
    }


    /*
     * Este método NO será expuesto directamente mediante un POST.
     * Será utilizado posteriormente por EntradaInventarioService.
     */
    public ExistenciaProducto registrarExistencia(
            Producto producto,
            Long cantidad,
            String numeroLote,
            LocalDate fechaVencimiento) {

        validarNuevaExistencia(
                producto,
                cantidad,
                fechaVencimiento
        );

        ExistenciaProducto existencia =
                new ExistenciaProducto();

        existencia.setProducto(producto);
        existencia.setCantidad(cantidad);
        existencia.setNumeroLote(
                normalizarNumeroLote(numeroLote)
        );
        existencia.setFechaVencimiento(fechaVencimiento);
        existencia.setFechaIngreso(LocalDateTime.now());

        return existenciaProductoRepository.save(existencia);
    }


    private void validarNuevaExistencia(
            Producto producto,
            Long cantidad,
            LocalDate fechaVencimiento) {

        if (cantidad == null || cantidad <= 0) {
            throw new BusinessRuleException(
                    "La cantidad de la existencia debe ser mayor a cero"
            );
        }

        if (Boolean.TRUE.equals(producto.getControlaVencimiento())
                && fechaVencimiento == null) {

            throw new BusinessRuleException(
                    "El producto requiere fecha de vencimiento"
            );
        }

        if (fechaVencimiento != null
                && fechaVencimiento.isBefore(LocalDate.now())) {

            throw new BusinessRuleException(
                    "La fecha de vencimiento no puede ser anterior a la fecha actual"
            );
        }
    }


    private String normalizarNumeroLote(String numeroLote) {

        if (numeroLote == null || numeroLote.isBlank()) {
            return null;
        }

        return numeroLote.trim();
    }


    private Producto obtenerProductoPorId(Long id) {

        return productoRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Producto",
                                id
                        )
                );
    }


    private ExistenciaProducto obtenerExistencia(Long id) {

        return existenciaProductoRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Existencia de producto",
                                id
                        )
                );
    }


    private ExistenciaProductoResponseDTO mapResponse(
            ExistenciaProducto existencia) {

        return new ExistenciaProductoResponseDTO(
                existencia.getId(),

                existencia.getProducto().getId(),
                existencia.getProducto().getNombre(),

                existencia.getCantidad(),

                existencia.getNumeroLote(),
                existencia.getFechaVencimiento(),
                existencia.getFechaIngreso()
        );
    }
}