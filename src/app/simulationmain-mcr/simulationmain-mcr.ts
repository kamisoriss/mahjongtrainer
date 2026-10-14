import { Component, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Analysemainmcr, ResultatAnalyse, ContexteVictoire } from '../service/analysemainmcr';

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
  selector: 'app-simulationmain-mcr',
  imports: [
    NgOptimizedImage
  ],
  templateUrl: './simulationmain-mcr.html',
  styleUrl: './simulationmain-mcr.css',
})
export class SimulationmainMcr {

  private mcrEvaluator = inject(Analysemainmcr);

  mainJoueur: Tuile[] = [];
  tuilesDeclarees: GroupeDeclare[] = [];
  tuilesDisponibles: Tuile[] = this.genererToutesLesTuiles();

  resultatAnalyse: ResultatAnalyse = { points: 0, combinaisons: [], estValideMCR: false };

  conditionTirage: boolean = false;
  conditionDerniereTuile: boolean = false;
  conditionToutCache: boolean = false;
  typeAttente: 'aucune' | 'paire' | 'milieu' | 'bord' = 'aucune';

  ventDominant: string = 'est';
  ventJoueur: string = 'est';
  ventsOptions = [
    { valeur: 'est', nom: "Vent d'Est" },
    { valeur: 'sud', nom: "Vent du Sud" },
    { valeur: 'west', nom: "Vent d'Ouest" },
    { valeur: 'nord', nom: "Vent du Nord" }
  ];

  genererToutesLesTuiles(): Tuile[] {
    const tuiles: Tuile[] = [];
    const familles: ('soul' | 'pin' | 'man')[] = ['soul', 'pin', 'man'];
    for (const famille of familles) {
      for (let i = 1; i <= 9; i++) tuiles.push({ suit: famille, value: i });
    }
    for (let i = 1; i <= 4; i++) tuiles.push({ suit: 'vent', value: i });
    for (let i = 1; i <= 3; i++) tuiles.push({ suit: 'dragon', value: i });
    return tuiles;
  }

  get nombreTotalTuiles(): number {
    const equivalentTuilesDeBase = this.tuilesDeclarees.reduce((acc, g) => {
      return acc + (g.type === 'kong' ? 3 : g.tuiles.length);
    }, 0);
    return this.mainJoueur.length + equivalentTuilesDeBase;
  }

  // Compte combien de fois cette tuile est utilisée (main cachée + combinaisons déclarées)
  compterExemplairesTuile(tuile: Tuile): number {
    const enMain = this.mainJoueur.filter(t => t.suit === tuile.suit && t.value === tuile.value).length;
    const enDeclares = this.tuilesDeclarees.reduce((acc, g) => {
      return acc + g.tuiles.filter(t => t.suit === tuile.suit && t.value === tuile.value).length;
    }, 0);
    return enMain + enDeclares;
  }

  private peutCompleterKongEnMain(tuile: Tuile): boolean {
    const nbIdentiquesEnMain = this.mainJoueur.filter(t => t.suit === tuile.suit && t.value === tuile.value).length;
    return nbIdentiquesEnMain === 3 && this.tuilesDeclarees.length < 4;
  }

  ajouterTuile(tuile: Tuile) {
    if (this.compterExemplairesTuile(tuile) >= 4) {
      alert("Impossible : il n'existe que 4 exemplaires de chaque tuile au Mahjong !");
      return;
    }

    if (this.nombreTotalTuiles < 14 || (this.nombreTotalTuiles === 14 && this.peutCompleterKongEnMain(tuile))) {
      this.mainJoueur.push({ ...tuile });
      this.trierMain();
      this.mettreAJourAnalyse();
    } else {
      alert("La main est pleine (14 tuiles maximum au total) !");
    }
  }

  retirerTuileMain(index: number) {
    this.mainJoueur.splice(index, 1);
    this.mettreAJourAnalyse();
  }

  declarerGroupe(type: 'pong' | 'kong' | 'chow', estCache: boolean = false) {
    const tailleRequise = (type === 'kong') ? 4 : 3;
    if (this.mainJoueur.length < tailleRequise) {
      alert(`Il faut au moins ${tailleRequise} tuiles en main pour déclarer ce ${type}.`);
      return;
    }

    const compte: { [cle: string]: Tuile[] } = {};
    for (const t of this.mainJoueur) {
      const cle = `${t.suit}-${t.value}`;
      if (!compte[cle]) compte[cle] = [];
      compte[cle].push(t);
    }

    if (type === 'pong' || type === 'kong') {
      const cleTrouvee = Object.keys(compte).find(k => compte[k].length >= tailleRequise);
      if (!cleTrouvee) {
        alert(`Vous n'avez pas ${tailleRequise} tuiles identiques en main pour former ce ${type} !`);
        return;
      }
      const tuilesGroupe = this.extraireTuilesDeMain(cleTrouvee, tailleRequise);
      // Un Pong posé sur la table est obligatoirement exposé (estCache: false)
      this.tuilesDeclarees.push({
        type,
        tuiles: tuilesGroupe,
        estCache: type === 'kong' ? estCache : false
      });
    } else if (type === 'chow') {
      const chowTrouve = this.trouverEtExtraireChow();
      if (!chowTrouve) {
        alert("Vous n'avez pas de suite consécutive valide (Chow) en main !");
        return;
      }
      this.tuilesDeclarees.push({ type: 'chow', tuiles: chowTrouve, estCache: false });
    }

    this.trierMain();
    this.mettreAJourAnalyse();
  }

  private extraireTuilesDeMain(cle: string, quantite: number): Tuile[] {
    const [suit, valStr] = cle.split('-');
    const val = parseInt(valStr, 10);
    const extraites: Tuile[] = [];

    this.mainJoueur = this.mainJoueur.filter(t => {
      if (extraites.length < quantite && t.suit === suit && t.value === val) {
        extraites.push(t);
        return false;
      }
      return true;
    });
    return extraites;
  }

