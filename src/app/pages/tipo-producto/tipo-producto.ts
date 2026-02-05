import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TipoProductoModel } from '../../models/tipo-producto.model';
import { TipoProductoService } from '../../services/tipo-producto.service';

@Component({
  selector: 'app-tipo-producto',
  imports: [CommonModule, FormsModule],
  templateUrl: './tipo-producto.html',
  styleUrls: ['./tipo-producto.scss'],
})

export class TipoProducto {
  tipoProductos: TipoProductoModel[] = [];
  modalAbierto = false;
  editando = false;
  tipoProductoActual: TipoProductoModel = {
    id: null,
    nombre: ''
  };

  constructor(private tipoProductoService: TipoProductoService) {}

  ngOnInit() {
    this.getTipoProductos();
  }

  abrirModal() {
    this.editando = false;
    this.resetTipoProductoActual();
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  resetTipoProductoActual() {
    this.tipoProductoActual = {
      id: null,
      nombre: ''
    };
  }

  getTipoProductos() {
    this.tipoProductoService.getAll().subscribe({
      next: data => this.tipoProductos = data,
      error: err => console.error('Error al obtener tipos de producto:', err)
    });
  }

  editarTipoProducto(tipoProducto: TipoProductoModel) {
    this.editando = true;
    this.tipoProductoActual = { ...tipoProducto };
    this.modalAbierto = true;
  }

  guardarTipoProducto() {
    const accion = this.editando
      ? this.tipoProductoService.update(this.tipoProductoActual)
      : this.tipoProductoService.create(this.tipoProductoActual);

    accion.subscribe({
      next: () => {
        this.getTipoProductos();
        this.cerrarModal();
      },
      error: err => console.error('Error al guardar tipo de producto:', err)
    });
  }

  borrarTipoProducto(id: number | null) {
    if(id === null) return;
    if(confirm('¿Estás seguro de que deseas borrar este tipo de producto?')) {
        this.tipoProductoService.delete(id).subscribe({
        next: () => this.getTipoProductos(),
        error: err => console.error('Error al borrar tipo de producto:', err)
      });
    }
  }

}
