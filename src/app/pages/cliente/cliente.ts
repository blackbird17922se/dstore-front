import { Component } from '@angular/core';
import { ClienteModel } from '../../models/cliente/cliente.model';
import { ClienteService } from '../../services/cliente.service';
import { FormsModule } from '@angular/forms';
import { ClienteRequest } from '../../models/cliente/cliente-request.model';

/** @author Mauricio A */
@Component({
  selector: 'app-cliente',
  imports: [FormsModule],
  templateUrl: './cliente.html',
  styleUrl: './cliente.scss',
})
export class Cliente {

  clientes: ClienteModel[] = [];
  modalAbierto = false;
  editando = false;

  clienteActual: ClienteModel = {
    id: null,
    tipoDocumento: null,
    numeroDocumento: '',
    nombresApellidos: '',
    telefono: '',
    correo: '',
    direccion: '',
    observacion: '',
    fechaRegistro: '',
    activo: true
  }

  constructor(
    private clienteService: ClienteService
  ){};

  ngOnInit(){
    this.listarClientes();
  }


  listarClientes(){
    this.clienteService.listarClientes().subscribe({
      next: (data) => {this.clientes = data},
      error: (error) => {console.error('Error al obtener Clientes:', error);}
    });
  }


  listarClientesActivos(){
    this.clienteService.listarClientesActivos().subscribe({
      next: (data) => {this.clientes = data},
      error: (error) => {console.error('Error al obtener Clientes:', error)}
    });
  }


  guardarCliente(){

    const request: ClienteRequest = {
      tipoDocumento: this.clienteActual.tipoDocumento,
      numeroDocumento: this.clienteActual.numeroDocumento || null,
      nombresApellidos: this.clienteActual.nombresApellidos.trim(),
      telefono: this.clienteActual.telefono || null,
      correo: this.clienteActual.correo || null,
      direccion: this.clienteActual.direccion || null,
      observacion: this.clienteActual.observacion || null
    };

    const accion = this.editando
      // el ! se llama non-null assertion operator
      // basicamente lo que hace ! decirle a TypeScript:
      // Confía en mí. En este punto sé que id no es null
      ? this.clienteService.actualizarCliente(this.clienteActual.id!, request)
      : this.clienteService.crearCliente(request);

    accion.subscribe({
      next: () => {
        this.listarClientes();
        this.cerrarModal();
      },
      error: (e) => {
        console.error('Error al guardar cliente:', e);
      }
    });
  }

  actualizarCliente(cliente: ClienteModel){
    this.editando = true;
    this.clienteActual = { ...cliente};
    this.modalAbierto = true;
  }

  cambiarEstadoCliente(cliente: ClienteModel){
    if (cliente.id == null) {
      return;
    }

    const nuevoEstado = !cliente.activo;
    const accion = nuevoEstado ? 'activar' : 'desactivar';

    if (confirm(`¿Estás seguro de que deseas ${accion} este Cliente?`)) {
      this.clienteService.cambiarEstadoCliente(cliente.id, nuevoEstado)
        .subscribe({

          next: () => {this.listarClientes()},
          error: (e) => {
            console.error('Error al cambiar el estado del Producto:',e)
          }
        });
    }
  }


  abrirModal() {
    this.editando = false;
    this.resetClienteActual();
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  resetClienteActual(){
    this.clienteActual = {
      id: null,
      tipoDocumento: null,
      numeroDocumento: '',
      nombresApellidos: '',
      telefono: '',
      correo: '',
      direccion: '',
      observacion: '',
      fechaRegistro: '',
      activo: true
    }
  }

}
