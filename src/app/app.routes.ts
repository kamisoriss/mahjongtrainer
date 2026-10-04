import { Routes } from '@angular/router';
import { MCR } from './mcr/mcr';
import { Richii } from './richii/richii';
import { Acceuil } from './acceuil/acceuil';
import { Mentionlegal } from './mentionlegal/mentionlegal';

export const routes: Routes = [
  { path: 'Mcr', component: MCR },
  { path: 'Richii', component: Richii },
  { path: 'Acceuil', component: Acceuil },
  { path: 'Mention-legal', component: Mentionlegal },

  { path: '', redirectTo: '/Acceuil', pathMatch: 'full' },
  { path: '**', redirectTo: '/Acceuil', pathMatch: 'full' },
  { path: '', component: Acceuil },
];
