import path from "path";
import fs from "fs-extra";
import _ from "lodash/fp";
import { info, Move, Stat, Pokemon, Generation } from "../src";

const mapValuesUncapped = _.mapValues.convert({ cap: false });

const minifySet = _.curry((set, pokemonId, gen) => {
  const statMatches = {
    hp: Stat.HP,
    at: Stat.ATK,
    df: Stat.DEF,
    sa: Stat.SATK,
    sd: Stat.SDEF,
    sp: Stat.SPD
  };

  const pokemon = new Pokemon({
    gen,
    level: set.level,
    ability: set.ability,
    item: set.item
  });

  pokemon.nature = info.natureId(set.nature !== undefined ? set.nature : "");

  pokemon.moves = _.map(move => new Move({ name: move, gen }), set.moves);

  if (set.evs) {
    for (const [stat, value] of Object.entries(set.evs)) {
      pokemon.evs[statMatches[stat]] = value;
    }
  }

  if (set.ivs) {
    for (const [stat, value] of Object.entries(set.ivs)) {
      pokemon.ivs[statMatches[stat]] = value;
    }
  }

  return pokemon.toSet();
});

const minifySets = _.curry((sets, pokemonId, gen) => {
  const capRemoved = _.omitBy((set, name) => name.includes("CAP"), sets);
  return _.mapValues(minifySet(_, pokemonId, gen), capRemoved);
});

const minifySetdex = (setdex, gen) => {
  const translated = _.mapKeys(name => info.pokemonId(name), setdex);
  const omitted = _.omitBy((sets, id) => id === "nopokemon", translated);
  return mapValuesUncapped(minifySets(_, _, gen), omitted);
};

const setdex = async () => {
  const inDir = path.join(__dirname, "data/setdex");
  const outDir = path.join(__dirname, "../dist/setdex");
  await fs.mkdirs(outDir);
  const files = [
    ["setdex_rby", Generation.RBY],
    ["setdex_gsc", Generation.GSC],
    ["setdex_rse", Generation.ADV],
    ["setdex_dpp", Generation.HGSS],
    ["setdex_bw", Generation.B2W2],
    ["setdex_xy", Generation.ORAS],
    ["setdex_sm", Generation.SM],
    ["setdex_rby_pp", Generation.RBY],
    ["setdex_xy_pp", Generation.ORAS]
  ].map(async ([file, gen]) => {
    const setdexData = (await import(path.join(inDir, file + ".js"))).default;
    const minifiedSetdex = minifySetdex(setdexData, gen);
    await fs.writeFile(
      path.join(outDir, file + ".ts"),
      `export default ${JSON.stringify(minifiedSetdex)}`
    );
  });
  await Promise.all([
    ...files,
    fs.writeFile(
      path.join(outDir, "smogon.ts"),
      `
        import rby from "./setdex_rby.ts"
        import gsc from "./setdex_gsc.ts"
        import adv from "./setdex_rse.ts"
        import hgss from "./setdex_dpp.ts"
        import b2w2 from "./setdex_bw.ts"
        import oras from "./setdex_xy.ts"
        import sm from "./setdex_sm.ts"
        export default [{}, rby, gsc, adv, hgss, b2w2, oras, sm]
      `
    ),
    fs.writeFile(
      path.join(outDir, "pokemonPerfect.ts"),
      `
        import rby from "./setdex_rby_pp.ts"
        import oras from "./setdex_xy_pp.ts"
        export default [{}, rby, {}, {}, {}, {}, oras, {}]
      `
    )
  ]);
};

setdex().catch(error => {
  console.error(error);
});
