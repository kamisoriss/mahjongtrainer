import { Service } from '@angular/core';
import { Tuile, GroupeDeclare } from '../simulationmain-richii/simulationmain-riichi';

export interface ContexteRiichi {
  estTsumo?: boolean;
  estRiichi?: boolean;
  estDoubleRiichi?: boolean;
  estIppatsu?: boolean;
  estDerniereTuile?: boolean;
  estRinshan?: boolean;
  estChankan?: boolean;
  estPremierTour?: boolean;
  nbDora?: number;
  typeAttente?: 'aucune' | 'ryanmen' | 'shanpon' | 'tanki' | 'kanchan' | 'penchan';
  ventDominant?: string;
  ventJoueur?: string;
  tuilesDeclarees?: GroupeDeclare[];
}

export interface ResultatAnalyseRiichi {
  han: number;
  fu: number;
  points: number;
  detailPaiement: string;
  rang: string;
  yaku: string[];
  estValideRiichi: boolean;
}

interface SetMahjong {
  type: 'chow' | 'pong' | 'kong' | 'paire';
  suit: string;
  valeurs: string[];
  estCache: boolean;
}
const FAMILLES_NUM = ['soul', 'pin', 'man'];
const VENTS_MAP: { [k: string]: string } = { '1': 'est', '2': 'sud', '3': 'west', '4': 'nord' };

@Service()
export class Analysemainriichi {
  analyserMain(main: Tuile[], ctx: ContexteRiichi = {}): ResultatAnalyseRiichi {
    const declares = ctx.tuilesDeclarees || [];
    const nbBase =
      main.length + declares.reduce((a, g) => a + (g.type === 'kong' ? 3 : g.tuiles.length), 0);
    if (nbBase !== 14) return this.echec(`Main incomplète (${nbBase} / 14 tuiles)`);

    const norm = (t: Tuile) => ({
      suit: t.suit.toLowerCase(),
      value: t.value.toString().toLowerCase(),
    });
    const toutes = [...main, ...declares.flatMap((g) => g.tuiles)].map(norm);
    const compteTotal = this.compter(toutes),
      compteCache = this.compter(main.map(norm));

    if (Object.values(compteTotal).some((n) => n > 4))
      return this.echec("Main invalide : maximum 4 exemplaires d'une même tuile.");

    const estMenzen = declares.every((g) => g.type === 'kong' && g.estCache);
    let meilleur: ResultatAnalyseRiichi | null =
      declares.length === 0 ? this.evaluerSpeciales(toutes, compteTotal, ctx) : null;

    for (const st of this.trouverStructures(compteCache, declares)) {
      const ev = this.evaluerStandard(st, toutes, ctx, estMenzen, declares.length === 0);
      if (
        !meilleur ||
        ev.points > meilleur.points ||
        (ev.points === meilleur.points && ev.han > meilleur.han)
      )
        meilleur = ev;
    }

    if (!meilleur) return this.echec('Structure de main invalide.');
    return meilleur.estValideRiichi
      ? meilleur
      : this.echec('Aucun Yaku : 1 Yaku minimum requis (les Dora seuls ne suffisent pas).');
  }

  private trouverStructures(
    compteCache: { [k: string]: number },
    declares: GroupeDeclare[],
  ): SetMahjong[][] {
    const pre: SetMahjong[] = declares.map((g) => ({
      type: g.type,
      suit: g.tuiles[0].suit.toLowerCase(),
      valeurs: g.tuiles.map((t) => t.value.toString().toLowerCase()).sort((a, b) => +a - +b),
      estCache: g.estCache,
    }));
    const restants = 4 - pre.length;
    if (restants < 0) return [];

    const structures: SetMahjong[][] = [];
    for (const cle of Object.keys(compteCache).filter((k) => compteCache[k] >= 2)) {
      const [suit, val] = cle.split('-');
      const paire: SetMahjong = { type: 'paire', suit, valeurs: [val, val], estCache: true };
      for (const sets of this.extraireSets(
        { ...compteCache, [cle]: compteCache[cle] - 2 },
        restants,
      )) {
        structures.push([paire, ...pre, ...sets]);
      }
    }
    return structures;
  }

