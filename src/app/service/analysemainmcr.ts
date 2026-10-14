import { Service } from '@angular/core';
import { Tuile, GroupeDeclare } from '../simulationmain-mcr/simulationmain-mcr';

export interface ContexteVictoire {
  estTirage?: boolean;
  typeAttente?: 'aucune' | 'paire' | 'milieu' | 'bord';
  estDerniereTuile?: boolean;
  estToutCache?: boolean;
  ventDominant?: string;
  ventJoueur?: string;
  tuilesDeclarees?: GroupeDeclare[];
}

export interface ResultatAnalyse {
  points: number;
  combinaisons: string[];
  estValideMCR: boolean;
}

interface SetMahjong {
  type: 'chow' | 'pong' | 'kong' | 'paire' | 'serpentin';
  suit: string;
  valeurs: string[];
  estCache?: boolean;
}

const FAMILLES_NUM = ['soul', 'pin', 'man'];
const PERMS_FAMILLES = [
  ['soul', 'pin', 'man'], ['soul', 'man', 'pin'],
  ['pin', 'soul', 'man'], ['pin', 'man', 'soul'],
  ['man', 'soul', 'pin'], ['man', 'pin', 'soul']
];

@Service()
export class Analysemainmcr {

  analyserMain(main: Tuile[], contexte: ContexteVictoire = {}): ResultatAnalyse {
    const declares = contexte.tuilesDeclarees || [];
    const nbBase = main.length + declares.reduce((a, g) => a + (g.type === 'kong' ? 3 : g.tuiles.length), 0);
    if (nbBase !== 14) return { points: 0, combinaisons: [`Main incomplète (${nbBase} / 14 tuiles)`], estValideMCR: false };

    const norm = (t: Tuile) => ({ suit: t.suit.toLowerCase(), value: t.value.toString().toLowerCase() });
    const toutes = [...main, ...declares.flatMap(g => g.tuiles)].map(norm);
    const cachees = main.map(norm);

    const compteTotal = this.compter(toutes);
    const compteCache = this.compter(cachees);

    if (Object.values(compteTotal).some(n => n > 4)) {
      return { points: 0, combinaisons: ["Main invalide : maximum 4 exemplaires d'une même tuile."], estValideMCR: false };
    }

    let meilleur: ResultatAnalyse = { points: -1, combinaisons: [], estValideMCR: false };

    if (declares.length === 0) {
      const spec = this.analyserSpeciales(toutes, compteTotal);
      if (spec.points > 0) meilleur = this.appliquerBonus({ ...spec, estValideMCR: true }, contexte, undefined, compteTotal);
    }

    for (const st of this.trouverStructures(compteCache, declares)) {
      const ev = this.appliquerBonus(this.evaluerStructure(st, toutes, contexte), contexte, st, compteTotal);
      if (ev.points > meilleur.points) meilleur = ev;
    }

    return meilleur.points === -1
      ? { points: 0, combinaisons: ["Aucune combinaison valide détectée."], estValideMCR: false }
      : meilleur;
  }

  private trouverStructures(compteCache: { [k: string]: number }, declares: GroupeDeclare[]): SetMahjong[][] {
    const pre: SetMahjong[] = declares.map(g => ({
      type: g.type,
      suit: g.tuiles[0].suit.toLowerCase(),
      valeurs: g.tuiles.map(t => t.value.toString().toLowerCase()).sort((a, b) => +a - +b),
      estCache: g.estCache
    }));
    const restants = 4 - pre.length;
    if (restants < 0) return [];

    const structures: SetMahjong[][] = [];
    const testerPaires = (cBase: { [k: string]: number }, nbSets: number, extra: SetMahjong[] = []) => {
      for (const cle of Object.keys(cBase).filter(k => cBase[k] >= 2)) {
        const c = { ...cBase, [cle]: cBase[cle] - 2 };
        const [suit, val] = cle.split('-');
        const paire: SetMahjong = { type: 'paire', suit, valeurs: [val, val], estCache: true };
        for (const sets of this.extraireSets(c, nbSets)) {
          structures.push([paire, ...pre, ...sets, ...extra]);
        }
      }
    };

    testerPaires(compteCache, restants);

    if (pre.length <= 1) {
      for (const [s1, s2, s3] of PERMS_FAMILLES) {
        const req = [`${s1}-1`, `${s1}-4`, `${s1}-7`, `${s2}-2`, `${s2}-5`, `${s2}-8`, `${s3}-3`, `${s3}-6`, `${s3}-9`];
        if (req.every(k => (compteCache[k] || 0) > 0)) {
          const c = { ...compteCache };
          req.forEach(k => c[k]--);
          testerPaires(c, 1 - pre.length, [{ type: 'serpentin', suit: 'mixte', valeurs: req, estCache: true }]);
        }
      }
    }
    return structures;
  }

