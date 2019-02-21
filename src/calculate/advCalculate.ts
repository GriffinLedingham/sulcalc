import Pokemon from "../Pokemon";
import Move from "../Move";
import Field from "../Field";
import { Stat, Type, damageVariation } from "../utilities";
import { isPhysicalType, isSpecialType } from "../info";
import moveInfo from "./moveInfo";

export default (
  attacker: Pokemon,
  defender: Pokemon,
  move: Move,
  field: Field
): number[] => {
  const info = moveInfo(attacker, defender, move, field);
  if (info.fail || info.effectiveness[0] === 0) return [0];
  const { moveType, movePower, effectiveness } = info;

  let atk = attacker.stat(Stat.ATK);
  let satk = attacker.stat(Stat.SATK);
  let def = defender.stat(Stat.DEF);
  let sdef = defender.stat(Stat.SDEF);

  if (
    attacker.ability.name === "Huge Power" ||
    attacker.ability.name === "Pure Power"
  ) {
    atk *= 2;
  }

  switch (attacker.item.name) {
    case "Choice Band":
      atk = Math.trunc((atk * 3) / 2);
      break;
    case "Soul Dew":
      if (attacker.name === "Latias" || attacker.name === "Latios") {
        satk = Math.trunc((satk * 3) / 2);
      }
      break;
    case "Deep Sea Tooth":
      if (attacker.name === "Clamperl") satk *= 2;
      break;
    case "Sea Incense":
      satk = Math.trunc((satk * 105) / 100);
      break;
    default:
      if (attacker.item.boostedType() === moveType) {
        // make sure we are boosting the right stat
        if (isPhysicalType(moveType)) {
          atk = Math.trunc((atk * 110) / 100);
        } else {
          satk = Math.trunc((satk * 110) / 100);
        }
      } else if (attacker.thickClubBoosted()) {
        atk *= 2;
      } else if (attacker.lightBallBoosted()) {
        satk *= 2;
      }
  }

  switch (defender.item.name) {
    case "Soul Dew":
      if (defender.name === "Latias" || defender.name === "Latios") {
        sdef = Math.trunc((sdef * 3) / 2);
      }
      break;
    case "Deep Sea Scale":
      if (defender.name === "Clamperl") sdef *= 2;
      break;
    case "Metal Powder":
      if (defender.name === "Ditto") def *= 2;
      break;
    /* no default */
  }

  switch (attacker.ability.name) {
    case "Hustle":
      atk = Math.trunc((atk * 3) / 2);
      break;
    case "Plus":
      if (attacker.minus) satk = Math.trunc((satk * 3) / 2);
      break;
    case "Minus":
      if (attacker.plus) satk = Math.trunc((satk * 3) / 2);
      break;
    case "Guts":
      if (attacker.status) atk = Math.trunc((atk * 3) / 2);
      break;
    /* no default */
  }

  switch (defender.ability.name) {
    case "Thick Fat":
      if (moveType === Type.FIRE || moveType === Type.ICE) {
        satk = Math.trunc(satk / 2);
      }
      break;
    case "Marvel Scale":
      if (defender.status) def = Math.trunc((def * 3) / 2);
      break;
    /* no default */
  }

  if (move.isExplosion()) {
    def = Math.max(1, Math.trunc(def / 2));
  }

  if (move.critical) {
    atk = Math.trunc((atk * Math.max(2, 2 + attacker.boosts[Stat.ATK])) / 2);
    satk = Math.trunc((satk * Math.max(2, 2 + attacker.boosts[Stat.SATK])) / 2);
    def = Math.trunc((def * 2) / Math.max(2, 2 - defender.boosts[Stat.DEF]));
    sdef = Math.trunc((sdef * 2) / Math.max(2, 2 - defender.boosts[Stat.SDEF]));
  } else {
    atk = Math.trunc(
      (atk * Math.max(2, 2 + attacker.boosts[Stat.ATK])) /
        Math.max(2, 2 - attacker.boosts[Stat.ATK])
    );
    satk = Math.trunc(
      (satk * Math.max(2, 2 + attacker.boosts[Stat.SATK])) /
        Math.max(2, 2 - attacker.boosts[Stat.SATK])
    );
    def = Math.trunc(
      (def * Math.max(2, 2 + defender.boosts[Stat.DEF])) /
        Math.max(2, 2 - defender.boosts[Stat.DEF])
    );
    sdef = Math.trunc(
      (sdef * Math.max(2, 2 + defender.boosts[Stat.SDEF])) /
        Math.max(2, 2 - defender.boosts[Stat.SDEF])
    );
  }

  let a, d, level;
  if (move.name === "Beat Up") {
    a = attacker.beatUpStats[move.beatUpHit];
    d = defender.baseStat(Stat.DEF);
    level = attacker.beatUpLevels[move.beatUpHit];
  } else if (isPhysicalType(moveType)) {
    a = atk;
    d = def;
    level = attacker.level;
  } else if (isSpecialType(moveType)) {
    a = satk;
    d = sdef;
    level = attacker.level;
  } else {
    return [0];
  }

  let baseDamage = Math.trunc(
    Math.trunc((Math.trunc((2 * level) / 5 + 2) * movePower * a) / d) / 50
  );

  if (move.name !== "Beat Up") {
    if (attacker.isBurned() && attacker.ability.name !== "Guts") {
      baseDamage = Math.trunc(baseDamage / 2);
    }

    if (
      !move.critical &&
      ((defender.reflect && isPhysicalType(moveType)) ||
        (defender.lightScreen && isSpecialType(moveType)))
    ) {
      baseDamage = Math.trunc(
        field.multiBattle ? (baseDamage * 2) / 3 : baseDamage / 2
      );
    }
  }

  if (field.multiBattle && move.hasMultipleTargets()) {
    baseDamage = Math.trunc(baseDamage / 2);
  }

  if (move.name !== "Weather Ball") {
    if (field.sun()) {
      if (moveType === Type.FIRE) {
        baseDamage = Math.trunc((baseDamage * 3) / 2);
      } else if (moveType === Type.WATER) {
        baseDamage = Math.trunc(baseDamage / 2);
      }
    } else if (field.rain()) {
      if (moveType === Type.WATER) {
        baseDamage = Math.trunc((baseDamage * 3) / 2);
      } else if (moveType === Type.FIRE) {
        baseDamage = Math.trunc(baseDamage / 2);
      }
    }
    if (!field.sun() && !field.isClearWeather() && move.name === "Solar Beam") {
      baseDamage = Math.trunc(baseDamage / 2);
    }
  }

  if (
    attacker.flashFire &&
    moveType === Type.FIRE &&
    attacker.ability.name === "Flash Fire"
  ) {
    baseDamage = Math.trunc((baseDamage * 3) / 2);
  }

  if (isPhysicalType(moveType)) {
    baseDamage = Math.max(1, baseDamage);
  }

  baseDamage += 2;

  if (move.critical) {
    baseDamage *= 2;
  }

  switch (move.name) {
    case "Facade":
      if (attacker.status) baseDamage *= 2;
      break;
    case "Pursuit":
      if (defender.switchedOut) baseDamage *= 2;
      break;
    case "Revenge":
      if (attacker.damagedPreviously) baseDamage *= 2;
      break;
    case "Smelling Salts":
      if (defender.isParalyzed()) baseDamage *= 2;
      break;
    case "Weather Ball":
      if (!field.isClearWeather()) baseDamage *= 2;
      break;
    /* no default */
  }

  if (move.minimize && move.boostedByMinimize()) {
    baseDamage *= 2;
  }

  if (attacker.charge && moveType === Type.ELECTRIC) {
    baseDamage *= 2;
  }

  if (attacker.helpingHand) {
    baseDamage = Math.trunc((baseDamage * 3) / 2);
  }

  if (attacker.stab(moveType)) {
    baseDamage = Math.trunc((baseDamage * 3) / 2);
  }

  baseDamage = Math.trunc((baseDamage * effectiveness[0]) / effectiveness[1]);

  if (move.name === "Spit Up") return [baseDamage];

  const damages = damageVariation(baseDamage, 85, 100);

  return damages;
};
