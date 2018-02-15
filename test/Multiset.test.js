import bigInt from "big-integer";
import Multiset from "../src/Multiset";

describe("Multiset", () => {
  let emptySet;
  let set1;
  let set2;

  const arr1 = [1, 1, 2, 3, 4, 3, 2];
  const arr2 = [1, 2, 3, -2];

  beforeEach(() => {
    emptySet = new Multiset();
    set1 = new Multiset(arr1);
    set2 = new Multiset(arr2);
  });

  test("#constructor()", () => {
    function checker(set) {
      expect(set.get(-2).eq(1)).toBe(true);
      expect(set.get(1).eq(1)).toBe(true);
      expect(set.get(2).eq(1)).toBe(true);
      expect(set.get(3).eq(2)).toBe(true);
    }

    checker(new Multiset([1, 2, 3, 3, -2]));

    const map = new Map();
    map.set(-2, 1);
    map.set(1, 1);
    map.set(2, 1);
    map.set(3, 2);
    checker(new Multiset(map));

    checker(new Multiset(new Multiset(map)));
  });

  test("#add()", () => {
    const set = new Multiset();
    set.add(1);
    set.add(2);
    set.add(2, 1);
    set.add(3, 1337);
    expect(set.add(4, 3).add(5, 0)).toBe(set);
    expect(set.get(1).eq(1)).toBe(true);
    expect(set.get(2).eq(2)).toBe(true);
    expect(set.get(3).eq(1337)).toBe(true);
    expect(set.get(4).eq(3)).toBe(true);
    expect(set.get(5).eq(0)).toBe(true);
  });

  test("#delete()", () => {
    expect(set1.has(1)).toBe(true);
    expect(set1.delete(1)).toBe(true);
    expect(set1.has(1)).toBe(false);
    expect(set1.delete(1)).toBe(false);
    expect(set1.delete(1.5)).toBe(false);
  });

  test("#has()", () => {
    expect(emptySet.has(1)).toBe(false);
    expect(set1.has(1)).toBe(true);
    expect(set1.has(-2)).toBe(false);
    expect(set2.has(-2)).toBe(true);
  });

  test("#get()", () => {
    expect(set1.get(Math.PI)).toBeUndefined();
    expect(set1.get(1).eq(2)).toBe(true);
    expect(set1.get(2).eq(2)).toBe(true);
    expect(set1.get(3).eq(2)).toBe(true);
    expect(set1.get(4).eq(1)).toBe(true);
  });

  test("#size", () => {
    expect(emptySet.size.eq(0)).toBe(true);
    expect(set1.size.eq(arr1.length)).toBe(true);
  });

  test("#isEmpty()", () => {
    expect(emptySet.isEmpty()).toBe(true);
    expect(set1.isEmpty()).toBe(false);
  });

  test("#max()", () => {
    expect(emptySet.max()).toBeUndefined();
    expect(set1.max()).toEqual(4);
    expect(set1.max((a, b) => a < b)).toEqual(1);
  });

  test("#min()", () => {
    expect(emptySet.min()).toBeUndefined();
    expect(set1.min()).toEqual(1);
    expect(set1.min((a, b) => a < b)).toEqual(4);
  });

  test("#every()", () => {
    expect(emptySet.every()).toBe(true);
    expect(set1.every(a => a > 0)).toBe(true);
    expect(set2.every(a => a > 0)).toBe(false);
    set1.every((value, multiplicity) => {
      expect(typeof value).toEqual("number");
      expect(bigInt.isInstance(multiplicity)).toBe(true);
      return true;
    });
  });

  test("#some()", () => {
    expect(emptySet.some()).toBe(false);
    expect(set1.some(a => a < 0)).toBe(false);
    expect(set2.some(a => a < 0)).toBe(true);
    set1.some((value, multiplicity) => {
      expect(typeof value).toEqual("number");
      expect(bigInt.isInstance(multiplicity)).toBe(true);
      return true;
    });
  });

  test("#count()", () => {
    expect(emptySet.count().eq(0)).toBe(true);
    expect(set1.count()).toEqual(set1.size);
    expect(set1.count(a => a % 2).eq(4)).toBe(true);
    set1.count((value, multiplicity) => {
      expect(typeof value).toEqual("number");
      expect(bigInt.isInstance(multiplicity)).toBe(true);
    });
  });

  test("#clear()", () => {
    set1.clear();
    expect(set1.size.eq(0)).toBe(true);
    expect(set1.has(1)).toBe(false);
  });

  test("#toString()", () => {
    expect(emptySet.toString()).toEqual("");
    expect(set1.toString()).toEqual("1:2, 2:2, 3:2, 4:1");
    expect(set1.toString(undefined, ([v1], [v2]) => v2 - v1)).toEqual(
      "4:1, 3:2, 2:2, 1:2"
    );
    expect(set1.toString(e => e.join("#"))).toEqual("1#2, 2#2, 3#2, 4#1");
  });

  test("#toArray()", () => {
    expect(emptySet.toArray()).toEqual([]);
    expect(set1.toArray()).toEqual([1, 1, 2, 2, 3, 3, 4]);
  });

  test("#permute()", () => {
    expect(set1.permute(emptySet).toString()).toEqual("");
    expect(set1.permute(set2).toString()).toEqual(
      "-1:2, 0:2, 1:2, 2:3, 3:4, 4:6, 5:5, 6:3, 7:1"
    );
    expect(set1.permute(arr2).toString()).toEqual(
      "-1:2, 0:2, 1:2, 2:3, 3:4, 4:6, 5:5, 6:3, 7:1"
    );
    expect(set1.permute([0], (a, b) => a * b).toString()).toEqual("0:7");
  });

  test("#intersect()", () => {
    expect(set1.intersect(set2).toString()).toEqual("1:1, 2:1, 3:1");
    expect(set2.intersect(set1).toString()).toEqual("1:1, 2:1, 3:1");
    expect(set1.intersect(arr2).toString()).toEqual("1:1, 2:1, 3:1");
    expect(set1.intersect(emptySet).toString()).toEqual("");
    expect(emptySet.intersect([]).toString()).toEqual("");
  });

  test("#union()", () => {
    expect(set1.union(set2).toString()).toEqual("-2:1, 1:3, 2:3, 3:3, 4:1");
    expect(set1.union(arr2).toString()).toEqual("-2:1, 1:3, 2:3, 3:3, 4:1");
    expect(set1.union(emptySet).toString()).toEqual("1:2, 2:2, 3:2, 4:1");
    expect(emptySet.union([]).toString()).toEqual("");
  });

  test("#map()", () => {
    expect(emptySet.map().toString()).toEqual("");
    expect(set1.map(v => v + 1).toString()).toEqual("2:2, 3:2, 4:2, 5:1");
    set1.map((value, multiplicity, skip) => {
      expect(typeof value).toEqual("number");
      expect(bigInt.isInstance(multiplicity)).toBe(true);
      expect(typeof skip).toEqual("function");
      return Math.E;
    });

    expect(
      set1
        .map((value, multiplicity, skip) => {
          if (value % 2 === 0) skip();
          return value;
        })
        .toString()
    ).toEqual("1:2, 3:2");
  });

  test("#scale()", () => {
    expect(emptySet.scale(314).toString()).toEqual("");
    expect(set1.scale(2).toString()).toEqual("1:4, 2:4, 3:4, 4:2");
    expect(set1.scale().toString()).toEqual(set1.toString());
  });

  test("#reduce()", () => {
    const reduced = set1.reduce(
      (sum, value, multiplicity) => sum + value * multiplicity,
      0
    );
    expect(reduced).toEqual(16);
    expect(emptySet.reduce()).toBeUndefined();
    set1.reduce((total, value, multiplicity) => {
      expect(total).toBeInstanceOf(Array);
      expect(total).toHaveLength(2);
      expect(typeof total[0]).toEqual("number");
      expect(bigInt.isInstance(multiplicity)).toBe(true);
      expect(typeof value).toEqual("number");
      expect(bigInt.isInstance(multiplicity)).toBe(true);
      return total;
    });
  });

  test("#[Symbol.iterator]()", () => {
    expect(emptySet[Symbol.iterator]().next().done).toBe(true);

    for (const entry of set1) {
      expect(entry).toBeInstanceOf(Array);
      expect(entry).toHaveLength(2);
      expect(typeof entry[0]).toEqual("number");
      expect(bigInt.isInstance(entry[1])).toBe(true);
    }
  });

  test("#entries()", () => {
    expect(emptySet.entries().next().done).toBe(true);

    for (const entry of set1.entries()) {
      expect(entry).toBeInstanceOf(Array);
      expect(entry).toHaveLength(2);
      expect(typeof entry[0]).toEqual("number");
      expect(bigInt.isInstance(entry[1])).toBe(true);
    }
  });

  test("#keys()", () => {
    expect(emptySet.keys().next().done).toBe(true);

    for (const value of set1.keys()) {
      expect(typeof value).toEqual("number");
    }

    expect([...set1.keys()]).toEqual([...set1.values()]);
  });

  test("#values()", () => {
    expect(emptySet.values().next().done).toBe(true);

    for (const value of set1.values()) {
      expect(typeof value).toEqual("number");
    }
  });

  test("#multiplicities()", () => {
    expect(emptySet.multiplicities().next().done).toBe(true);

    for (const multiplicity of set1.multiplicities()) {
      expect(bigInt.isInstance(multiplicity)).toBe(true);
    }
  });

  test(".average()", () => {
    const emptySet = new Multiset();
    expect(Multiset.average(emptySet)).toEqual(NaN);

    const set1 = new Multiset();
    set1.add(2436678, "100000000000000000000000000");
    set1.add(1);
    expect(Multiset.average(set1)).toEqual(2436678);

    const set2 = new Multiset([1, 2, 3, 4, 5, 6, 7, 8, 9, 77, 1]);
    expect(Multiset.average(set2)).toBeCloseTo(11.1818, 4);

    const zeroSet = new Multiset([0, 0, 0]);
    expect(Multiset.average(zeroSet)).toEqual(0);
  });
});
