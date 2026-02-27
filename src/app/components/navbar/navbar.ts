import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {

  constructor(
    private authservice: AuthService,
    private rutas: Router
  ){}

  logout(){
    this.authservice.logout();
    this.rutas.navigate(['/login']);
  }

}
