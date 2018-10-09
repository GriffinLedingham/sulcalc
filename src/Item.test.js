import Item from "sulcalc/Item";
import { Gens, Types, maxGen } from "sulcalc/utilities";

let noItem, leftovers, chopleBerry, chilanBerry;
beforeEach(() => {
  noItem = new Item();
  leftovers = new Item({ name: "Leftovers" });
  chopleBerry = new Item({ name: "Chople Berry" });
  chilanBerry = new Item({ name: "Chilan Berry" });
});

test("#constructor()", () => {
  const item1 = new Item({ name: "Leftovers" });
  expect(item1.id).toEqual("leftovers");
  expect(item1.used).toBe(false);
  expect(item1.disabled).toBe(false);
  expect(item1.gen).toEqual(maxGen);

  const item2 = new Item({
    name: "Leftovers",
    disabled: true
  });
  expect(item2.id).toEqual("leftovers");
  expect(item2.used).toBe(false);
  expect(item2.disabled).toBe(true);
  expect(item2.gen).toEqual(maxGen);

  const item3 = new Item({
    id: "leftovers",
    used: true,
    gen: Gens.GSC
  });
  expect(item3.id).toEqual("leftovers");
  expect(item3.used).toBe(true);
  expect(item3.disabled).toBe(false);
  expect(item3.gen).toEqual(2);
});

test("#name", () => {
  expect(noItem.name).toEqual("(No Item)");
  expect(chopleBerry.name).toEqual("Chople Berry");

  chopleBerry.disabled = true;
  expect(chopleBerry.name).toEqual("(No Item)");

  chopleBerry.disabled = false;
  chopleBerry.used = true;
  expect(chopleBerry.name).toEqual("(No Item)");

  const item = new Item();
  expect(item.id).toEqual("noitem");

  item.name = "Leftovers";
  expect(item.id).toEqual("leftovers");

  item.name = "  chople  berry";
  expect(item.id).toEqual("chopleberry");

  item.name = "l eftovers";
  expect(item.id).toEqual("leftovers");
});

test("#nonDisabledName()", () => {
  expect(chopleBerry.nonDisabledName()).toEqual("Chople Berry");

  chopleBerry.disabled = true;
  expect(chopleBerry.nonDisabledName()).toEqual("Chople Berry");

  chopleBerry.used = true;
  expect(chopleBerry.nonDisabledName()).toEqual("(No Item)");
});

test("#boostedType()", () => {
  const mysticWater = new Item({ name: "Mystic Water" });
  const zapPlate = new Item({ name: "Zap Plate" });

  expect(mysticWater.boostedType()).toEqual(Types.WATER);
  expect(zapPlate.boostedType()).toEqual(Types.ELECTRIC);
  expect(chopleBerry.boostedType()).toEqual(-1);

  mysticWater.disabled = true;
  expect(mysticWater.boostedType()).toEqual(-1);

  zapPlate.used = true;
  expect(zapPlate.boostedType()).toEqual(-1);
});

test("#isBerry()", () => {
  expect(leftovers.isBerry()).toBe(false);
  expect(chopleBerry.isBerry()).toBe(true);

  chopleBerry.disabled = true;
  expect(chopleBerry.isBerry()).toBe(true);

  chopleBerry.used = true;
  expect(chopleBerry.isBerry()).toBe(false);
});

test("#berryTypeResist()", () => {
  expect(chopleBerry.berryTypeResist()).toEqual(Types.FIGHTING);
  expect(chilanBerry.berryTypeResist()).toEqual(Types.NORMAL);
  expect(noItem.berryTypeResist()).toEqual(-1);

  chopleBerry.disabled = true;
  expect(chopleBerry.berryTypeResist()).toEqual(-1);

  chilanBerry.used = true;
  expect(chilanBerry.berryTypeResist()).toEqual(-1);
});

test("#naturalGiftPower()", () => {
  expect(noItem.naturalGiftPower()).toEqual(0);
  expect(chopleBerry.naturalGiftPower()).toEqual(80);

  chopleBerry.gen = Gens.B2W2;
  expect(chopleBerry.naturalGiftPower()).toEqual(60);

  chopleBerry.disabled = true;
  expect(chopleBerry.naturalGiftPower()).toEqual(0);

  chilanBerry.used = true;
  expect(chilanBerry.naturalGiftPower()).toEqual(0);
});

