import { Component } from '@angular/core';
import { LoteModel } from '../../models/lote.model';
import { LoteService } from '../../services/lote.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lote',
  imports: [CommonModule, FormsModule],
  templateUrl: './lote.html',
  styleUrls: ['./lote.scss'],
})
export class Lote {
  lotes: LoteModel[] = [];
  modalAbierto = false;
  editando = false;
  loteActual: LoteModel = {
    id: null,
    stock: 0,
    vencimiento: new Date(),
    idProducto: 0,
    idProveedor: 0
  };

  constructor(private loteService: LoteService) {}

  ngOnInit() {
    this.getLotes();
  }

  abrirModal() {
    this.editando = false;
    this.resetLoteActual();
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  getLotes() {
    this.loteService.getAll().subscribe({
      next: (data) => {
        this.lotes = data;
      },
      error: (error) => {
        console.error('Error al obtener Lotes:', error);
      }
    });
  }

  editarLote(Lote: LoteModel) {
    this.editando = true;
    this.loteActual = { ...Lote };
    this.modalAbierto = true;
  }

  guardarLote() {
    const accion = this.editando
      ? this.loteService.update(this.loteActual)
      : this.loteService.create(this.loteActual);
    accion.subscribe({
      next: () => {
        this.getLotes();
                this.cerrarModal();
      },
      error: (error) => {
        console.error('Error al guardar lote:', error);
      }
    });
  }

  borrarLote(id: number | null) {
    if (id === null) return;
    if (confirm('¿Estás seguro de que deseas eliminar esta lote?')) {
      this.loteService.delete(id).subscribe({
        next: () => {
          this.getLotes();
        },
        error: (error) => {
          console.error('Error al eliminar lote:', error);
        }
      });
    }
  }

  resetLoteActual() {
    this.loteActual = {
      id: null,
      stock: 0,
      vencimiento: new Date(),
      idProducto: 0,
      idProveedor: 0
    };
  }
}
