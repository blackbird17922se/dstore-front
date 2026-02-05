import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-usuarios',
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.scss'],
})
export class Usuarios {
usuarios: any[] = [];
  isModalOpen = false;
  editing = false;
  usuarioActual = { id: null, nombre: '' };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getusuarios();
  }

  /* Aquí se usa el servicio HttpClient de Angular (inyectado como this.http) 
      para hacer una petición GET a la URL del backend. O sea:
    📡 “Oye servidor, mándame todos los usuarios”.
    * get<any[]> le indica a TypeScript que la respuesta será un arreglo ([]) de 
      objetos genéricos (any).
      
    *.subscribe() es lo que hace que la petición realmente se ejecute 
      (los observables no se ejecutan hasta que alguien se suscribe).
      * data contiene la respuesta que viene del backend (o sea, el List<Usuario> 
        que devolviste desde tu API).
      * Luego, this.usuarios = data; guarda esa lista dentro de una propiedad del 
        componente llamada usuarios, que probablemente se muestra en tu tabla o vista.
  */
  getusuarios() {
    this.http.get<any[]>('http://localhost:8080/api/usuarios').subscribe(data => {
      this.usuarios = data;
    });
  }

  openModal() {
    this.editing = false;
    this.usuarioActual = { id: null, nombre: '' };
    this.isModalOpen = true;
  }

  editUsuario(Usuario: any) {
    this.editing = true;
    this.usuarioActual = { ...Usuario };
    this.isModalOpen = true;
  }

  saveUsuario() {
    if (this.editing) {
      this.http.put(`http://localhost:8080/api/usuarios/${this.usuarioActual.id}`, this.usuarioActual)
        .subscribe(() => {
          this.getusuarios();
          this.closeModal();
        });
    } else {
      this.http.post('http://localhost:8080/api/usuarios', this.usuarioActual)
        .subscribe(() => {
          this.getusuarios();
          this.closeModal();
        });
    }
  }

  deleteUsuario(id: number) {
    if (confirm('¿Seguro que deseas eliminar este Usuario?')) {
      this.http.delete(`http://localhost:8080/api/usuarios/${id}`)
        .subscribe(() => this.getusuarios());
    }
  }

  closeModal() {
    this.isModalOpen = false;
  }
}