  private extraireSets(compte: { [k: string]: number }, voulus: number): SetMahjong[][] {
    if (voulus === 0) return Object.values(compte).reduce((a, b) => a + b, 0) === 0 ? [[]] : [];
    const cle = Object.keys(compte).find(k => compte[k] > 0);
    if (!cle) return [];

    const [suit, valStr] = cle.split('-');
    const v = +valStr;
    const res: SetMahjong[][] = [];

    if (compte[cle] >= 3) {
      compte[cle] -= 3;
      this.extraireSets(compte, voulus - 1).forEach(s => res.push([{ type: 'pong', suit, valeurs: [valStr, valStr, valStr], estCache: true }, ...s]));
      compte[cle] += 3;
    }
    if (FAMILLES_NUM.includes(suit) && v <= 7 && (compte[`${suit}-${v + 1}`] || 0) > 0 && (compte[`${suit}-${v + 2}`] || 0) > 0) {
      compte[cle]--; compte[`${suit}-${v + 1}`]--; compte[`${suit}-${v + 2}`]--;
      this.extraireSets(compte, voulus - 1).forEach(s => res.push([{ type: 'chow', suit, valeurs: [valStr, `${v + 1}`, `${v + 2}`], estCache: true }, ...s]));
      compte[cle]++; compte[`${suit}-${v + 1}`]++; compte[`${suit}-${v + 2}`]++;
    }
    return res;
  }

  private evaluerGlobal(main: { suit: string; value: string }[], structure?: SetMahjong[]): { points: number; combinaisons: string[] } {
    let points = 0;
    const combinaisons: string[] = [];
    const add = (p: number, c: string) => { points += p; combinaisons.push(c); };

    const familles = new Set(main.map(t => t.suit));
    const aHonneurs = familles.has('vent') || familles.has('dragon');
    const famNum = Array.from(familles).filter(f => FAMILLES_NUM.includes(f));

    const vertes = new Set(['soul-2', 'soul-3', 'soul-4', 'soul-6', 'soul-8', 'dragon-2']);
    if (main.every(t => vertes.has(`${t.suit}-${t.value}`))) add(88, "👑 Main verte (88 pts)");

    const sym = new Set(['pin-1', 'pin-2', 'pin-3', 'pin-4', 'pin-5', 'pin-8', 'pin-9', 'soul-2', 'soul-4', 'soul-5', 'soul-6', 'soul-8', 'soul-9', 'dragon-3']);
    const estSym = main.every(t => sym.has(`${t.suit}-${t.value}`));
    if (estSym) add(8, "⭐ Symétrie (8 pts)");

    if (familles.size === 1 && !aHonneurs) add(24, "⭐ Main pure (24 pts)");
    else if (aHonneurs && famNum.length === 1) add(6, "⭐ Semi pure (6 pts)");
    else if (famNum.length > 0 && famNum.length <= 2 && !estSym) add(1, "⭐ Une famille absente (1 pt)");

    if (familles.size === 5) add(6, "⭐ Tout type (6 pts)");

    if (!aHonneurs) {
      const nums = main.map(t => +t.value);
      const pongs = structure ? structure.filter(s => s.type === 'pong' || s.type === 'kong') : [];
      if (pongs.length === 4 && nums.every(n => n % 2 === 0)) add(24, "⭐ Tout pung pair (24 pts)");
      else if (nums.every(n => n >= 7)) add(24, "⭐ Les trois derniers (24 pts)");
      else if (nums.every(n => n >= 4 && n <= 6)) add(24, "⭐ Les trois milieux (24 pts)");
      else if (nums.every(n => n <= 3)) add(24, "⭐ Les trois premiers (24 pts)");
      else if (structure?.every(s => s.valeurs.includes('5'))) add(16, "⭐ Cinq partout (16 pts)");
      else {
        if (nums.every(n => n >= 6)) add(12, "⭐ Les quatre derniers (12 pts)");
        else if (nums.every(n => n <= 4)) add(12, "⭐ Les quatre premiers (12 pts)");
        if (nums.every(n => n >= 2 && n <= 8)) add(2, "⭐ Tout ordinaire (2 pts)");
      }
    }
    return { points, combinaisons };
  }

