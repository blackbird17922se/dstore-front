import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RolModel } from '../../models/rol.model';
import { RolService } from '../../services/rol.service';

@Component({
  selector: 'app-roles',
  imports: [CommonModule],
  templateUrl: './roles.html',
  styleUrls: ['./roles.scss'],
})
export class Roles implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  roles: RolModel[] = [];
  cargando = false;
  errorListado = '';

  constructor(private readonly rolService: RolService) {}

  ngOnInit(): void {
    this.getRoles();
  }

  // Roles V1 es de solo lectura: no se crean, editan ni eliminan roles desde Angular.
  // La gestión de roles y permisos se implementará como una funcionalidad posterior.
  getRoles(): void {
    if (this.cargando) return;

    this.cargando = true;
    this.errorListado = '';

    this.rolService.getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => { this.cargando = false; }),
      )
      .subscribe({
        next: (data) => {
          this.roles = data;
        },
        error: (error) => {
          this.roles = [];
          this.errorListado = 'No fue posible cargar los roles.';
          console.error('Error al obtener roles:', error);
        },
      });
  }
}
