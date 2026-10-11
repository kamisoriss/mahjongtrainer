import { inject, Service, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Service()
export class Contactservice {
  private http = inject(HttpClient);
  private readonly API_URL = 'https://api.web3forms.com/submit';

  isSubmitting = signal<boolean>(false);
  successMessage = signal<boolean>(false);

  envoyerDemande(donneesFormulaire: any) {
    this.isSubmitting.set(true);
    this.successMessage.set(false);

    this.http.post(this.API_URL, donneesFormulaire).subscribe({
      next: () => {
        this.successMessage.set(true);
        this.isSubmitting.set(false);
      },
      error: (err) => {
        console.error("Erreur lors de l'envoi :", err);
        this.isSubmitting.set(false);
      },
    });
  }
  resetEtat() {
    this.successMessage.set(false);
    this.isSubmitting.set(false);
  }
}
