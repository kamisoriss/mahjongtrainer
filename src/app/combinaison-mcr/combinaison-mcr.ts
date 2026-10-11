import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
  selector: 'app-combinaison-mcr',
  styleUrl: './combinaison-mcr.css',
  templateUrl: './combinaison-mcr.html',
})
export class CombinaisonMcr {
  groupes: GroupePoints[] = [
    {
      valeur: 1,
      combinaisons: [
        { nom: 'fleur ou saison', description: 'fleur ou saison' },
        { nom: 'Tirer sois même', description: 'Finir en piochant la tuile gagnante' },
        { nom: 'Finir sur la Paire', description: 'Finir en complétant la paire' },
        { nom: 'Finir au Milieu', description: "Finir sur la tuile du milieu d'un Chow" },
        { nom: "Finir d'un Côté", description: 'Finir sur 3 pour 1-2-3 ou 7 pour 7-8-9' },
        { nom: 'Une Famille Absente', description: '1 famille absente' },
        { nom: 'Kong Exposé', description: '1 Kong exposé' },
        {
          nom: "Pung de Vent ou d'Extrémité",
          description: '1 Pung de 1, de 9 ou de Vent " ordinaire "',
        },
        { nom: "Deux Chows Purs d'Extrémités", description: '1-2-3 et 7-8-9 dans 1 famille' },
        { nom: 'Petite Suite Pure', description: '2 Chows consécutifs dans 1 famille' },
        { nom: 'Double Chow', description: '2 Chows identiques dans 2 familles' },
        { nom: 'Double Chow Pur', description: '2 Chows identiques dans 1 famille' },
      ],
    },
    {
      valeur: 2,
      combinaisons: [
        { nom: 'Tout Ordinaire', description: 'Uniquement des tuiles de 2 à 8' },
        { nom: 'Kong Caché', description: '1 Kong caché' },
        { nom: 'Deux Pungs Cachés', description: '2 Pungs cachés' },
        { nom: 'Double Pung', description: '2 Pungs identiques dans 2 familles' },
        { nom: 'Quatre Identiques', description: '4 tuiles identiques dans au moins 2 figures' },
        { nom: 'Tout Chow', description: "Tout Chow (pas d'Honneur)" },
        { nom: 'Tout Caché Donné', description: 'Finir sur un écart sans avoir rien exposé' },
        { nom: 'Vent du Joueur', description: '1 Pung du Vent du Joueur' },
        { nom: 'Vent Dominant', description: '1 Pung du Vent du Tour' },
        { nom: 'Pung de Dragon', description: '1 Pung de Dragon' },
      ],
    },
    {
      valeur: 4,
      combinaisons: [
        {
          nom: 'Dernière Tuile Existante',
          description: 'Finir avec la 4ème tuile quand les 3 autres sont visibles',
        },
        {
          nom: 'Deux Kongs Exposés',
          description: '2 Kongs exposés',
        },
        {
          nom: 'Tout Caché Tiré',
          description: 'Finir en piochant la tuile sans avoir rien exposé',
        },
        {
          nom: 'Extrémité ou Honneur partout',
          description: 'Au moins 1 Extrémité ou 1 Honneur par figure',
        },
      ],
    },
    {
      valeur: 6,
      combinaisons: [
        { nom: 'Deux Dragons', description: '2 Pungs de Dragon' },
        { nom: 'Tout Exposé', description: '4 figures exposées et finir sur un écart' },
        { nom: 'Tout Type', description: 'Tous les types de tuiles' },
        {
          nom: 'Trois Chows Superposés',
          description: '3 Chows dans 3 familles superposés de 2 tuiles',
        },
        { nom: 'Semi-Pure', description: '1 seule famille avec des Honneurs' },
        { nom: 'Tout Pung', description: '4 Pungs + 1 Paire' },
        { nom: 'Kong caché et Kong exposé', description: '1 Kong caché + 1 Kong exposé' },
      ],
    },
    {
      valeur: 8,
      combinaisons: [
        { nom: 'Deux Kongs Cachés', description: '2 Kongs cachés' },
        { nom: 'Voler le Kong', description: 'Finir avec la tuile qui transforme un Pung en Kong' },
        { nom: 'Finir sur Kong', description: "Finir grâce à la tuile de remplacement d'un Kong" },
        { nom: 'Dernière Tuile Jetée', description: 'Finir sur la dernière défausse de la partie' },
        { nom: 'Dernière Tuile Tirée', description: 'Finir en piochant la dernière tuile du mur' },
        { nom: 'Main Sans Valeur', description: 'Une main à 0 point' },
        {
          nom: 'Trois Pungs Consécutifs',
          description: '3 Pungs consécutifs, 1 dans chaque famille',
        },
        { nom: 'Triple Chow', description: '3 Chows identiques dans 3 familles' },
        {
          nom: 'Symétrie',
          description: '1,2,3,4,5,8,9 Cercles, 2,4,5,6,8,9 Bambous, Dragon Blanc',
        },
        { nom: 'Grande Suite', description: '1-2-3, 4-5-6, 7-8-9 dans 3 familles' },
      ],
    },
    {
      valeur: 12,
      combinaisons: [
        { nom: 'Trois Grands Vents', description: '3 Pungs de Vents' },
        { nom: 'Les Quatre Premiers', description: 'Uniquement des tuiles 1, 2, 3 et 4' },
        { nom: 'Les Quatre Derniers', description: 'Uniquement des tuiles 6, 7, 8 et 9' },
        {
          nom: 'Suite Serpentin',
          description: '1-4-7 dans 1 famille, 2-5-8 dans la 2ème, 3-6-9 dans la 3ème',
        },
        { nom: 'Petit Serpentin', description: '6 Honneurs uniques + Suite Serpentin incomplète' },
        { nom: '', description: '5 Honneurs uniques + Suite Serpentin complète' },
      ],
    },
    {
      valeur: 16,
      combinaisons: [
        { nom: 'Trois Pungs Cachés', description: '3 Pungs cachés' },
        { nom: 'Triple Pung', description: '3 Pungs identiques dans 3 familles' },
        { nom: 'Cinq Partout', description: 'Au moins un 5 dans chaque figure' },
        {
          nom: 'Trois Chows Purs Superposés',
          description: '3 Chows superposés de 1 ou de 2 tuiles dans 1 famille',
        },
        {
          nom: 'Deux Dragons dans Trois Familles',
          description: '(1-2-3 + 7-8-9) dans 2 familles + Paire de 5 dans la 3ème',
        },
        { nom: 'Grande Suite Pure', description: '1-2-3, 4-5-6, 7-8-9 dans 1 famille' },
      ],
    },
    {
      valeur: 24,
      combinaisons: [
        { nom: 'Les Trois Premiers', description: 'Uniquement des tuiles 1, 2 et 3' },
        { nom: 'Les Trois Milieux', description: 'Uniquement des tuiles 4, 5 et 6' },
        { nom: 'Les Trois Derniers', description: 'Uniquement des tuiles 7, 8 et 9' },
        { nom: 'Trois Pungs Purs Consécutifs', description: '3 Pungs consécutifs dans 1 famille' },
        { nom: 'Triple Chow Pur', description: '3 Chows identiques dans 1 famille' },
        { nom: 'Main Pure', description: 'Tout dans 1 famille' },
        { nom: 'Tout Pung Pair', description: 'Uniquement des tuiles 2, 4, 6 ou 8' },
        { nom: 'Grand Serpentin', description: 'Les 7 Honneurs + Suite Serpentin incomplète' },
        { nom: 'Sept Paires', description: '7 Paires' },
      ],
    },
    {
      valeur: 32,
      combinaisons: [
       { nom: "Tout Honneur et Extrémité", description: "Uniquement des Honneurs et des Extrémités" },
       { nom: "Trois Kongs", description: "3 Kongs" },
       { nom: "Quatre Chows Purs Superposés", description: "4 Chows superposés de 1 ou de 2 tuiles dans 1 famille" },
      ],
    },
    {
      valeur: 48,
      combinaisons: [
       { nom: "Quatre Pungs Purs Consécutifs", description: "4 Pungs consécutifs dans 1 famille" },
       { nom: "Quadruple Chow Pur", description: "4 Chows identiques dans 1 famille" },
      ],
    },
    {
      valeur: 64,
      combinaisons: [
        { nom: "Deux Dragons dans une Famille", description: "2 fois (1-2-3 + 7-8-9) + Paire de 5 dans 1 famille" },
        { nom: "Quatre Pungs Cachés", description: "4 Pungs cachés" },
        { nom: "Tout Honneur", description: "Uniquement des Dragons et des Vents" },
        { nom: "Trois Petits Dragons", description: "2 Pungs de Dragons + Paire du 3ème" },
        { nom: "Quatre Petits Vents", description: "3 Pungs de Vents + Paire du 4ème" },
        { nom: "Tout Extrémité", description: "Uniquement des 1 et des 9" }
      ],
    },
    {
      valeur: 88,
      combinaisons: [
       { nom: "Treize Orphelins", description: "1 tuile de chaque Honneur et Extrémité + 1 en double" },
       { nom: "Sept Paires Pures Consécutives", description: "7 Paires consécutives dans 1 famille" },
       { nom: "Quatre Kongs", description: "4 Kongs" },
       { nom: "Neuf Portes", description: "1-1-1, 9-9-9, 2-3-4-5-6-7-8 cachés dans 1 famille et finir avec une des 9" },
       { nom: "Main Verte", description: "Uniquement des tuiles vertes (2,3,4,6,8 Bambous, Dragon Vert)" },
       { nom: "Trois Grands Dragons", description: "3 Pungs des 3 Dragons" },
       { nom: "Quatre Grands Vents", description: "4 Pungs des 4 Vents" }
      ],
    },
  ];
}