  private evaluerStructure(structure: SetMahjong[], main: { suit: string; value: string }[], ctx: ContexteVictoire): ResultatAnalyse {
    let points = 0;
    const combinaisons: string[] = [];
    const add = (p: number, c: string) => { points += p; combinaisons.push(c); };

    const chows = structure.filter(s => s.type === 'chow');
    const pongs = structure.filter(s => s.type === 'pong' || s.type === 'kong');
    const serpentins = structure.filter(s => s.type === 'serpentin');
    const paire = structure.find(s => s.type === 'paire');
    const pasHonneur = main.every(t => FAMILLES_NUM.includes(t.suit));

    const deuxDragonsPur = chows.length === 4 && paire?.valeurs[0] === '5' && pasHonneur && new Set(main.map(t => t.suit)).size === 1 && chows.map(c => c.valeurs[0]).sort().join('') === '1177';
    if (deuxDragonsPur) add(64, "👑 Deux dragons dans une famille (64 pts)");

    const deuxDragonsMixte = chows.length === 4 && paire?.valeurs[0] === '5' && FAMILLES_NUM.includes(paire.suit) &&
      FAMILLES_NUM.filter(s => s !== paire.suit).every(s => chows.filter(c => c.suit === s).map(c => c.valeurs[0]).sort().join('') === '17');
    if (deuxDragonsMixte) add(16, "⭐ Deux dragons dans trois familles (16 pts)");

    if (!deuxDragonsPur) {
      const g = this.evaluerGlobal(main, structure);
      points += g.points; combinaisons.push(...g.combinaisons);
    }

    const toutHonneur = main.every(t => !FAMILLES_NUM.includes(t.suit));
    const toutExtremite = pasHonneur && main.every(t => t.value === '1' || t.value === '9');
    const toutHonneurExt = main.every(t => !FAMILLES_NUM.includes(t.suit) || t.value === '1' || t.value === '9');
    const extPartout = !toutHonneur && !toutExtremite && !toutHonneurExt && !serpentins.length &&
      structure.every(s => !FAMILLES_NUM.includes(s.suit) || s.valeurs.includes('1') || s.valeurs.includes('9'));

    if (serpentins.length) add(12, "⭐ Suite serpentin (12 pts)");
    if (toutHonneur) add(64, "👑 Tout honneur (64 pts)");
    else if (toutExtremite) add(64, "👑 Tout extrémité (64 pts)");
    else if (toutHonneurExt) add(32, "👑 Tout honneur et extrémité (32 pts)");
    else if (extPartout) add(4, "⭐ Extrémité ou honneur partout (4 pts)");

    // Pungs consécutifs & identiques
    let pungsConsPurs = 0;
    FAMILLES_NUM.forEach(s => {
      const v = pongs.filter(p => p.suit === s).map(p => +p.valeurs[0]).sort((a, b) => a - b);
      if (v.length === 4 && v[3] - v[0] === 3 && new Set(v).size === 4) { pungsConsPurs = 4; add(48, "👑 Quatre pungs purs consécutifs (48 pts)"); }
      else if (v.some((x, i) => v[i + 1] === x + 1 && v[i + 2] === x + 2)) { pungsConsPurs = 3; add(24, "⭐ Trois pungs purs consécutifs (24 pts)"); }
    });
    if (!pungsConsPurs && [1, 2, 3, 4, 5, 6, 7].some(n => new Set([n, n + 1, n + 2].flatMap(x => pongs.filter(p => FAMILLES_NUM.includes(p.suit) && +p.valeurs[0] === x).map(p => p.suit))).size === 3 && [n, n + 1, n + 2].every(x => pongs.some(p => FAMILLES_NUM.includes(p.suit) && +p.valeurs[0] === x)))) {
      add(8, "⭐ Trois pungs consécutifs (8 pts)");
    }

    for (let n = 1; n <= 9; n++) {
      const nb = new Set(pongs.filter(p => FAMILLES_NUM.includes(p.suit) && +p.valeurs[0] === n).map(p => p.suit)).size;
      if (nb === 3) add(16, "⭐ Triple pungs (16 pts)");
      else if (nb === 2) add(2, "⭐ Double pungs (2 pts)");
    }

    // Chows identiques & superposés
    let quadChowPur = false, chowsSupPurs = 0;
    if (!deuxDragonsPur) {
      const counts = this.compter(chows.map(c => ({ suit: c.suit, value: c.valeurs[0] })));
      Object.values(counts).forEach(n => {
        if (n === 4) { quadChowPur = true; add(48, "👑 Quadruple chows purs (48 pts)"); }
        else if (n === 3) add(24, "⭐ Triple chows purs (24 pts)");
        else if (n === 2) add(1, "⭐ Double chows purs (1 pt)");
      });
    }

    FAMILLES_NUM.forEach(s => {
      const v = chows.filter(c => c.suit === s).map(c => +c.valeurs[0]).sort((a, b) => a - b);
      const u = Array.from(new Set(v));
      if (v.length === 4 && ((v[1] - v[0] === 1 && v[2] - v[1] === 1 && v[3] - v[2] === 1) || (v[1] - v[0] === 2 && v[2] - v[1] === 2 && v[3] - v[2] === 2))) {
        chowsSupPurs = 4; add(32, "👑 Quatre chows purs superposés (32 pts)");
      } else if (u.some((x, i) => (u[i + 1] === x + 1 && u[i + 2] === x + 2) || (u[i + 1] === x + 2 && u[i + 2] === x + 4))) {
        chowsSupPurs = 3; add(16, "⭐ Trois chows purs superposés (16 pts)");
      }
    });
    if (!chowsSupPurs && [1, 2, 3, 4, 5].some(n => PERMS_FAMILLES.some(([s1, s2, s3]) =>
      chows.some(c => c.suit === s1 && +c.valeurs[0] === n) && chows.some(c => c.suit === s2 && +c.valeurs[0] === n + 1) && chows.some(c => c.suit === s3 && +c.valeurs[0] === n + 2)
    ))) add(6, "⭐ Trois chows superposés (6 pts)");

    // Grandes et petites suites
    let gdeSuitePure = false;
    FAMILLES_NUM.forEach(s => {
      const v = chows.filter(c => c.suit === s).map(c => +c.valeurs[0]);
      if (v.includes(1) && v.includes(4) && v.includes(7)) { gdeSuitePure = true; add(16, "⭐ Grande suite pure (16 pts)"); }
      else if (!deuxDragonsPur && !chowsSupPurs && !quadChowPur) {
        const rest = [...v];
        for (const [x, y] of [[1, 4], [2, 5], [3, 6], [4, 7]]) {
          while (rest.includes(x) && rest.includes(y)) {
            rest.splice(rest.indexOf(x), 1); rest.splice(rest.indexOf(y), 1);
            add(1, "⭐ Petite suite pure (1 pt)");
          }
        }
        if (v.includes(1) && v.includes(7)) add(1, "⭐ Deux chows purs d'extrémités (1 pt)");
      }
    });
    if (!gdeSuitePure && PERMS_FAMILLES.some(([s1, s2, s3]) => chows.some(c => c.suit === s1 && c.valeurs[0] === '1') && chows.some(c => c.suit === s2 && c.valeurs[0] === '4') && chows.some(c => c.suit === s3 && c.valeurs[0] === '7'))) {
      add(8, "⭐ Grande suite (8 pts)");
    }

    if (!deuxDragonsMixte) {
      for (let n = 1; n <= 7; n++) {
        const nb = new Set(chows.filter(c => +c.valeurs[0] === n).map(c => c.suit)).size;
        if (nb === 3) add(8, "⭐ Triple chows (8 pts)");
        else if (nb === 2) add(1, "⭐ Double chows (1 pt)");
      }
    }

    const aToutChow = chows.length === 4 && pasHonneur;
    if (aToutChow && !deuxDragonsPur && !deuxDragonsMixte) add(2, "⭐ Tout chow (2 pts)");
    if (pongs.length === 4 && !toutHonneur && !toutExtremite && !toutHonneurExt && pungsConsPurs !== 4 && !combinaisons.some(c => c.includes("Tout pung pair"))) {
      add(6, "⭐ Tout pung (6 pts)");
    }
    if (pasHonneur && !aToutChow && !toutExtremite && !deuxDragonsPur && !deuxDragonsMixte && !combinaisons.some(c =>
      ["Tout ordinaire", "Main pure", "Tout pung pair", "Les trois", "Cinq partout", "Les quatre"].some(k => c.includes(k))
    )) add(1, "⭐ Pas d'honneur (1 pt)");

    // Dragons & Vents
    const pDrag = pongs.filter(p => p.suit === 'dragon').length;
    const paireDrag = paire?.suit === 'dragon';
    if (pDrag === 3) add(88, "👑 Trois grands dragons (88 pts)");
    else if (pDrag === 2 && paireDrag) add(64, "👑 Trois petits dragons (64 pts)");
    else if (pDrag === 2) add(6, "⭐ Deux dragons (6 pts)");
    else if (pDrag === 1) add(2, "⭐ Pung de dragons (2 pts)");

    const pVents = pongs.filter(p => p.suit === 'vent');
    if (pVents.length === 4) {
      add(88, "👑 Quatre grands vents (88 pts)");
      const i = combinaisons.findIndex(c => c.includes("Tout pung (6 pts)"));
      if (i !== -1) { points -= 6; combinaisons.splice(i, 1); }
    } else {
      const grandVent = pVents.length === 3;
      if (grandVent && paire?.suit === 'vent') add(64, "👑 Quatre petits vents (64 pts)");
      else if (grandVent) add(12, "⭐ Trois grands vents (12 pts)");

      const vMap: { [k: string]: string } = { '1': 'est', '2': 'sud', '3': 'west', '4': 'nord' };
      pVents.forEach(p => {
        const v = vMap[p.valeurs[0]] || p.valeurs[0];
        if (v === ctx.ventDominant) add(2, "⭐ Vent dominant (2 pts)");
        if (v === ctx.ventJoueur) add(2, "⭐ Vent du joueur (2 pts)");
        if (!toutHonneur && !toutHonneurExt && !grandVent && v !== ctx.ventDominant && v !== ctx.ventJoueur) add(1, "⭐ Pung de vents ou d'extrémités (1 pt)");
      });
    }

    pongs.filter(p => FAMILLES_NUM.includes(p.suit) && (p.valeurs[0] === '1' || p.valeurs[0] === '9')).forEach(() => {
      if (!toutExtremite && !toutHonneur && !toutHonneurExt) add(1, "⭐ Pung de vents ou d'extrémités (1 pt)");
    });

    return { points, combinaisons, estValideMCR: points >= 8 };
  }

