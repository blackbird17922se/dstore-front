import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './roles.html',
  styleUrls: ['./roles.scss']
})
export class Roles {
  roles: any[] = [];
  isModalOpen = false;
  editing = false;
  rolActual = { id: null, nombre: '' };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getRoles();
  }

  getRoles() {
    this.http.get<any[]>('http://localhost:8080/api/roles').subscribe(data => {
      this.roles = data;
    });
  }

  openModal() {
    this.editing = false;
    this.rolActual = { id: null, nombre: '' };
    this.isModalOpen = true;
  }

  editRol(rol: any) {
    this.editing = true;
    this.rolActual = { ...rol };
    this.isModalOpen = true;
  }

  saveRol() {
    if (this.editing) {
      this.http.put(`http://localhost:8080/api/roles/${this.rolActual.id}`, this.rolActual)
        .subscribe(() => {
          this.getRoles();
          this.closeModal();
        });
    } else {
      this.http.post('http://localhost:8080/api/roles', this.rolActual)
        .subscribe(() => {
          this.getRoles();
          this.closeModal();
        });
    }
  }

  deleteRol(id: number) {
    if (confirm('¿Seguro que deseas eliminar este rol?')) {
      this.http.delete(`http://localhost:8080/api/roles/${id}`)
        .subscribe(() => this.getRoles());
    }
  }

  closeModal() {
    this.isModalOpen = false;
  }
}
