import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

import { ProductoModel } from '../../models/producto/producto.model';
import { ExistenciaProductoResponse } from '../../models/existencia-producto-response.model';

import {
  AjusteInventarioRequest, TipoAjusteInventario
} from '../../models/ajuste-inventario/ajuste-inventario-request.model';

import { AjusteInventarioResponse } from '../../models/ajuste-inventario/ajuste-inventario-response.model';

import { ProductoService } from '../../services/producto.service';
import { ExistenciaProductoService } from '../../services/existencia-producto.service';
import { AjusteInventarioService } from '../../services/ajuste-inventario.service';

@Component({
  selector: 'app-ajuste-inventario',
  imports: [
    FormsModule,
    DatePipe
  ],
  templateUrl: './ajuste-inventario.html',
  styleUrl: './ajuste-inventario.scss'
})
export class AjusteInventario {

  productos: ProductoModel[] = [];

  existencias: ExistenciaProductoResponse[] = [];

  ajustes: AjusteInventarioResponse[] = [];

  idProductoSeleccionado: number | null = null;

  modalAbierto = false;

  ajusteActual: AjusteInventarioRequest = {
    idExistencia: 0,
    tipo: 'SALIDA',
    cantidad: 1,
    motivo: '',
    observacion: null
  };

  constructor(
    private productoService: ProductoService,
    private existenciaService: ExistenciaProductoService,
    private ajusteService: AjusteInventarioService
  ) {}

  ngOnInit() {
    this.listarProductos();
    this.listarAjustes();
  }


  listarProductos() {
    this.productoService.getAll().subscribe({
      next: data => {this.productos = data},
      error: e => {console.error('Error al obtener productos:', e)}
    });
  }


  seleccionarProducto() {
    
    this.existencias = [];
    this.ajusteActual.idExistencia = 0;

    if (this.idProductoSeleccionado === null) {
      return;
    }

    this.existenciaService.listarPorProducto(this.idProductoSeleccionado)
      .subscribe({

        next: data => {this.existencias = data},

        error: e => {console.error('Error al obtener existencias del producto:', e);
        }
      });
  }


  abrirModal() {

    this.resetAjuste();

    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  resetAjuste() {

    this.idProductoSeleccionado = null;
    this.existencias = [];

    this.ajusteActual = {
      idExistencia: 0,
      tipo: 'SALIDA',
      cantidad: 1,
      motivo: '',
      observacion: null
    };
  }

  registrarAjuste() {

    const request: AjusteInventarioRequest = {
      idExistencia: this.ajusteActual.idExistencia,
      tipo: this.ajusteActual.tipo,
      cantidad: this.ajusteActual.cantidad,
      motivo: this.ajusteActual.motivo.trim(),
      observacion:
        this.ajusteActual.observacion || null
    };

    this.ajusteService
      .registrarAjuste(request)
      .subscribe({

        next: () => {

          this.listarAjustes();

          this.cerrarModal();
        },

        error: e => {
          console.error(
            'Error al registrar ajuste:',
            e
          );
        }

      });
  }

  listarAjustes() {

    this.ajusteService.listar().subscribe({

      next: data => {
        this.ajustes = data;
      },

      error: e => {
        console.error(
          'Error al obtener ajustes:',
          e
        );
      }

    });
  }
}