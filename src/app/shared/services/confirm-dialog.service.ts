import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ConfirmDialogVariant = 'primary' | 'danger';

export interface ConfirmDialogOptions {
  titulo: string;
  mensaje: string;
  detalle?: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  variante?: ConfirmDialogVariant;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly solicitudSubject = new BehaviorSubject<ConfirmDialogOptions | null>(null);
  readonly solicitud$ = this.solicitudSubject.asObservable();

  private resolverPendiente: ((confirmado: boolean) => void) | null = null;

  confirmar(opciones: ConfirmDialogOptions): Promise<boolean> {
    // No apilar confirmaciones: evita que una segunda operación reemplace la primera.
    if (this.resolverPendiente) {
      return Promise.resolve(false);
    }

    return new Promise<boolean>(resolve => {
      this.resolverPendiente = resolve;
      this.solicitudSubject.next(opciones);
    });
  }

  responder(confirmado: boolean): void {
    const resolver = this.resolverPendiente;
    if (!resolver) return;

    this.resolverPendiente = null;
    this.solicitudSubject.next(null);
    resolver(confirmado);
  }
}