  private extraireSets(compte: { [k: string]: number }, voulus: number): SetMahjong[][] {
    if (voulus === 0) return Object.values(compte).reduce((a, b) => a + b, 0) === 0 ? [[]] : [];
    const cle = Object.keys(compte).find((k) => compte[k] > 0);
    if (!cle) return [];

    const [suit, valStr] = cle.split('-'),
      v = +valStr,
      res: SetMahjong[][] = [];
    if (compte[cle] >= 3) {
      compte[cle] -= 3;
      this.extraireSets(compte, voulus - 1).forEach((s) =>
        res.push([{ type: 'pong', suit, valeurs: [valStr, valStr, valStr], estCache: true }, ...s]),
      );
      compte[cle] += 3;
    }
    if (
      FAMILLES_NUM.includes(suit) &&
      v <= 7 &&
      (compte[`${suit}-${v + 1}`] || 0) > 0 &&
      (compte[`${suit}-${v + 2}`] || 0) > 0
    ) {
      compte[cle]--;
      compte[`${suit}-${v + 1}`]--;
      compte[`${suit}-${v + 2}`]--;
      this.extraireSets(compte, voulus - 1).forEach((s) =>
        res.push([
          { type: 'chow', suit, valeurs: [valStr, `${v + 1}`, `${v + 2}`], estCache: true },
          ...s,
        ]),
      );
      compte[cle]++;
      compte[`${suit}-${v + 1}`]++;
      compte[`${suit}-${v + 2}`]++;
    }
    return res;
  }

  private evaluerSpeciales(
    main: { suit: string; value: string }[],
    compte: { [k: string]: number },
    ctx: ContexteRiichi,
  ): ResultatAnalyseRiichi | null {
    const yakumans: string[] = [];
    if (ctx.estPremierTour && ctx.estTsumo)
      yakumans.push(ctx.ventJoueur === 'est' ? '👑 Tenhou (Yakuman)' : '👑 Chiihou (Yakuman)');

    const req13 = [
      'soul-1',
      'soul-9',
      'pin-1',
      'pin-9',
      'man-1',
      'man-9',
      'vent-1',
      'vent-2',
      'vent-3',
      'vent-4',
      'dragon-1',
      'dragon-2',
      'dragon-3',
    ];
    if (req13.every((k) => (compte[k] || 0) >= 1) && Object.keys(compte).length === 13) {
      return this.scoreYakuman([...yakumans, '👑 Kokushi Musou (Yakuman)'], ctx);
    }

    const f0 = main[0].suit;
    if (FAMILLES_NUM.includes(f0) && main.every((t) => t.suit === f0)) {
      const v = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      main.forEach((t) => v[+t.value]++);
      if (v[1] >= 3 && v[9] >= 3 && [2, 3, 4, 5, 6, 7, 8].every((i) => v[i] >= 1)) {
        return this.scoreYakuman([...yakumans, '👑 Chuuren Poutou (Yakuman)'], ctx);
      }
    }

    if (Object.keys(compte).filter((k) => compte[k] === 2).length === 7) {
      if (main.every((t) => !FAMILLES_NUM.includes(t.suit)))
        yakumans.push('👑 Tsuuiisou (Yakuman)');
      if (yakumans.length) return this.scoreYakuman(yakumans, ctx);

      let han = 2;
      const yaku = ['⭐ Chiitoitsu (2 Han)'],
        add = (h: number, n: string) => {
          han += h;
          yaku.push(n);
        };
      if (ctx.estPremierTour && !ctx.estTsumo) add(5, '⭐ Renhou (Mangan)');
      this.ajouterYakuContexte(ctx, true, false, add);

      const pasHon = main.every((t) => FAMILLES_NUM.includes(t.suit));
      if (pasHon && main.every((t) => +t.value >= 2 && +t.value <= 8)) add(1, '⭐ Tanyao (1 Han)');
      if (main.every((t) => !FAMILLES_NUM.includes(t.suit) || t.value === '1' || t.value === '9'))
        add(2, '⭐ Honroutou (2 Han)');

      const familles = new Set(main.map((t) => t.suit));
      const famNum = Array.from(familles).filter((f) => FAMILLES_NUM.includes(f));
      if (familles.size === 1 && pasHon) add(6, "👑 Chin'itsu (6 Han)");
      else if (!pasHon && famNum.length === 1) add(3, "⭐ Hon'itsu (3 Han)");
      if (ctx.nbDora && ctx.nbDora > 0) add(ctx.nbDora, `🎯 Dora (${ctx.nbDora} Han)`);

      return this.calculerPoints(han, 25, yaku, ctx, true);
    }
    return null;
  }

