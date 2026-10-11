import { Service, signal } from '@angular/core';

@Service()
export class Cookie {
  hCaptchaAccepte = signal<boolean>(false);

  // Un autre Signal pour savoir si le bandeau doit être affiché ou caché
  bandeauVisible = signal<boolean>(true);

  constructor() {
    // Au démarrage de l'application, on vérifie si un choix a déjà été fait
    const choixSauvegarde = this.getCookie('consentement-hcaptcha');

    if (choixSauvegarde === 'accepte') {
      this.hCaptchaAccepte.set(true);
      this.bandeauVisible.set(false);
    } else if (choixSauvegarde === 'refuse') {
      this.hCaptchaAccepte.set(false);
      this.bandeauVisible.set(false);
    }
  }

  accepter() {
    this.hCaptchaAccepte.set(true);
    this.bandeauVisible.set(false);
    this.setCookie('consentement-hcaptcha', 'accepte', 365);
  }

  refuser() {
    this.hCaptchaAccepte.set(false);
    this.bandeauVisible.set(false);
    this.setCookie('consentement-hcaptcha', 'refuse', 365);
  }
  // 🔧 Fonction utilitaire pour créer un cookie
  private setCookie(nom: string, valeur: string, jours: number) {
    const date = new Date();
    date.setTime(date.getTime() + jours * 24 * 60 * 60 * 1000);
    const expires = '; expires=' + date.toUTCString();
    // SameSite=Lax et Secure sont importants pour la sécurité moderne
    document.cookie = nom + '=' + valeur + expires + '; path=/; SameSite=Lax; Secure';
  }

  // 🔧 Fonction utilitaire pour lire un cookie
  private getCookie(nom: string): string | null {
    const nomEQ = nom + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nomEQ) === 0) return c.substring(nomEQ.length, c.length);
    }
    return null;
  }
}
