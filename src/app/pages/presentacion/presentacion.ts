import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PresentacionModel } from '../../models/presentacion.model';
import { PresentacionService } from '../../services/presentacion.service';

@Component({
  selector: 'app-presentacion',
  imports: [CommonModule, FormsModule],
  templateUrl: './presentacion.html',
  styleUrls: ['./presentacion.scss'],
})
export class Presentacion {
  presentaciones: PresentacionModel[] = [];
  modalAbierto = false;
  editando = false;
  presentacionActual: PresentacionModel = {
    id: null,
    nombre: ''
  };

  constructor(private presentacionService: PresentacionService) {}

  ngOnInit() {
    this.getPresentaciones();
  }

  abrirModal() {
    this.editando = false;
    this.resetPresentacionActual();
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  getPresentaciones() {
    this.presentacionService.getAll().subscribe({
      next: (data) => {
        this.presentaciones = data;
      },
      error: (error) => {
        console.error('Error al obtener presentaciones:', error);
      }
    });
  }

  editarPresentacion(presentacion: PresentacionModel) {
    this.editando = true;
    this.presentacionActual = { ...presentacion };
    this.modalAbierto = true;
  }

  guardarPresentacion() {
    const accion = this.editando
      ? this.presentacionService.update(this.presentacionActual)
      : this.presentacionService.create(this.presentacionActual);
    accion.subscribe({
      next: () => {
        this.getPresentaciones();
                this.cerrarModal();
      },
      error: (error) => {
        console.error('Error al guardar presentación:', error);
      }
    });
  }

  borrarPresentacion(id: number | null) {
    if (id === null) return;
    if (confirm('¿Estás seguro de que deseas eliminar esta presentación?')) {
      this.presentacionService.delete(id).subscribe({
        next: () => {
          this.getPresentaciones();
        },
        error: (error) => {
          console.error('Error al eliminar presentación:', error);
        }
      });
    }
  }

  resetPresentacionActual() {
    this.presentacionActual = {
      id: null,
      nombre: ''
    };
  }

}