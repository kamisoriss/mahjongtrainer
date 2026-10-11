import { Component } from '@angular/core';
interface Yaku {
  nom: string;
  description: string;
  valeurFerme: string | number;
  valeurOuvert: string | number; // Peut être "-" si non valide ouvert
}

interface GroupeCategorie {
  nomCategorie: string;
  yakus: Yaku[];
}
@Component({
  imports: [],
  selector: 'app-combinaison-richii',
  styleUrl: './combinaison-richii.css',
  templateUrl: './combinaison-richii.html',
})
export class CombinaisonRichii {
  groupes: GroupeCategorie[] = [
    {
      nomCategorie: 'Yakus basés sur des suites',
      yakus: [
        {
          nom: 'Iipeikou - Double Suite Pure',
          description: '2 Suites identiques dans la même famille.',
          valeurFerme: 1,
          valeurOuvert: '-',
        },
        {
          nom: 'Ryanpeikou - Deux Doubles Suites Pures',
          description: '4 Suites formant 2 Iipeikou.',
          valeurFerme: 3,
          valeurOuvert: '-',
        },
        {
          nom: 'Pinfu - Pinfu',
          description: 'Main sans aucun fu - 4 Suites et 1 Paire sans valeur, en double attente.',
          valeurFerme: 1,
          valeurOuvert: '-',
        },
        {
          nom: 'Sanshoku Doujun - Triple Suite',
          description: '3 Suites identiques dans les 3 familles.',
          valeurFerme: 2,
          valeurOuvert: 1,
        },
        {
          nom: 'Ittsuu - Grande Suite',
          description: 'Suites 1-2-3, 4-5-6 et 7-8-9 dans la même famille.',
          valeurFerme: 2,
          valeurOuvert: 1,
        },
      ],
    },
    {
      nomCategorie: 'Yakus basés sur des Terminales / Honneurs',
      yakus: [
        {
          nom: 'Tanyao - Tout Ordinaire',
          description: 'Main sans Terminales ni Honneurs.',
          valeurFerme: 1,
          valeurOuvert: 1,
        },
        {
          nom: 'Yakuhai - Brelan de Valeur',
          description: 'Brelan de Dragon, du Vent du Joueur ou du Vent de la Partie.',
          valeurFerme: 1,
          valeurOuvert: 1,
        },
        {
          nom: 'Shousangen - Trois Petits Dragons',
          description: '2 Brelans de Dragons et 1 Paire du 3ème Dragon.',
          valeurFerme: 2,
          valeurOuvert: 2,
        },
        {
          nom: 'Daisangen - Trois Grands Dragons',
          description: '3 Brelans/Carrés des 3 Dragons.',
          valeurFerme: 'Yakuman',
          valeurOuvert: 'Yakuman',
        },
        {
          nom: 'Shousuushi - Quatre Petits Vents',
          description: '3 Brelans de Vents et 1 Paire du 4ème Vent.',
          valeurFerme: 'Yakuman',
          valeurOuvert: 'Yakuman',
        },
        {
          nom: 'Daisuushi - Quatre Grands Vents',
          description: '4 Brelans/Carrés des 4 Vents.',
          valeurFerme: 'Yakuman',
          valeurOuvert: 'Yakuman',
        },
        {
          nom: 'Chanta - Terminales et Honneurs Partout',
          description:
            'Toutes les figures et la paire contiennent au moins une Terminale ou un Honneur.',
          valeurFerme: 2,
          valeurOuvert: 1,
        },
        {
          nom: 'Junchan - Terminales Partout',
          description:
            "Toutes les figures et la paire contiennent au moins une Terminale (pas d'Honneur).",
          valeurFerme: 3,
          valeurOuvert: 2,
        },
        {
          nom: 'Honroutou - Tout Terminale et Honneur',
          description:
            "Main composée uniquement de Terminales et d'Honneurs (Tout Brelans ou Sept Paires).",
          valeurFerme: 2,
          valeurOuvert: 2,
        },
        {
          nom: 'Chinroutou - Tout Terminale',
          description: 'Main composée uniquement de tuiles 1 et 9.',
          valeurFerme: 'Yakuman',
          valeurOuvert: 'Yakuman',
        },
        {
          nom: 'Tsuuiisou - Tout Honneur',
          description: "Main composée uniquement d'Honneurs (Vents et Dragons).",
          valeurFerme: 'Yakuman',
          valeurOuvert: 'Yakuman',
        },
        {
          nom: 'Kokushi Musou - Treize Orphelins',
          description:
            'Un exemplaire de chaque tuile Terminale et de chaque tuile Honneur, plus une en double au choix.',
          valeurFerme: 'Yakuman',
          valeurOuvert: '-',
        },
      ],
    },
    {
      nomCategorie: 'Yakus basés sur des Paires / Brelans / Carrés',
      yakus: [
        {
          nom: 'Chiitoitsu - Sept Paires',
          description: '7 Paires différentes (les doubles paires ne sont pas autorisées).',
          valeurFerme: 2,
          valeurOuvert: '-',
        },
        {
          nom: 'Toitoi - Tout Brelans',
          description: 'Main composée de 4 Brelans (ou Carrés) et 1 Paire.',
          valeurFerme: 2,
          valeurOuvert: 2,
        },
        {
          nom: "San'ankou - Trois Brelans Cachés",
          description: '3 Brelans formés sans voler de tuiles.',
          valeurFerme: 2,
          valeurOuvert: 2,
        },
        {
          nom: 'Suuankou - Quatre Brelans Cachés',
          description:
            '4 Brelans formés sans voler de tuiles (Si attente simple : gagner sur écart autorisé).',
          valeurFerme: 'Yakuman',
          valeurOuvert: '-',
        },
        {
          nom: 'Sanshoku Doukou - Triple Brelan',
          description: '3 Brelans de même valeur dans les 3 familles.',
          valeurFerme: 2,
          valeurOuvert: 2,
        },
        {
          nom: 'Sankantsu - Trois Carrés',
          description: '3 Carrés (ouverts ou cachés).',
          valeurFerme: 2,
          valeurOuvert: 2,
        },
        {
          nom: 'Suukantsu - Quatre Carrés',
          description: '4 Carrés (ouverts ou cachés).',
          valeurFerme: 'Yakuman',
          valeurOuvert: 'Yakuman',
        },
      ],
    },
    {
      nomCategorie: 'Yakus basés sur des Familles',
      yakus: [
        {
          nom: "Hon'itsu - Semi-Pure",
          description: 'Une seule famille de tuiles et des Honneurs.',
          valeurFerme: 3,
          valeurOuvert: 2,
        },
        {
          nom: "Chin'itsu - Main Pure",
          description: "Une seule famille de tuiles (pas d'Honneurs).",
          valeurFerme: 6,
          valeurOuvert: 5,
        },
        {
          nom: 'Ryuuiisou - Main Verte',
          description:
            'Composé uniquement des tuiles 2, 3, 4, 6, 8 de Bambous, et/ou du Dragon Vert.',
          valeurFerme: 'Yakuman',
          valeurOuvert: 'Yakuman',
        },
        {
          nom: 'Chuuren Poutou - Neuf Portes',
          description: 'Tuiles 1112345678999 plus une dernière au choix, dans une seule famille.',
          valeurFerme: 'Yakuman',
          valeurOuvert: '-',
        },
      ],
    },
    {
      nomCategorie: 'Autres Yakus',
      yakus: [
        {
          nom: 'Riichi - Riichi',
          description: 'Déclaration de Riichi (Mise de 1000 points, main cachée fermée).',
          valeurFerme: 1,
          valeurOuvert: '-',
        },
        {
          nom: 'Daburu Riichi - Double Riichi',
          description: 'Annonce du Riichi durant le tout premier tour ininterrompu.',
          valeurFerme: 2,
          valeurOuvert: '-',
        },
        {
          nom: 'Ippatsu - Ippatsu',
          description: "Gagner durant le premier tour ininterrompu suivant l'annonce du Riichi.",
          valeurFerme: 1,
          valeurOuvert: '-',
        },
        {
          nom: 'Menzen Tsumo - Tout Caché Tiré',
          description: 'Gagner sur pioche avec une main totalement fermée.',
          valeurFerme: 1,
          valeurOuvert: '-',
        },
        {
          nom: 'Haitei Raoyue - Fond de la Mer',
          description: 'Gagner sur pioche sur la dernière tuile du mur.',
          valeurFerme: 1,
          valeurOuvert: 1,
        },
        {
          nom: 'Houtei Raoyui - Fond de la Rivière',
          description: 'Gagner sur écart après la dernière tuile du mur.',
          valeurFerme: 1,
          valeurOuvert: 1,
        },
        {
          nom: 'Rinshan Kaihou - Finir sur un Carré',
          description: "Gagner sur la tuile de remplacement suite à la déclaration d'un Carré.",
          valeurFerme: 1,
          valeurOuvert: 1,
        },
        {
          nom: 'Chankan - Voler un Carré',
          description:
            "Gagner sur la tuile qu'un adversaire utilise pour prolonger un Pung en Carré (Un Carré caché ne peut être volé que pour les Treize Orphelins).",
          valeurFerme: 1,
          valeurOuvert: 1,
        },
        {
          nom: 'Tenhou - Bénédiction du Ciel',
          description: 'Le joueur Est gagne sur sa main initiale.',
          valeurFerme: 'Yakuman',
          valeurOuvert: '-',
        },
        {
          nom: 'Chiihou - Bénédiction de la Terre',
          description: 'Gagner sur pioche durant le tout premier tour ininterrompu.',
          valeurFerme: 'Yakuman',
          valeurOuvert: '-',
        },
        {
          nom: "Renhou - Bénédiction de l'Homme",
          description: 'Gagner sur écart durant le tout premier tour ininterrompu.',
          valeurFerme: 'Mangan',
          valeurOuvert: '-',
        },
      ],
    },
  ];
}
