import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoriaModel } from '../../models/categoria.model';
import { CategoriaService } from '../../services/categoria.service';

@Component({
  selector: 'app-categoria',
  imports: [CommonModule, FormsModule],
  templateUrl: './categoria.html',
  styleUrls: ['./categoria.scss'],
})

export class Categoria {
  Categorias: CategoriaModel[] = [];
  modalAbierto = false;
  editando = false;
  CategoriaActual: CategoriaModel = {
    id: null,
    nombre: '',
    activo: true
  };

  constructor(private CategoriaService: CategoriaService) {}

  ngOnInit() {
    this.getCategorias();
  }

  abrirModal() {
    this.editando = false;
    this.resetCategoriaActual();
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  resetCategoriaActual() {
    this.CategoriaActual = {
      id: null,
      nombre: '',
      activo: true
    };
  }

  getCategorias() {
    this.CategoriaService.getAll().subscribe({
      next: data => this.Categorias = data,
      error: err => console.error('Error al obtener tipos de Categoría:', err)
    });
  }

  editarCategoria(Categoria: CategoriaModel) {
    this.editando = true;
    this.CategoriaActual = { ...Categoria };
    this.modalAbierto = true;
  }

  guardarCategoria() {
    const accion = this.editando
      ? this.CategoriaService.update(this.CategoriaActual)
      : this.CategoriaService.create(this.CategoriaActual);

    accion.subscribe({
      next: () => {
        this.getCategorias();
        this.cerrarModal();
      },
      error: err => console.error('Error al guardar tipo de Categoría:', err)
    });
  }

  cambiarEstadoCategoria(categoria: CategoriaModel) {
  
    if (categoria.id === null) {
      return;
    }

    const nuevoEstado = !categoria.activo;

    const accion = nuevoEstado
      ? 'activar'
      : 'desactivar';

    if (
      confirm(
        `¿Estás seguro de que deseas ${accion} esta Categoría?`
      )
    ) {

      this.CategoriaService
        .cambiarEstado(
          categoria.id,
          nuevoEstado
        )
        .subscribe({

          next: () => {
            this.getCategorias();
          },

          error: (error) => {
            console.error(
              'Error al cambiar el estado de la Categoría:',
              error
            );
          }

        });
    }
  }

}
