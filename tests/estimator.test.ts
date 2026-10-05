import { test } from "node:test";
import assert from "node:assert/strict";
import { estimateGutters, estimateRoof, estimateSiding, roofRates } from "../lib/estimator";

const home = { size: "1750-2500", stories: 2 } as const;

test("roof estimate grows with pitch, shape and material", () => {
  const base = estimateRoof({ ...home, shape: "gable", pitch: "walkable", material: "architectural" });
  const steep = estimateRoof({ ...home, shape: "gable", pitch: "steep", material: "architectural" });
  const complex = estimateRoof({ ...home, shape: "complex", pitch: "walkable", material: "architectural" });
  const metal = estimateRoof({ ...home, shape: "gable", pitch: "walkable", material: "metal" });
  assert.ok(base.low < base.high);
  assert.ok(steep.low > base.low && steep.quantity > base.quantity);
  assert.ok(complex.low > base.low);
  assert.ok(metal.low > base.high);
  assert.equal(base.low % 100, 0);
});

test("roof estimate never drops below the advertised starting price", () => {
  const small = estimateRoof({ size: "under-1000", stories: 3, shape: "gable", pitch: "walkable", material: "architectural" });
  assert.ok(small.low >= roofRates.minimum);
  assert.ok(small.high > small.low);
});

test("siding upgrades and material add cost", () => {
  const vinyl = estimateSiding({ ...home, material: "vinyl", trim: false, shutters: false });
  const upgraded = estimateSiding({ ...home, material: "vinyl", trim: true, shutters: true });
  const fiber = estimateSiding({ ...home, material: "fiber-cement", trim: false, shutters: false });
  assert.ok(upgraded.low > vinyl.low);
  assert.ok(fiber.low > vinyl.low);
  assert.equal(vinyl.unit, "sq ft of wall");
});

test("gutter estimate reflects eave length, guards and size", () => {
  const gable = estimateGutters({ ...home, shape: "gable", gutter: "5in", guards: false, removeOld: false });
  const hip = estimateGutters({ ...home, shape: "hip", gutter: "5in", guards: false, removeOld: false });
  const loaded = estimateGutters({ ...home, shape: "hip", gutter: "6in", guards: true, removeOld: true });
  assert.ok(hip.quantity > gable.quantity);
  assert.ok(loaded.low > hip.low);
});
