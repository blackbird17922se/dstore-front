import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

export type DStoreTheme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly storageKey = 'dstore-theme';

  readonly theme = signal<DStoreTheme>('light');

  constructor() {
    const saved = this.readSavedTheme();
    const systemDark = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-color-scheme: dark)').matches;

    this.apply(saved ?? (systemDark ? 'dark' : 'light'));
  }

  toggle(): void {
    this.apply(this.theme() === 'dark' ? 'light' : 'dark');
  }

  private apply(value: DStoreTheme): void {
    this.theme.set(value);
    this.document.documentElement.setAttribute('data-theme', value);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(this.storageKey, value);
    }
  }

  private readSavedTheme(): DStoreTheme | null {
    if (typeof window === 'undefined') return null;
    const value = window.localStorage.getItem(this.storageKey);
    return value === 'dark' || value === 'light' ? value : null;
  }
}
