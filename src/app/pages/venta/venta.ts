import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VentaService } from '../../services/venta.service';
import { Router } from '@angular/router';
import { VentaRequest } from '../../models/venta/venta-request.model';
import { VentaResponse } from '../../models/venta/venta-response.model';
import { VentaDetalleResponse } from '../../models/venta/venta-detalle-response.model';

@Component({
  selector: 'app-venta',
  imports: [CommonModule, FormsModule],
  templateUrl: './venta.html',
  styleUrl: './venta.scss',
})
export class Venta {

  ventas: VentaRequest[] = [];
  detalleVenta: VentaDetalleResponse | null = null;
  ventasResponse: VentaResponse[] = [];
  mostrarModal = false;
  ventaSeleccionadaId: number | null = null;
  motivo = '';


  constructor(
    private ventaService: VentaService,
    private router: Router
  ) { }

  ngOnInit() {
    this.listarVentas();
  }

  listarVentas() {
    this.ventaService.listarVentas().subscribe({
      next: (ventas) => { this.ventasResponse = ventas },
      error: (error) => {
        console.error('Error fetching ventas:', error);
      }
    });
  }

  // verDetalle(id: number) {
  //   this.ventaService.obtenerVentaPorId(id).subscribe({
  //     next: (ventas) => {this.detalleVenta = ventas},
  //     error: (error) => {
  //       console.error('Error fetching ventas:', error);
  //     }
  //   })
  // }
  verDetalle(id: number | null) {

    if (id === null) {
      return;
    }

    this.router.navigate([
      '/detalle-venta',
      id
    ]);
  }


  abrirModalAnular(id: number) {
    this.ventaSeleccionadaId = id;
    this.motivo = '';
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.motivo = '';
    this.ventaSeleccionadaId = null;
  }

  confirmarAnulacion() {

    if (
      this.ventaSeleccionadaId === null ||
      !this.motivo.trim()
    ) {
      return;
    }

    this.ventaService
      .anularVenta(
        this.ventaSeleccionadaId,
        this.motivo.trim()
      )
      .subscribe({

        next: response => {

          alert(response.mensaje);

          this.cerrarModal();

          this.listarVentas();
        },

        error: error => {

          console.error(
            'Error al anular venta:',
            error
          );

          alert(
            error.error?.mensaje ||
            'No se pudo anular la venta'
          );
        }

      });
  }
}
