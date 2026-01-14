import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VentaModel } from '../../models/venta.model';
import { VentaService } from '../../services/venta.service';

@Component({
  selector: 'app-venta',
  imports: [CommonModule, FormsModule],
  templateUrl: './venta.html',
  styleUrl: './venta.scss',
})
export class Venta {
  ventas: VentaModel[] = [];

  constructor(private ventaService: VentaService) {}

  ngOnInit() {
    this.getVentas();
  }

  getVentas(){
    this.ventaService.getAll().subscribe({
      next: (ventas) => {
        this.ventas = ventas;
      },
      error: (error) => {
        console.error('Error fetching ventas:', error);
      }
    });
  }
}