  private appliquerBonus(res: ResultatAnalyse, ctx: ContexteVictoire, st?: SetMahjong[], compteTotal?: { [k: string]: number }): ResultatAnalyse {
    let pts = res.points;
    const combis = [...res.combinaisons];
    const add = (p: number, c: string) => { pts += p; combis.unshift(c); };

    const declares = ctx.tuilesDeclarees || [];
    const pCaches = st ? st.filter(s => s.type === 'pong' && s.estCache).length : declares.filter(g => g.type === 'pong' && g.estCache).length;
    const kCaches = declares.filter(g => g.type === 'kong' && g.estCache).length;
    const kExposes = declares.filter(g => g.type === 'kong' && !g.estCache).length;

    const estSpeciale = combis.some(c => ["Sept paires", "lanternes", "serpentin (12", "serpentin (24", "Neuf portes"].some(k => c.includes(k)));

    if (compteTotal && !combis.some(c => c.includes("Quadruple chows purs"))) {
      Object.keys(compteTotal).filter(k => compteTotal[k] === 4).forEach(cle => {
        if (!declares.some(g => g.type === 'kong' && `${g.tuiles[0].suit.toLowerCase()}-${g.tuiles[0].value}` === cle)) {
          pts += 2; combis.push("⭐ Quatre identiques (2 pts)");
        }
      });
    }

    let quatreKongs = false, quatrePungsCaches = false;
    if (!estSpeciale) {
      const totKongs = kCaches + kExposes, totPungsCaches = pCaches + kCaches;
      const retirerToutPung = () => {
        const i = combis.findIndex(c => c.includes("Tout pung (6 pts)"));
        if (i !== -1) { pts -= 6; combis.splice(i, 1); }
      };

      if (totKongs === 4) { quatreKongs = true; add(88, "👑 Quatre kongs (88 pts)"); retirerToutPung(); }
      else if (totKongs === 3) add(32, "👑 Trois kongs (32 pts)");
      else if (totKongs === 2) add(kCaches === 2 ? 8 : kExposes === 2 ? 4 : 6, kCaches === 2 ? "⭐ Deux kongs cachés (8 pts)" : kExposes === 2 ? "⭐ Deux kongs exposés (4 pts)" : "⭐ Kong caché et kong exposé (6 pts)");
      else if (totKongs === 1) add(kCaches ? 2 : 1, kCaches ? "⭐ Kong caché (2 pts)" : "⭐ Kong exposé (1 pt)");

      if (totPungsCaches === 4) { quatrePungsCaches = true; add(64, "👑 Quatre pungs cachés (64 pts)"); retirerToutPung(); }
      else if (totPungsCaches === 3) add(16, "⭐ Trois pungs cachés (16 pts)");
      else if (totPungsCaches === 2 && kCaches !== 2) add(2, "⭐ Deux pungs cachés (2 pts)");
    }

    const estTirage = !!(ctx.estTirage || ctx.estToutCache);
    const toutExpose = declares.length === 4 && declares.every(g => !g.estCache) && !estTirage && !quatreKongs;
    if (toutExpose) add(6, "⭐ Tout exposé (6 pts)");

    const aucunExpose = declares.every(g => g.estCache);
    const exclutToutCacheTire = quatrePungsCaches || combis.some(c => ["Neuf portes", "lanternes", "Petit serpentin", "Grand serpentin", "Sept paires pures"].some(k => c.includes(k)));

    if (ctx.estToutCache && aucunExpose && !exclutToutCacheTire) {
      add(4, "🎯 Tout caché tiré (4 pts)");
      if (ctx.estDerniereTuile) add(8, "🎯 Dernière tuile tirée (8 pts)");
    } else {
      if (aucunExpose && !estTirage && !estSpeciale && !quatrePungsCaches) add(2, "🎯 Tout caché donné (2 pts)");
      if (ctx.estDerniereTuile) add(8, estTirage ? "🎯 Dernière tuile tirée (8 pts)" : "🎯 Dernière tuile jetée (8 pts)");
      else if (estTirage) add(1, "🎯 Tirer soi-même (1 pt)");
    }

    if (!estSpeciale && !quatreKongs && !toutExpose && ctx.typeAttente && ctx.typeAttente !== 'aucune') {
      const lib = { paire: "🎯 Finir sur la paire (1 pt)", milieu: "🎯 Finir au milieu (1 pt)", bord: "🎯 Finir d'un côté (1 pt)" };
      add(1, lib[ctx.typeAttente]);
    }

    if (pts === 0) { pts = 8; combis.push("⭐ Main sans valeur (8 pts)"); }
    return { points: pts, combinaisons: combis, estValideMCR: pts >= 8 };
  }

