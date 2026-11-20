import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { ThemeService } from './services/theme.service';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog';
import { AccountMenu } from './shared/components/account-menu/account-menu';

registerLocaleData(localeEs);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Navbar, ConfirmDialogComponent, AccountMenu],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

  sidebarVisible = true;
  mobileMenuOpen = false;

  constructor(
    public authService: AuthService,
    private router: Router,
    public theme: ThemeService
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.mobileMenuOpen = false;
      });
  }

  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }
}