  private evaluerStandard(
    st: SetMahjong[],
    main: { suit: string; value: string }[],
    ctx: ContexteRiichi,
    estMenzen: boolean,
    sansDeclaration: boolean,
  ): ResultatAnalyseRiichi {
    const chows = st.filter((s) => s.type === 'chow'),
      pongs = st.filter((s) => s.type === 'pong' || s.type === 'kong');
    const kongs = st.filter((s) => s.type === 'kong'),
      paire = st.find((s) => s.type === 'paire')!;
    const pasHon = main.every((t) => FAMILLES_NUM.includes(t.suit)),
      toutHon = main.every((t) => !FAMILLES_NUM.includes(t.suit));

    let nbPongsCaches = pongs.filter((p) => p.estCache).length;
    if (
      !ctx.estTsumo &&
      nbPongsCaches > 0 &&
      (ctx.typeAttente === 'shanpon' || (pongs.length === 4 && ctx.typeAttente !== 'tanki'))
    )
      nbPongsCaches--;

    const yakumans: string[] = [];
    if (sansDeclaration && ctx.estPremierTour && ctx.estTsumo)
      yakumans.push(ctx.ventJoueur === 'est' ? '👑 Tenhou (Yakuman)' : '👑 Chiihou (Yakuman)');
    if (estMenzen && nbPongsCaches === 4) yakumans.push('👑 Suuankou (Yakuman)');
    if (pongs.filter((p) => p.suit === 'dragon').length === 3)
      yakumans.push('👑 Daisangen (Yakuman)');
    const pVents = pongs.filter((p) => p.suit === 'vent');
    if (pVents.length === 4) yakumans.push('👑 Daisuushi (Yakuman)');
    else if (pVents.length === 3 && paire.suit === 'vent') yakumans.push('👑 Shousuushi (Yakuman)');
    if (toutHon) yakumans.push('👑 Tsuuiisou (Yakuman)');
    if (pasHon && main.every((t) => t.value === '1' || t.value === '9'))
      yakumans.push('👑 Chinroutou (Yakuman)');
    if (
      main.every((t) =>
        ['soul-2', 'soul-3', 'soul-4', 'soul-6', 'soul-8', 'dragon-2'].includes(
          `${t.suit}-${t.value}`,
        ),
      )
    )
      yakumans.push('👑 Ryuuiisou (Yakuman)');
    if (kongs.length === 4) yakumans.push('👑 Suukantsu (Yakuman)');
    if (yakumans.length) return this.scoreYakuman(yakumans, ctx);

    let han = 0;
    const yaku: string[] = [],
      add = (h: number, n: string) => {
        han += h;
        yaku.push(n);
      };
    if (sansDeclaration && ctx.estPremierTour && !ctx.estTsumo) add(5, '⭐ Renhou (Mangan)');
    this.ajouterYakuContexte(ctx, estMenzen, kongs.length > 0, add);

    const paireYakuhai =
      paire.suit === 'dragon' ||
      (paire.suit === 'vent' &&
        (VENTS_MAP[paire.valeurs[0]] === ctx.ventDominant ||
          VENTS_MAP[paire.valeurs[0]] === ctx.ventJoueur));
    const estPinfu =
      estMenzen &&
      chows.length === 4 &&
      !paireYakuhai &&
      (!ctx.typeAttente || ctx.typeAttente === 'aucune' || ctx.typeAttente === 'ryanmen') &&
      !ctx.estRinshan;
    if (estPinfu) add(1, '⭐ Pinfu (1 Han)');
    if (pasHon && main.every((t) => +t.value >= 2 && +t.value <= 8)) add(1, '⭐ Tanyao (1 Han)');

    if (estMenzen && chows.length >= 2) {
      const pairesChows = Object.values(
        this.compter(chows.map((c) => ({ suit: c.suit, value: c.valeurs[0] }))),
      ).reduce((a, n) => a + Math.floor(n / 2), 0);
      if (pairesChows === 2) add(3, '⭐ Ryanpeikou (3 Han)');
      else if (pairesChows === 1) add(1, '⭐ Iipeikou (1 Han)');
    }

    const dNames: { [k: string]: string } = { '1': 'Chun', '2': 'Hatsu', '3': 'Haku' };
    pongs
      .filter((p) => p.suit === 'dragon')
      .forEach((p) => add(1, `⭐ Yakuhai (${dNames[p.valeurs[0]]}) (1 Han)`));
    if (pongs.filter((p) => p.suit === 'dragon').length === 2 && paire.suit === 'dragon')
      add(2, '⭐ Shousangen (2 Han)');
    pVents.forEach((p) => {
      if (VENTS_MAP[p.valeurs[0]] === ctx.ventDominant) add(1, '⭐ Yakuhai (Bakaze) (1 Han)');
      if (VENTS_MAP[p.valeurs[0]] === ctx.ventJoueur) add(1, '⭐ Yakuhai (Jikaze) (1 Han)');
    });

    if (pongs.length === 4) add(2, '⭐ Toitoi (2 Han)');
    if (nbPongsCaches === 3) add(2, "⭐ San'ankou (2 Han)");
    if (kongs.length === 3) add(2, '⭐ Sankantsu (2 Han)');

    for (let n = 1; n <= 9; n++) {
      if (n <= 7 && new Set(chows.filter((c) => +c.valeurs[0] === n).map((c) => c.suit)).size === 3)
        add(estMenzen ? 2 : 1, `⭐ Sanshoku Doujun (${estMenzen ? 2 : 1} Han)`);
      if (
        new Set(
          pongs
            .filter((p) => FAMILLES_NUM.includes(p.suit) && +p.valeurs[0] === n)
            .map((p) => p.suit),
        ).size === 3
      )
        add(2, '⭐ Sanshoku Doukou (2 Han)');
    }
    FAMILLES_NUM.forEach((s) => {
      const v = chows.filter((c) => c.suit === s).map((c) => +c.valeurs[0]);
      if (v.includes(1) && v.includes(4) && v.includes(7))
        add(estMenzen ? 2 : 1, `⭐ Ittsuu (${estMenzen ? 2 : 1} Han)`);
    });

    if (main.every((t) => !FAMILLES_NUM.includes(t.suit) || t.value === '1' || t.value === '9'))
      add(2, '⭐ Honroutou (2 Han)');
    else if (pasHon && st.every((s) => s.valeurs.includes('1') || s.valeurs.includes('9')))
      add(estMenzen ? 3 : 2, `⭐ Junchan (${estMenzen ? 3 : 2} Han)`);
    else if (
      st.every(
        (s) => !FAMILLES_NUM.includes(s.suit) || s.valeurs.includes('1') || s.valeurs.includes('9'),
      )
    )
      add(estMenzen ? 2 : 1, `⭐ Chanta (${estMenzen ? 2 : 1} Han)`);

    const familles = new Set(main.map((t) => t.suit)),
      famNum = Array.from(familles).filter((f) => FAMILLES_NUM.includes(f));
    if (familles.size === 1 && pasHon)
      add(estMenzen ? 6 : 5, `👑 Chin'itsu (${estMenzen ? 6 : 5} Han)`);
    else if (!pasHon && famNum.length === 1)
      add(estMenzen ? 3 : 2, `⭐ Hon'itsu (${estMenzen ? 3 : 2} Han)`);

    const valide = han > 0;
    if (valide && ctx.nbDora && ctx.nbDora > 0) add(ctx.nbDora, `🎯 Dora (${ctx.nbDora} Han)`);
    return this.calculerPoints(
      han,
      this.calculerFu(st, ctx, estMenzen, estPinfu),
      yaku,
      ctx,
      valide,
    );
  }

