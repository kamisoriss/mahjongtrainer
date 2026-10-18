import { Component, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import {
  Analysemainriichi,
  ResultatAnalyseRiichi,
  ContexteRiichi,
} from '../service/analysemainriichi';

export interface Tuile {
  suit: 'soul' | 'pin' | 'man' | 'vent' | 'dragon';
  value: number;
}
export interface GroupeDeclare {
  type: 'pong' | 'kong' | 'chow';
  tuiles: Tuile[];
  estCache: boolean;
}

@Component({
  selector: 'app-simulationmain-riichi',
  imports: [NgOptimizedImage],
  templateUrl: './simulationmain-riichi.html',
  styleUrl: './simulationmain-riichi.css',
})
export class SimulationmainRiichi {
  private riichiEvaluator = inject(Analysemainriichi);

  mainJoueur: Tuile[] = [];
  tuilesDeclarees: GroupeDeclare[] = [];
  tuilesDisponibles: Tuile[] = this.genererToutesLesTuiles();
  resultatAnalyse: ResultatAnalyseRiichi = {
    han: 0,
    fu: 0,
    points: 0,
    detailPaiement: '',
    rang: '',
    yaku: [],
    estValideRiichi: false,
  };

  estTsumo = false;
  estRiichi = false;
  estDoubleRiichi = false;
  estIppatsu = false;
  estDerniereTuile = false;
  estRinshan = false;
  estChankan = false;
  estPremierTour = false;
  nbDora = 0;
  typeAttente: 'aucune' | 'ryanmen' | 'shanpon' | 'tanki' | 'kanchan' | 'penchan' = 'aucune';
  ventDominant = 'est';
  ventJoueur = 'est';
  ventsOptions = [
    { valeur: 'est', nom: 'Ton (Est)' },
    { valeur: 'sud', nom: 'Nan (Sud)' },
    { valeur: 'west', nom: 'Shaa (Ouest)' },
    { valeur: 'nord', nom: 'Pei (Nord)' },
  ];

  genererToutesLesTuiles(): Tuile[] {
    const tuiles: Tuile[] = [];
    (['soul', 'pin', 'man'] as const).forEach((suit) => {
      for (let i = 1; i <= 9; i++) tuiles.push({ suit, value: i });
    });
    for (let i = 1; i <= 4; i++) tuiles.push({ suit: 'vent', value: i });
    for (let i = 1; i <= 3; i++) tuiles.push({ suit: 'dragon', value: i });
    return tuiles;
  }

  get nombreTotalTuiles(): number {
    return (
      this.mainJoueur.length +
      this.tuilesDeclarees.reduce((acc, g) => acc + (g.type === 'kong' ? 3 : g.tuiles.length), 0)
    );
  }
  get estMainOuverte(): boolean {
    return this.tuilesDeclarees.some((g) => !g.estCache);
  }
  get aUnKanDeclare(): boolean {
    return this.tuilesDeclarees.some((g) => g.type === 'kong');
  }
  get estFigureSpeciale(): boolean {
    return this.resultatAnalyse.yaku.some((y) =>
      ['chiitoitsu', 'kokushi', 'chuuren'].some((k) => y.toLowerCase().includes(k)),
    );
  }

  compterExemplairesTuile(tuile: Tuile): number {
    const match = (t: Tuile) => t.suit === tuile.suit && t.value === tuile.value;
    return (
      this.mainJoueur.filter(match).length +
      this.tuilesDeclarees.reduce((a, g) => a + g.tuiles.filter(match).length, 0)
    );
  }

  ajouterTuile(tuile: Tuile) {
    if (this.compterExemplairesTuile(tuile) >= 4)
      return alert("Impossible : il n'existe que 4 exemplaires de chaque tuile !");
    const peutKan =
      this.mainJoueur.filter((t) => t.suit === tuile.suit && t.value === tuile.value).length ===
        3 && this.tuilesDeclarees.length < 4;
    if (this.nombreTotalTuiles < 14 || (this.nombreTotalTuiles === 14 && peutKan)) {
      this.mainJoueur.push({ ...tuile });
      this.trierMain();
      this.mettreAJourAnalyse();
    } else alert('La main est pleine (14 tuiles maximum au total) !');
  }

  retirerTuileMain(index: number) {
    this.mainJoueur.splice(index, 1);
    this.mettreAJourAnalyse();
  }

  declarerGroupe(type: 'pong' | 'kong' | 'chow', estCache = false) {
    const req = type === 'kong' ? 4 : 3;
    if (this.mainJoueur.length < req) return alert(`Il faut au moins ${req} tuiles en main.`);

    if (type === 'pong' || type === 'kong') {
      const cible = this.mainJoueur.find(
        (t) =>
          this.mainJoueur.filter((x) => x.suit === t.suit && x.value === t.value).length >= req,
      );
      if (!cible) return alert(`Vous n'avez pas ${req} tuiles identiques en main !`);
      const extraites: Tuile[] = [];
      this.mainJoueur = this.mainJoueur.filter((t) =>
        extraites.length < req && t.suit === cible.suit && t.value === cible.value
          ? (extraites.push(t), false)
          : true,
      );
      this.tuilesDeclarees.push({
        type,
        tuiles: extraites,
        estCache: type === 'kong' ? estCache : false,
      });
    } else {
      const chow = this.extraireChow();
      if (!chow) return alert("Vous n'avez pas de Chii valide en main !");
      this.tuilesDeclarees.push({ type: 'chow', tuiles: chow, estCache: false });
    }

    if (this.estMainOuverte) {
      this.estRiichi = false;
      this.estDoubleRiichi = false;
      this.estIppatsu = false;
    }
    this.estPremierTour = false;
    this.trierMain();
    this.mettreAJourAnalyse();
  }

  private extraireChow(): Tuile[] | null {
    for (let i = 0; i < this.mainJoueur.length - 2; i++) {
      const t1 = this.mainJoueur[i];
      if (t1.suit === 'vent' || t1.suit === 'dragon') continue;
      const i2 = this.mainJoueur.findIndex(
        (t, idx) => idx > i && t.suit === t1.suit && t.value === t1.value + 1,
      );
      const i3 = this.mainJoueur.findIndex(
        (t, idx) => idx > i && t.suit === t1.suit && t.value === t1.value + 2,
      );
      if (i2 !== -1 && i3 !== -1) {
        const res = [t1, this.mainJoueur[i2], this.mainJoueur[i3]];
        this.mainJoueur = this.mainJoueur.filter((_, idx) => idx !== i && idx !== i2 && idx !== i3);
        return res;
      }
    }
    return null;
  }

  supprimerGroupeDeclare(index: number) {
    this.mainJoueur.push(...this.tuilesDeclarees.splice(index, 1)[0].tuiles);
    if (!this.aUnKanDeclare) this.estRinshan = false;
    this.trierMain();
    this.mettreAJourAnalyse();
  }

  basculerCondition(
    cond:
      | 'tsumo'
      | 'riichi'
      | 'doubleriichi'
      | 'ippatsu'
      | 'derniere'
      | 'rinshan'
      | 'chankan'
      | 'premiertour',
  ) {
    if (cond === 'tsumo') {
      this.estTsumo = !this.estTsumo;
      if (this.estTsumo) this.estChankan = false;
      else this.estRinshan = false;
    }
    if (cond === 'derniere' && (this.estDerniereTuile = !this.estDerniereTuile)) {
      this.estRinshan = this.estChankan = this.estPremierTour = false;
    }
    if (cond === 'rinshan' && (this.estRinshan = !this.estRinshan)) {
      this.estTsumo = true;
      this.estChankan = this.estDerniereTuile = this.estPremierTour = false;
    }
    if (cond === 'chankan' && (this.estChankan = !this.estChankan)) {
      this.estTsumo = this.estRinshan = this.estDerniereTuile = this.estPremierTour = false;
    }
    if (cond === 'premiertour' && (this.estPremierTour = !this.estPremierTour)) {
      this.estDerniereTuile = this.estRinshan = this.estChankan = false;
    }
    if (cond === 'riichi') {
      this.estRiichi = !this.estRiichi;
      if (this.estRiichi) this.estDoubleRiichi = false;
      else this.estIppatsu = false;
    }
    if (cond === 'doubleriichi') {
      this.estDoubleRiichi = !this.estDoubleRiichi;
      if (this.estDoubleRiichi) this.estRiichi = false;
      else this.estIppatsu = false;
    }
    if (cond === 'ippatsu') this.estIppatsu = !this.estIppatsu;
    this.mettreAJourAnalyse();
  }

  changerVentDominant(e: any) {
    this.ventDominant = e.target.value;
    this.mettreAJourAnalyse();
  }
  changerVentJoueur(e: any) {
    this.ventJoueur = e.target.value;
    this.mettreAJourAnalyse();
  }
  changerAttente(e: any) {
    this.typeAttente = e.target.value;
    this.mettreAJourAnalyse();
  }
  changerDora(delta: number) {
    this.nbDora = Math.max(0, Math.min(20, this.nbDora + delta));
    this.mettreAJourAnalyse();
  }

  mettreAJourAnalyse() {
    if (this.nombreTotalTuiles === 14) {
      const getCtx = (): ContexteRiichi => ({
        estTsumo: this.estTsumo,
        estRiichi: this.estRiichi,
        estDoubleRiichi: this.estDoubleRiichi,
        estIppatsu: this.estIppatsu,
        estDerniereTuile: this.estDerniereTuile,
        estRinshan: this.estRinshan,
        estChankan: this.estChankan,
        estPremierTour: this.estPremierTour,
        nbDora: this.nbDora,
        typeAttente: this.typeAttente,
        ventDominant: this.ventDominant,
        ventJoueur: this.ventJoueur,
        tuilesDeclarees: this.tuilesDeclarees,
      });
      this.resultatAnalyse = this.riichiEvaluator.analyserMain(this.mainJoueur, getCtx());
      if (this.estFigureSpeciale && this.typeAttente !== 'aucune') {
        this.typeAttente = 'aucune';
        this.resultatAnalyse = this.riichiEvaluator.analyserMain(this.mainJoueur, getCtx());
      }
    } else {
      const msg =
        this.nombreTotalTuiles === 15
          ? 'Déclarez votre Kan pour valider la main (14 tuiles structurelles).'
          : `Main incomplète (${this.nombreTotalTuiles} / 14 tuiles)`;
      this.resultatAnalyse = {
        han: 0,
        fu: 0,
        points: 0,
        detailPaiement: '',
        rang: '',
        yaku: [msg],
        estValideRiichi: false,
      };
    }
  }

  trierMain() {
    const ordre: { [k: string]: number } = { soul: 1, pin: 2, man: 3, vent: 4, dragon: 5 };
    this.mainJoueur.sort((a, b) => ordre[a.suit] - ordre[b.suit] || a.value - b.value);
  }

  getCheminImage(tuile: Tuile): string {
    const s = tuile.suit.toLowerCase(),
      v = tuile.value.toString();
    if (s === 'dragon')
      return `assets/img/mahjongtuile/mahjongtuiledragon${({ '1': 'rouge', '2': 'vert', '3': 'blanc' } as any)[v] || v}.png`;
    if (s === 'vent')
      return `assets/img/mahjongtuile/mahjongtuilevent${({ '1': 'est', '2': 'sud', '3': 'west', '4': 'nord' } as any)[v] || v}.png`;
    return `assets/img/mahjongtuile/mahjongtuile${v}${s}.png`;
  }
}