  private analyserSpeciales(main: { suit: string; value: string }[], compte: { [k: string]: number }): { points: number; combinaisons: string[] } {
    const f0 = main[0].suit;
    if (FAMILLES_NUM.includes(f0) && main.every(t => t.suit === f0)) {
      const v = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      main.forEach(t => v[+t.value]++);
      if (v[1] >= 3 && v[9] >= 3 && [2, 3, 4, 5, 6, 7, 8].every(i => v[i] >= 1)) return { points: 88, combinaisons: ["👑 Neuf portes (88 pts)"] };
    }

    const req13 = ['soul-1', 'soul-9', 'pin-1', 'pin-9', 'man-1', 'man-9', 'vent-1', 'vent-2', 'vent-3', 'vent-4', 'dragon-1', 'dragon-2', 'dragon-3'];
    if (req13.every(k => (compte[k] || 0) >= 1) && Object.keys(compte).length === 13) return { points: 88, combinaisons: ["👑 Les treize lanternes merveilleuses (88 pts)"] };

    const cles = Object.keys(compte).filter(k => compte[k] > 0);
    if (cles.length === 14) {
      for (const [s1, s2, s3] of PERMS_FAMILLES) {
        const knit = new Set([`${s1}-1`, `${s1}-4`, `${s1}-7`, `${s2}-2`, `${s2}-5`, `${s2}-8`, `${s3}-3`, `${s3}-6`, `${s3}-9`]);
        if (cles.every(k => k.startsWith('vent-') || k.startsWith('dragon-') || knit.has(k))) {
          const nbHon = cles.filter(k => k.startsWith('vent-') || k.startsWith('dragon-')).length;
          return nbHon === 7 ? { points: 24, combinaisons: ["⭐ Grand serpentin (24 pts)"] }
            : cles.length - nbHon === 9 ? { points: 24, combinaisons: ["⭐ Petit serpentin (12 pts)", "⭐ Suite serpentin (12 pts)"] }
              : { points: 12, combinaisons: ["⭐ Petit serpentin (12 pts)"] };
        }
      }
    }

    if (Object.values(compte).reduce((a, n) => a + (n === 2 ? 1 : n === 4 ? 2 : -99), 0) === 7) {
      if (FAMILLES_NUM.includes(f0) && main.every(t => t.suit === f0) && cles.length === 7) {
        const vals = cles.map(c => +c.split('-')[1]).sort((a, b) => a - b);
        if (vals[6] - vals[0] === 6) return { points: 88, combinaisons: ["👑 Sept paires pures consécutives (88 pts)"] };
      }
      const g = this.evaluerGlobal(main);
      let pts = 24 + g.points;
      const combis = ["⭐ Sept paires (24 pts)", ...g.combinaisons];
      const pasHon = main.every(t => FAMILLES_NUM.includes(t.suit));
      const toutExt = pasHon && main.every(t => t.value === '1' || t.value === '9');
      if (main.every(t => !FAMILLES_NUM.includes(t.suit))) { pts += 64; combis.push("👑 Tout honneur (64 pts)"); }
      else if (toutExt) { pts += 64; combis.push("👑 Tout extrémité (64 pts)"); }
      else if (main.every(t => !FAMILLES_NUM.includes(t.suit) || t.value === '1' || t.value === '9')) { pts += 32; combis.push("👑 Tout honneur et extrémité (32 pts)"); }
      if (pasHon && !toutExt && !combis.some(c => ["Main pure", "Tout ordinaire", "Les trois", "Les quatre"].some(k => c.includes(k)))) {
        pts += 1; combis.push("⭐ Pas d'honneur (1 pt)");
      }
      return { points: pts, combinaisons: combis };
    }
    return { points: 0, combinaisons: [] };
  }

  private compter(main: { suit: string; value: string }[]): { [k: string]: number } {
    return main.reduce((acc, t) => ({ ...acc, [`${t.suit}-${t.value}`]: (acc[`${t.suit}-${t.value}`] || 0) + 1 }), {} as { [k: string]: number });
  }
}
