import { flowRight } from "lodash";
import Multiset from "../Multiset";
import { Gens, Stats } from "../utilities";
import rbyCalculate from "./rbyCalculate";
import gscCalculate from "./gscCalculate";
import advCalculate from "./advCalculate";
import hgssCalculate from "./hgssCalculate";
import b2w2Calculate from "./b2w2Calculate";
import orasCalculate from "./orasCalculate";
import smCalculate from "./smCalculate";

const genCalculate = flowRight(
  damage => new Multiset(damage),
  (attacker, defender, move, field) => {
    const gen = field.gen;
    const maxHp = defender.stat(Stats.HP);
    const level = attacker.level;

    switch (move.name) {
      case "Seismic Toss":
      case "Night Shade":
        return [attacker.level];
      case "Dragon Rage":
        return [40];
      case "Sonic Boom":
        return [20];
      case "Psywave":
        if (gen <= Gens.GSC) {
          // intentionally 1-149
          const range = [];
          for (let i = 1; i < Math.trunc((level * 3) / 2); i++) {
            range.push(i);
          }
          return range;
        }
        {
          const range = [];
          for (let i = 50; i <= 150; i += gen <= Gens.HGSS ? 10 : 1) {
            range.push(Math.max(1, Math.trunc((level * i) / 100)));
          }
          return range;
        }
      case "Super Fang":
      case "Nature's Madness":
        return [Math.max(1, Math.trunc(defender.currentHp / 2))];
      case "Guardian of Alola":
        return [Math.max(1, Math.trunc((defender.currentHp * 3) / 4))];
      case "Endeavor":
        return [Math.max(0, defender.currentHp - attacker.currentHp)];
      case "Final Gambit":
        return [attacker.currentHp];
      default:
        if (
          move.isOther() ||
          (move.isSound() && defender.ability.name === "Soundproof") ||
          (move.isBall() && defender.ability.name === "Bulletproof") ||
          (move.isExplosion() && defender.ability.name === "Damp")
        ) {
          return [0];
        }
        if (move.isOhko()) {
          return [maxHp];
        }
    }

    const calculateFns = [
      undefined,
      rbyCalculate,
      gscCalculate,
      advCalculate,
      hgssCalculate,
      b2w2Calculate,
      orasCalculate,
      smCalculate
    ];
    let damages = calculateFns[field.gen](attacker, defender, move, field);

    if (defender.ability.name === "Sturdy" && defender.currentHp === maxHp) {
      damages = damages.map(d => Math.min(maxHp - 1, d));
    }

    return damages;
  }
);

