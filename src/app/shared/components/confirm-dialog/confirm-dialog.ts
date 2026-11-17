import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import {
  ConfirmDialogOptions,
  ConfirmDialogService,
} from '../../services/confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialogComponent implements AfterViewInit, OnDestroy {
  @ViewChild('dialogo') private dialogo!: ElementRef<HTMLDialogElement>;
  @ViewChild('cancelarBoton') private cancelarBoton?: ElementRef<HTMLButtonElement>;

  solicitud: ConfirmDialogOptions | null = null;
  private suscripcion?: Subscription;

  constructor(
    private readonly confirmacion: ConfirmDialogService,
    private readonly cd: ChangeDetectorRef,
  ) {}

  ngAfterViewInit(): void {
    this.suscripcion = this.confirmacion.solicitud$.subscribe(solicitud => {
      this.solicitud = solicitud;
      // Actualiza los textos y el botón antes de abrir el <dialog> nativo.
      this.cd.detectChanges();

      const elemento = this.dialogo.nativeElement;
      if (solicitud && !elemento.open) {
        elemento.showModal();
        this.cancelarBoton?.nativeElement.focus();
      } else if (!solicitud && elemento.open) {
        elemento.close();
      }
    });
  }

  aceptar(): void {
    this.confirmacion.responder(true);
  }

  cancelar(): void {
    this.confirmacion.responder(false);
  }

  cancelarConEscape(evento: Event): void {
    // Controlar Esc mediante el servicio para resolver la Promise como false.
    evento.preventDefault();
    this.cancelar();
  }

  alCerrarNativo(): void {
    // Respaldo por si el navegador cierra el diálogo sin pasar por un botón.
    if (this.solicitud) this.cancelar();
  }

  ngOnDestroy(): void {
    this.suscripcion?.unsubscribe();
    this.confirmacion.responder(false);
  }
}