  private trouverEtExtraireChow(): Tuile[] | null {
    for (let i = 0; i < this.mainJoueur.length - 2; i++) {
      const t1 = this.mainJoueur[i];
      if (t1.suit === 'vent' || t1.suit === 'dragon') continue;

      const t2Idx = this.mainJoueur.findIndex((t, idx) => idx > i && t.suit === t1.suit && t.value === t1.value + 1);
      if (t2Idx !== -1) {
        const t3Idx = this.mainJoueur.findIndex((t, idx) => idx > i && t.suit === t1.suit && t.value === t1.value + 2);
        if (t3Idx !== -1) {
          const chow = [t1, this.mainJoueur[t2Idx], this.mainJoueur[t3Idx]];
          this.mainJoueur = this.mainJoueur.filter((_, idx) => idx !== i && idx !== t2Idx && idx !== t3Idx);
          return chow;
        }
      }
    }
    return null;
  }

  supprimerGroupeDeclare(index: number) {
    const groupe = this.tuilesDeclarees.splice(index, 1)[0];
    this.mainJoueur.push(...groupe.tuiles);
    this.trierMain();
    this.mettreAJourAnalyse();
  }

  get estFigureSpeciale(): boolean {
    return this.resultatAnalyse.combinaisons.some(c => {
      const nom = c.toLowerCase();
      return nom.includes('sept paires') ||
        nom.includes('lanternes') ||
        nom.includes('orphelins') ||
        nom.includes('neuf portes') ||
        nom.includes('petit serpentin') ||
        nom.includes('grand serpentin');
    });
  }

  get estToutCacheDesactive(): boolean {
    const aDesExposes = this.tuilesDeclarees.some(g => !g.estCache);
    return aDesExposes || this.estFigureSpeciale;
  }

  get estTirageDesactive(): boolean {
    return this.conditionToutCache || this.conditionDerniereTuile;
  }

  basculerCondition(condition: 'tirage' | 'derniere' | 'cache') {
    if (condition === 'tirage') this.conditionTirage = !this.conditionTirage;
    if (condition === 'derniere') {
      this.conditionDerniereTuile = !this.conditionDerniereTuile;
      if (this.conditionDerniereTuile) this.conditionTirage = false;
    }
    if (condition === 'cache') {
      this.conditionToutCache = !this.conditionToutCache;
      if (this.conditionToutCache) this.conditionTirage = false;
    }
    this.mettreAJourAnalyse();
  }

  changerVentDominant(event: any) { this.ventDominant = event.target.value; this.mettreAJourAnalyse(); }
  changerVentJoueur(event: any) { this.ventJoueur = event.target.value; this.mettreAJourAnalyse(); }
  changerAttente(event: any) { this.typeAttente = event.target.value; this.mettreAJourAnalyse(); }

  mettreAJourAnalyse() {
    if (this.nombreTotalTuiles === 14) {
      const creerContexte = (): ContexteVictoire => ({
        estTirage: this.conditionTirage,
        typeAttente: this.typeAttente,
        estDerniereTuile: this.conditionDerniereTuile,
        estToutCache: this.conditionToutCache,
        ventDominant: this.ventDominant,
        ventJoueur: this.ventJoueur,
        tuilesDeclarees: this.tuilesDeclarees
      });

      this.resultatAnalyse = this.mcrEvaluator.analyserMain(this.mainJoueur, creerContexte());
      let besoinDeRecalculer = false;

      if (this.estFigureSpeciale) {
        if (this.typeAttente !== 'aucune') { this.typeAttente = 'aucune'; besoinDeRecalculer = true; }
        if (this.conditionToutCache) { this.conditionToutCache = false; besoinDeRecalculer = true; }
      }

      if (this.estToutCacheDesactive && this.conditionToutCache) {
        this.conditionToutCache = false; besoinDeRecalculer = true;
      }

      if (besoinDeRecalculer) {
        this.resultatAnalyse = this.mcrEvaluator.analyserMain(this.mainJoueur, creerContexte());
      }
    } else if (this.nombreTotalTuiles === 15) {
      this.resultatAnalyse = { points: 0, combinaisons: ["Déclarez votre Kong pour valider la main (14 tuiles structurelles)."], estValideMCR: false };
    } else {
      this.resultatAnalyse = { points: 0, combinaisons: [`Main incomplète (${this.nombreTotalTuiles} / 14 tuiles)`], estValideMCR: false };
    }
  }

  trierMain() {
    const ordreFamilles: { [key: string]: number } = { soul: 1, pin: 2, man: 3, vent: 4, dragon: 5 };
    this.mainJoueur.sort((a, b) => {
      if (ordreFamilles[a.suit] !== ordreFamilles[b.suit]) return ordreFamilles[a.suit] - ordreFamilles[b.suit];
      return a.value - b.value;
    });
  }

  getCheminImage(tuile: Tuile): string {
    const suit = tuile.suit.toLowerCase();
    const value = tuile.value.toString().toLowerCase();

    if (suit === 'dragon') {
      const dMap: { [key: string]: string } = { '1': 'rouge', '2': 'vert', '3': 'blanc' };
      return `assets/img/mahjongtuile/mahjongtuiledragon${dMap[value] || value}.png`;
    }
    if (suit === 'vent') {
      const vMap: { [key: string]: string } = { '1': 'est', '2': 'sud', '3': 'west', '4': 'nord' };
      return `assets/img/mahjongtuile/mahjongtuilevent${vMap[value] || value}.png`;
    }
    return `assets/img/mahjongtuile/mahjongtuile${value}${suit}.png`;
  }
}
