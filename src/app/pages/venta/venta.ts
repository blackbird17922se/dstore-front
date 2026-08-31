import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VentaService } from '../../services/venta.service';
import { Router } from '@angular/router';
import { VentaRequest } from '../../models/venta/venta-request.model';
import { VentaResponse } from '../../models/venta/venta-response.model';

@Component({
  selector: 'app-venta',
  imports: [CommonModule, FormsModule],
  templateUrl: './venta.html',
  styleUrl: './venta.scss',
})
export class Venta {

  ventas: VentaRequest[] = [];
  ventasResponse: VentaResponse[] = [];
  mostrarModal = false;
  ventaSeleccionadaId?: number;
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
      next: (ventas) => {this.ventasResponse = ventas},
      error: (error) => {
        console.error('Error fetching ventas:', error);
      }
    });
  }

  verDetalle(id: number | null) {
    this.router.navigate(['/detalle-venta', id]);
  }

  // anularVenta(id: number | null, motivo?: string) {
  //   if (id === null) return;
  //   if (confirm('¿Estás seguro de que deseas anular esta venta?')) {
  //     this.ventaService.anularVenta(id, motivo).subscribe({
  //       next: () => {
  //         this.getVentas();
  //       },
  //       error: (error) => {
  //         console.error('Error al eliminar marca:', error);
  //       }
  //     });
  //   }
  // }

  abrirModalAnular(id: number) {
    this.ventaSeleccionadaId = id;
    this.motivo = '';
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.motivo = '';
    this.ventaSeleccionadaId = undefined;
  }


  // confirmarAnulacion() {
  //   if (!this.ventaSeleccionadaId || !this.motivo) {
  //     return;
  //   }

  //   this.ventaService.anularVenta(this.ventaSeleccionadaId, this.motivo)
  //     .subscribe({
  //       next: () => {
  //         alert('Venta anulada exitosamente');

  //         this.cerrarModal();
  //         this.getVentas(); // refresca la tabla
  //       },
  //       error: (err) => {
  //         console.error(err);
  //         alert('No se pudo anular la venta');
  //       }
  //     });
  // }

}
