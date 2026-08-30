import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

import { ExistenciaProductoResponse } from '../../models/existencia-producto-response.model';
import { ExistenciaProductoService } from '../../services/existencia-producto.service';

@Component({
  selector: 'app-proximos-vencer',
  imports: [
    FormsModule,
    DatePipe
  ],
  templateUrl: './proximos-vencer.html',
  styleUrl: './proximos-vencer.scss'
})
export class ProximosVencer {

  existencias: ExistenciaProductoResponse[] = [];

  dias = 30;

  constructor(
    private existenciaService: ExistenciaProductoService
  ) {}

  ngOnInit() {
    this.buscar();
  }

  buscar() {

    if (this.dias <= 0) {
      return;
    }

    this.existenciaService
      .proximosAVencer(this.dias)
      .subscribe({

        next: (data) => {
          this.existencias = data;
        },

        error: (e) => {
          console.error(
            'Error al obtener productos próximos a vencer:',
            e
          );
        }

      });

  }
  

  diasRestantes(fechaVencimiento: string | null): number | null {

    if (!fechaVencimiento) {
      return null;
    }

    const hoy = new Date();

    const vencimiento = new Date(
      `${fechaVencimiento}T00:00:00`
    );

    const diferencia =
      vencimiento.getTime() - hoy.getTime();

    return Math.ceil(
      diferencia / (1000 * 60 * 60 * 24)
    );
  }
}