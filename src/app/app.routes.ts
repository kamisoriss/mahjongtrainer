import { Routes } from '@angular/router';
import { MCR } from './mcr/mcr';
import { Richii } from './richii/richii';
import { Acceuil } from './acceuil/acceuil';

export const routes: Routes = [
  { path: 'Mcr', component: MCR },
  { path: 'Richii', component: Richii },
  { path: 'Acceuil', component: Acceuil },

  { path: '', redirectTo: '/Acceuil', pathMatch: 'full' },
  { path: '**', redirectTo: '/Acceuil', pathMatch: 'full' },
  { path: '', component: Acceuil },
];
