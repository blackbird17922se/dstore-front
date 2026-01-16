import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VentaModel } from '../../models/venta.model';
import { VentaService } from '../../services/venta.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-venta',
  imports: [CommonModule, FormsModule],
  templateUrl: './venta.html',
  styleUrl: './venta.scss',
})
export class Venta {

  ventas: VentaModel[] = [];
  mostrarModal = false;
  ventaSeleccionadaId?: number;
  motivo = '';


  constructor(
    private ventaService: VentaService,
    private router: Router
  ) { }

  ngOnInit() {
    this.getVentas();
  }

  getVentas() {
    this.ventaService.getAll().subscribe({
      next: (ventas) => {
        this.ventas = ventas;
      },
      error: (error) => {
        console.error('Error fetching ventas:', error);
      }
    });
  }

  verDetalle(id: number | null) {
    this.router.navigate(['/detalle-venta', id]);
  }

  anularVenta(id: number | null, motivo?: string) {
    if (id === null) return;
    if (confirm('¿Estás seguro de que deseas anular esta venta?')) {
      this.ventaService.anularVenta(id, motivo).subscribe({
        next: () => {
          this.getVentas();
        },
        error: (error) => {
          console.error('Error al eliminar marca:', error);
        }
      });
    }
  }

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


  confirmarAnulacion() {
    if (!this.ventaSeleccionadaId || !this.motivo) {
      return;
    }

    this.ventaService.anularVenta(this.ventaSeleccionadaId, this.motivo)
      .subscribe({
        next: () => {
          alert('Venta anulada exitosamente');

          this.cerrarModal();
          this.getVentas(); // refresca la tabla
        },
        error: (err) => {
          console.error(err);
          alert('No se pudo anular la venta');
        }
      });
  }

}
