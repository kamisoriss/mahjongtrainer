import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { NgHcaptchaModule } from 'ng-hcaptcha';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    importProvidersFrom(
      NgHcaptchaModule.forRoot({
        siteKey: '50b2fe65-b00b-4b9e-ad62-3ba471098be2'
      })
    )
  ]
};
