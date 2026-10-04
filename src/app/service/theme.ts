import { effect, PLATFORM_ID, Service, signal,inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Service()
export class Theme {
  private platformId = inject(PLATFORM_ID);
  isdark = signal<boolean>(true);
  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const savetheme = localStorage.getItem('theme');
      const preferdark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isdark.set(savetheme ? savetheme === 'dark' : preferdark);
      effect(() => {
        const dark = this.isdark();
        document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
        localStorage.setItem('theme', dark ? 'dark' : 'light');
      });
    }
  }
  toggleTheme() {
    this.isdark.update((val) => !val);
  }
}
