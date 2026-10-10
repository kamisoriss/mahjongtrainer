import { Component } from '@angular/core';
interface Combinaison {
  nom: string;
  description: string;
}

// Structure d'un groupe (ex: Toutes les combis à 88 points)
interface GroupePoints {
  valeur: number;
  combinaisons: Combinaison[];
}
@Component({
  imports: [],
  selector: 'app-combinaison-richii',
  styleUrl: './combinaison-richii.css',
  templateUrl: './combinaison-richii.html',
})
export class CombinaisonRichii {
  groupes: GroupePoints[] = [
    {
      valeur: 1,
      combinaisons: [
        { nom: 'fleur ou saison', description: 'fleur ou saison' },
        { nom: 'Tirer sois même', description: 'Finir en piochant la tuile gagnante' },
        { nom: 'Finir sur la Paire', description: 'Finir en complétant la paire' },
        { nom: 'Finir au Milieu', description: "Finir sur la tuile du milieu d'un Chow" },
        { nom: 'fleur ou saison', description: 'fleur ou saison' },
      ],
    },
    {
      valeur: 88,
      combinaisons: [
        {
          nom: 'Grande Grande Suite',
          description:
            '4 suites de la même famille consécutives (ex: 123, 456, 789, et une autre suite).',
        },
        {
          nom: '9 Portes',
          description:
            'Tuiles 1112345678999 de la même famille, cachées, plus une tuile de la même famille.',
        },
      ],
    },
    {
      valeur: 24,
      combinaisons: [{ nom: 'Tout Brelan', description: '4 brelans (ou kongs) et une paire.' }],
    },

    // Ajoute les autres groupes (64, 32, 16, 12, 8, 6, 4, 2, 1) ici...
  ];
}
