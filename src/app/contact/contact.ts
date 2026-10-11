import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Cookie } from '../service/cookie';
import { Contactservice } from '../service/contactservice';
import { NgHcaptchaModule } from 'ng-hcaptcha';

@Component({
  imports: [ReactiveFormsModule, NgHcaptchaModule],
  selector: 'app-contact',
  styleUrl: './contact.css',
  templateUrl: './contact.html',
})
export class Contact {
  public contactService = inject(Contactservice);
  public cookieService = inject(Cookie);
  private fb = inject(FormBuilder);
  demandeform = this.fb.group({
    message: ['', Validators.required],
  });

  captchaToken = signal<string>('');

  constructor() {
    effect(() => {
      if (!this.cookieService.hCaptchaAccepte()) {
        this.captchaToken.set('');
      }
    });
  }

  ngOnInit() {
    this.contactService.resetEtat();
  }

  onCaptchaComplete(token: string) {
    this.captchaToken.set(token);
  }

  onSubmit() {
    if (this.demandeform.invalid || !this.captchaToken()) return;
    const formValues = this.demandeform.value;
    const formData = {
      access_key: '70cfcd82-c476-4b0a-8f24-df5ac6d64162',
      message: formValues.message, // Bien penser à envoyer 'projet'
      'h-captcha-response': this.captchaToken(),
    };
    this.contactService.envoyerDemande(formData);
  }
  // À ajouter dans contact.ts
  recommencer() {
    this.contactService.resetEtat();
    this.demandeform.reset();
  }
}
