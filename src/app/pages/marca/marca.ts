import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MarcaModel } from '../../models/marca.model';
import { MarcaService } from '../../services/marca.service';

@Component({
  selector: 'app-marca',
  imports: [CommonModule, FormsModule],
  templateUrl: './marca.html',
  styleUrls: ['./marca.scss'],
})
export class Marca {
  marcas: MarcaModel[] = [];
  modalAbierto = false;
  editando = false;
  marcaActual: MarcaModel = {
    id: null,
    nombre: ''
  };

  constructor(private marcaService: MarcaService) {}

  ngOnInit() {
    this.getMarcas();
  }

  abrirModal() {
    this.editando = false;
    this.resetMarcaActual();
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  getMarcas() {
    this.marcaService.getAll().subscribe({
      next: (data) => {
        this.marcas = data;
      },
      error: (error) => {
        console.error('Error al obtener Marcas:', error);
      }
    });
  }

  editarMarca(Marca: MarcaModel) {
    this.editando = true;
    this.marcaActual = { ...Marca };
    this.modalAbierto = true;
  }

  guardarMarca() {
    const accion = this.editando
      ? this.marcaService.update(this.marcaActual)
      : this.marcaService.create(this.marcaActual);
    accion.subscribe({
      next: () => {
        this.getMarcas();
                this.cerrarModal();
      },
      error: (error) => {
        console.error('Error al guardar marca:', error);
      }
    });
  }

  borrarMarca(id: number | null) {
    if (id === null) return;
    if (confirm('¿Estás seguro de que deseas eliminar esta marca?')) {
      this.marcaService.delete(id).subscribe({
        next: () => {
          this.getMarcas();
        },
        error: (error) => {
          console.error('Error al eliminar marca:', error);
        }
      });
    }
  }

  resetMarcaActual() {
    this.marcaActual = {
      id: null,
      nombre: ''
    };
  }

}