import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {

  constructor(
    public authService: AuthService,
    private rutas: Router
  ){}

  logout(){
    this.authService.logout();
    this.rutas.navigate(['/login']);
  }

}
