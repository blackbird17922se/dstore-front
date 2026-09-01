import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';

registerLocaleData(localeEs);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  constructor(public authService: AuthService){}
}
