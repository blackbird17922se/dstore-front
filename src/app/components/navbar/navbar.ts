import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {

  @Input() collapsed = false;

  @Output() closeRequested = new EventEmitter<void>();

  constructor(
    public authService: AuthService,
    private rutas: Router
  ) {}

  logout(): void {
    this.authService.logout();
    this.rutas.navigate(['/login']);
  }
}