  private ajouterYakuContexte(
    ctx: ContexteRiichi,
    estMenzen: boolean,
    aKan: boolean,
    add: (h: number, n: string) => void,
  ) {
    if (estMenzen) {
      if (ctx.estDoubleRiichi) add(2, '🎯 Daburu Riichi (2 Han)');
      else if (ctx.estRiichi) add(1, '🎯 Riichi (1 Han)');
      if ((ctx.estRiichi || ctx.estDoubleRiichi) && ctx.estIppatsu) add(1, '🎯 Ippatsu (1 Han)');
      if (ctx.estTsumo) add(1, '🎯 Menzen Tsumo (1 Han)');
    }
    if (ctx.estRinshan && ctx.estTsumo && aKan) add(1, '🎯 Rinshan Kaihou (1 Han)');
    else if (ctx.estChankan && !ctx.estTsumo) add(1, '🎯 Chankan (1 Han)');
    else if (ctx.estDerniereTuile)
      add(1, ctx.estTsumo ? '🎯 Haitei Raoyue (1 Han)' : '🎯 Houtei Raoyui (1 Han)');
  }

  private calculerFu(
    st: SetMahjong[],
    ctx: ContexteRiichi,
    estMenzen: boolean,
    estPinfu: boolean,
  ): number {
    if (estPinfu) return ctx.estTsumo ? 20 : 30;
    let fu = 20 + (estMenzen && !ctx.estTsumo ? 10 : 0) + (ctx.estTsumo ? 2 : 0);
    if (['tanki', 'kanchan', 'penchan'].includes(ctx.typeAttente || '')) fu += 2;

    const paire = st.find((s) => s.type === 'paire')!;
    if (paire.suit === 'dragon') fu += 2;
    if (paire.suit === 'vent') {
      if (VENTS_MAP[paire.valeurs[0]] === ctx.ventDominant) fu += 2;
      if (VENTS_MAP[paire.valeurs[0]] === ctx.ventJoueur) fu += 2;
    }

    const pongs = st.filter((s) => s.type === 'pong' || s.type === 'kong');
    pongs.forEach((p, idx) => {
      let base =
        !FAMILLES_NUM.includes(p.suit) || p.valeurs[0] === '1' || p.valeurs[0] === '9' ? 4 : 2;
      if (p.type === 'kong') base *= 4;
      const shanponRon =
        !ctx.estTsumo &&
        ctx.typeAttente === 'shanpon' &&
        p.type === 'pong' &&
        p.estCache &&
        idx === pongs.length - 1;
      if (p.estCache && !shanponRon) base *= 2;
      fu += base;
    });
    return !estMenzen && fu === 20 ? 30 : Math.ceil(fu / 10) * 10;
  }