function turnCalculate(attacker, defender, move, field) {
  let dmg;
  if (move.name === "Triple Kick") {
    dmg = new Multiset([0]);
    for (let i = 1; i <= 3; i++) {
      move.tripleKickCount = i;
      dmg = dmg.permute(genCalculate(attacker, defender, move, field));
      defender.brokenMultiscale = true;
    }
    move.tripleKickCount = 1;
  } else if (move.name === "Beat Up") {
    dmg = new Multiset([0]);
    for (let i = 0; i < attacker.beatUpStats.length; i++) {
      move.beatUpHit = i;
      dmg = dmg.permute(genCalculate(attacker, defender, move, field));
      defender.brokenMultiscale = true;
    }
    move.beatUpHit = 0;
  } else if (move.name === "Present") {
    const heal = new Multiset([
      -Math.max(1, Math.floor(defender.stat(Stats.HP) / 4))
    ]);
    if (move.present === -1) {
      const dmgs = [heal];
      for (let i = 1; i <= 3; i++) {
        move.present = i;
        dmgs.push(genCalculate(attacker, defender, move, field));
      }
      move.present = -1;
      dmg = Multiset.weightedUnion(
        dmgs,
        field.gen >= Gens.ADV ? [2, 4, 3, 1] : [52, 102, 76, 26]
      );
    } else if (move.present === 0) {
      dmg = heal;
    } else {
      dmg = genCalculate(attacker, defender, move, field);
    }
  } else if (
    attacker.ability.name === "Parental Bond" &&
    move.maxHits() === 1 &&
    move.affectedByParentalBond() &&
    !(field.multiBattle && move.hasMultipleTargets())
  ) {
    // Parental Bond has no effect on Multi Hit moves in all cases
    // or in Multiple Target moves during non-Singles battles.
    // Fixed damage moves are still fixed. Psywave is calculated twice.
    // Fling, Self-Destruct, Explosion, Final Gambit, and Endeavor
    // are excluded from the effect.
    // Hits once at full power, and once at half power.
    dmg = genCalculate(attacker, defender, move, field);
    move.secondHit = true;
    defender.brokenMultiscale = true;
    dmg = dmg.permute(genCalculate(attacker, defender, move, field));
    move.secondHit = false;
  } else if (move.maxHits() > 1) {
    // multi-hit moves
    const dmgs = [new Multiset([0])];

    for (let i = 1; i <= move.maxHits(); i++) {
      if (field.gen >= Gens.GSC) {
        dmgs.push(
          dmgs[i - 1].permute(genCalculate(attacker, defender, move, field))
        );
      } else {
        dmgs.push(
          genCalculate(attacker, defender, move, field).map(d => d * i)
        );
      }
      defender.brokenMultiscale = true;
    }

    if (move.numberOfHits >= 1) {
      dmg = dmgs[move.numberOfHits];
    } else if (move.maxHits() === 2) {
      dmg = dmgs[2];
    } else {
      /*
       *  before b2w2:
       * 2 hits (3/8), 3 hits (3/8), 4 hits (1/8), 5 hits (1/8)
       * after b2w2:
       * 2 hits (1/3), 3 hits (1/3), 4 hits (1/6), 5 hits (1/6)
       */
      const weights =
        field.gen >= Gens.B2W2 ? [0, 0, 2, 2, 1, 1] : [0, 0, 3, 3, 1, 1];
      dmg = Multiset.weightedUnion(
        dmgs.slice(move.minHits(), move.maxHits()),
        weights.slice(move.minHits(), move.maxHits())
      );
    }
  } else {
    // simple move; default case.
    dmg = genCalculate(attacker, defender, move, field);
    defender.brokenMultiscale = true;
  }

  if (move.name === "Knock Off" && defender.knockOff()) {
    defender.item.used = true;
  }

  return dmg.size.leq(39) ? dmg : dmg.simplify();
}

export default (attacker, defender, move, field) => {
  const dmg = [];
  if (move.name === "(No Move)") {
    dmg.push(new Multiset([0]));
    dmg.push(0);
  } else if (move.name === "Fury Cutter") {
    const tempCutter = move.furyCutter;
    while (move.furyCutter <= 5) {
      dmg.push(turnCalculate(attacker, defender, move, field));
      move.furyCutter++;
    }
    move.furyCutter = tempCutter;
    // point to the last damage range
    dmg.push(-1);
  } else if (move.name === "Echoed Voice") {
    const tempVoice = move.echoedVoice;
    while (move.echoedVoice <= 4) {
      dmg.push(turnCalculate(attacker, defender, move, field));
      move.echoedVoice++;
    }
    move.echoedVoice = tempVoice;
    // point to the last damage range
    dmg.push(-1);
  } else if (move.name === "Trump Card") {
    const tempPP = move.trumpPP;
    dmg.push(turnCalculate(attacker, defender, move, field));
    while (move.trumpPP > 0) {
      if (defender.ability.name === "Pressure") {
        move.trumpPP -= Math.min(2, move.trumpPP);
      } else {
        move.trumpPP--;
      }
      dmg.push(turnCalculate(attacker, defender, move, field));
    }
    move.trumpPP = tempPP;
    // no more PP, no more damage ranges
    dmg.push(0);
  } else if (move.name === "Explosion" || move.name === "Self-Destruct") {
    dmg.push(turnCalculate(attacker, defender, move, field));
    dmg.push(0);
  } else if (move.name === "Rollout" || move.name === "Ice Ball") {
    const tempRollout = move.rollout;
    // repeat 5 times, the formulas wrap around automatically
    for (let i = 0; i < 5; i++) {
      dmg.push(turnCalculate(attacker, defender, move, field));
      move.rollout++;
    }
    dmg.push(-dmg.length);
    move.rollout = tempRollout;
  } else {
    dmg.push(turnCalculate(attacker, defender, move, field));
    // an item like a type-resist berry or a gem might get used
    dmg.push(turnCalculate(attacker, defender, move, field));
    // only repeat the last roll
    dmg.push(-1);
  }
  defender.brokenMultiscale = false;
  return dmg;
};
