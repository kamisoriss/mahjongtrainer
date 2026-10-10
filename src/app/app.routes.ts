import { Routes } from '@angular/router';
import { MCR } from './mcr/mcr';
import { Richii } from './richii/richii';
import { Acceuil } from './acceuil/acceuil';
import { Mentionlegal } from './mentionlegal/mentionlegal';
import {CombinaisonMcr} from './combinaison-mcr/combinaison-mcr';
import { CombinaisonRichii } from './combinaison-richii/combinaison-richii';
import { SimulationmainMcr } from './simulationmain-mcr/simulationmain-mcr';
import { SimulationmainRichii } from './simulationmain-richii/simulationmain-richii';

export const routes: Routes = [
  { path: 'Mcr', component: MCR },
  { path: 'Combinaisonmcr', component: CombinaisonMcr },
  { path: 'Richii', component: Richii },
  { path: 'Combinaisonrichii', component: CombinaisonRichii },
  { path: 'Simulationmain-mcr', component: SimulationmainMcr },
  { path: 'Simulationmain-richii', component: SimulationmainRichii },
  { path: 'Acceuil', component: Acceuil },
  { path: 'Mention-legal', component: Mentionlegal },

  { path: '', redirectTo: '/Acceuil', pathMatch: 'full' },
  { path: '**', redirectTo: '/Acceuil', pathMatch: 'full' },
  { path: '', component: Acceuil },
];