test("#naturalGiftType()", () => {
  expect(noItem.naturalGiftType()).toEqual(-1);
  expect(chopleBerry.naturalGiftType()).toEqual(Types.FIGHTING);

  chopleBerry.disabled = true;
  expect(chopleBerry.naturalGiftType()).toEqual(-1);

  chilanBerry.used = true;
  expect(chilanBerry.naturalGiftType()).toEqual(-1);
});

test("#flingPower()", () => {
  const zapPlate = new Item({ name: "Zap Plate" });

  expect(noItem.flingPower()).toEqual(0);
  expect(chopleBerry.flingPower()).toEqual(10);
  expect(zapPlate.flingPower()).toEqual(90);

  chopleBerry.disabled = true;
  expect(chopleBerry.flingPower()).toEqual(0);

  zapPlate.used = true;
  expect(zapPlate.flingPower()).toEqual(0);
});

test("#gemType()", () => {
  const normalGem = new Item({ name: "Normal Gem" });

  expect(normalGem.gemType()).toEqual(Types.NORMAL);
  expect(noItem.gemType()).toEqual(-1);

  normalGem.disabled = true;
  expect(normalGem.gemType()).toEqual(-1);

  normalGem.disabled = false;
  normalGem.used = true;
  expect(normalGem.gemType()).toEqual(-1);
});

test("#isPlate()", () => {
  const zapPlate = new Item({ name: "Zap Plate" });
  expect(zapPlate.isPlate()).toBe(true);
  expect(leftovers.isPlate()).toBe(false);
  zapPlate.disabled = true;
  expect(zapPlate.isPlate()).toBe(true);
  zapPlate.disabled = false;
  zapPlate.used = true;
  expect(zapPlate.isPlate()).toBe(false);
});

test("#isHeavy()", () => {
  const ironBall = new Item({ name: "Iron Ball" });

  expect(noItem.isHeavy()).toBe(false);
  expect(ironBall.isHeavy()).toBe(true);

  ironBall.disabled = true;
  expect(ironBall.isHeavy()).toBe(true);

  ironBall.disabled = false;
  ironBall.used = true;
  expect(ironBall.isHeavy()).toBe(false);
});

test("#berryHeal()", () => {
  const oranBerry = new Item({ name: "Oran Berry" });
  const sitrusBerry = new Item({ name: "Sitrus Berry" });
  const figyBerry = new Item({ name: "Figy Berry" });
  const berry = new Item({ name: "Berry" });
  const goldBerry = new Item({ name: "Gold Berry" });

  expect(oranBerry.berryHeal(27)).toEqual(10);
  expect(sitrusBerry.berryHeal(27)).toEqual(6);
  expect(figyBerry.berryHeal(27)).toEqual(13);
  expect(berry.berryHeal(27)).toEqual(10);
  expect(goldBerry.berryHeal(27)).toEqual(30);

  figyBerry.gen = Gens.ORAS;
  expect(figyBerry.berryHeal(27)).toEqual(3);

  sitrusBerry.gen = Gens.ADV;
  expect(sitrusBerry.berryHeal()).toEqual(30);

  berry.disabled = true;
  expect(berry.berryHeal()).toEqual(0);

  oranBerry.used = true;
  expect(oranBerry.berryHeal()).toEqual(0);
});

test("#berryHealThreshold()", () => {
  const sitrusBerry = new Item({ name: "Sitrus Berry" });
  const figyBerry = new Item({ name: "Figy Berry" });

  expect(sitrusBerry.berryHealThreshold(27)).toEqual(13);
  expect(figyBerry.berryHealThreshold(27)).toEqual(6);

  figyBerry.gen = Gens.ORAS;
  expect(figyBerry.berryHealThreshold(27)).toEqual(13);
});

test("#memoryType()", () => {
  const waterMemory = new Item({ name: "Water Memory" });
  expect(waterMemory.memoryType()).toEqual(Types.WATER);
  expect(noItem.memoryType()).toEqual(Types.NORMAL);
});