  private calculerPoints(
    han: number,
    fu: number,
    yaku: string[],
    ctx: ContexteRiichi,
    valide: boolean,
  ): ResultatAnalyseRiichi {
    if (!valide || han === 0) return this.echec('Invalide');
    const estOya = ctx.ventJoueur === 'est',
      arr100 = (n: number) => Math.ceil(n / 100) * 100;
    let base = fu * Math.pow(2, 2 + han),
      rang = `${han} Han / ${fu} Fu`;

    if (han >= 13) {
      base = 8000;
      rang = '👑 Kazoe Yakuman (13+ Han)';
    } else if (han >= 11) {
      base = 6000;
      rang = '🔥 Sanbaiman (11-12 Han)';
    } else if (han >= 8) {
      base = 4000;
      rang = '🔥 Baiman (8-10 Han)';
    } else if (han >= 6) {
      base = 3000;
      rang = '🔥 Haneman (6-7 Han)';
    } else if (han >= 5 || base >= 2000) {
      base = 2000;
      rang = '⚡ Mangan';
    }

    if (estOya) {
      const part = arr100(base * 2),
        tot = ctx.estTsumo ? part * 3 : arr100(base * 6);
      return {
        han,
        fu,
        points: tot,
        detailPaiement: ctx.estTsumo
          ? `Oya - Tsumo : ${part} pts chacun`
          : `Oya - Ron : ${tot} pts`,
        rang,
        yaku,
        estValideRiichi: true,
      };
    }
    const pKo = arr100(base),
      pOya = arr100(base * 2),
      tot = ctx.estTsumo ? pKo * 2 + pOya : arr100(base * 4);
    return {
      han,
      fu,
      points: tot,
      detailPaiement: ctx.estTsumo ? `Ko - Tsumo : ${pKo} / ${pOya} pts` : `Ko - Ron : ${tot} pts`,
      rang,
      yaku,
      estValideRiichi: true,
    };
  }

  private scoreYakuman(yakumans: string[], ctx: ContexteRiichi): ResultatAnalyseRiichi {
    const mult = yakumans.length,
      estOya = ctx.ventJoueur === 'est',
      base = 8000 * mult,
      tot = estOya ? base * 6 : base * 4;
    const detail = estOya
      ? ctx.estTsumo
        ? `Oya - Tsumo : ${base * 2} pts chacun`
        : `Oya - Ron : ${tot} pts`
      : ctx.estTsumo
        ? `Ko - Tsumo : ${base} / ${base * 2} pts`
        : `Ko - Ron : ${tot} pts`;
    return {
      han: 13 * mult,
      fu: 0,
      points: tot,
      detailPaiement: detail,
      rang: mult > 1 ? `👑 Yakuman (x${mult})` : '👑 Yakuman',
      yaku: yakumans,
      estValideRiichi: true,
    };
  }

  private echec(msg: string): ResultatAnalyseRiichi {
    return {
      han: 0,
      fu: 0,
      points: 0,
      detailPaiement: '',
      rang: '',
      yaku: [msg],
      estValideRiichi: false,
    };
  }
  private compter(main: { suit: string; value: string }[]): { [k: string]: number } {
    return main.reduce(
      (acc, t) => ({ ...acc, [`${t.suit}-${t.value}`]: (acc[`${t.suit}-${t.value}`] || 0) + 1 }),
      {} as { [k: string]: number },
    );
  }
}
