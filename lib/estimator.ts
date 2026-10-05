// Instant cost ranges for the roofing, siding and gutter calculators.
//
// DRAFT RATES: these are placeholder Maryland installed-price ranges, not WeRoof's confirmed
// pricing. Have an estimator confirm every number below before the calculators go live.
// Rates are installed prices (materials, labor, removal of one existing layer, disposal).
export const ratesAreDraft = true;

export const roofRates = {
  // $ per square foot of roof surface
  materials: {
    architectural: { label: "Architectural asphalt shingles", low: 4.75, high: 7.25 },
    designer: { label: "Designer asphalt shingles", low: 6.5, high: 9.5 },
    metal: { label: "Standing-seam metal", low: 11, high: 17 },
    "synthetic-slate": { label: "Synthetic slate", low: 12, high: 18 },
  },
  minimum: 2999,
} as const;

export const sidingRates = {
  // $ per square foot of wall covered
  materials: {
    vinyl: { label: "Vinyl lap siding", low: 6, high: 9 },
    "insulated-vinyl": { label: "Insulated / premium vinyl", low: 8, high: 12 },
    "fiber-cement": { label: "Fiber cement", low: 11, high: 16 },
  },
  upgrades: {
    trim: { label: "New soffit, fascia & trim wrap", share: 0.12 },
    shutters: { label: "New shutters & mounts", low: 600, high: 1400 },
  },
  minimum: 4500,
} as const;

export const gutterRates = {
  // $ per linear foot of gutter, downspouts included
  sizes: {
    "5in": { label: '5" seamless aluminum (K-style)', low: 10, high: 15 },
    "6in": { label: '6" seamless aluminum (K-style)', low: 13, high: 19 },
  },
  guards: { label: "Micro-mesh gutter guards", low: 8, high: 13 },
  removal: { low: 1, high: 2 },
  minimum: 1200,
} as const;

export type HomeSize = "under-1000" | "1000-1750" | "1750-2500" | "2500-3500" | "over-3500";
export const homeSizes: Record<HomeSize, { label: string; sqft: number }> = {
  "under-1000": { label: "Under 1,000 sq ft", sqft: 900 },
  "1000-1750": { label: "1,000–1,750 sq ft", sqft: 1400 },
  "1750-2500": { label: "1,750–2,500 sq ft", sqft: 2100 },
  "2500-3500": { label: "2,500–3,500 sq ft", sqft: 3000 },
  "over-3500": { label: "3,500+ sq ft", sqft: 4000 },
};
export type Stories = 1 | 2 | 3;
export type RoofShape = "gable" | "hip" | "complex";
export const roofShapes: Record<RoofShape, { label: string; note: string; area: number; labor: number; eaveShare: number }> = {
  gable: { label: "Gable", note: "Two main slopes meeting at one ridge", area: 1, labor: 1, eaveShare: 0.6 },
  hip: { label: "Hip", note: "Slopes on all four sides", area: 1.04, labor: 1.06, eaveShare: 1 },
  complex: { label: "Complex", note: "Dormers, valleys or several roof sections", area: 1.1, labor: 1.14, eaveShare: 0.85 },
};
export type Pitch = "walkable" | "moderate" | "steep";
export const pitches: Record<Pitch, { label: string; note: string; area: number; labor: number }> = {
  walkable: { label: "Gentle slope", note: "Looks low from the ground", area: 1.12, labor: 1 },
  moderate: { label: "Moderate", note: "A noticeable, medium slope", area: 1.25, labor: 1.08 },
  steep: { label: "Steep", note: "A tall, sharply angled roof", area: 1.42, labor: 1.2 },
};
const storyLabor: Record<Stories, number> = { 1: 1, 2: 1.05, 3: 1.12 };

export type Estimate = { low: number; high: number; quantity: number; unit: string };

const roundTo = (value: number, step: number) => Math.round(value / step) * step;
const range = (low: number, high: number, minimum: number, quantity: number, unit: string): Estimate => ({
  low: roundTo(Math.max(low, minimum), 100),
  high: roundTo(Math.max(high, minimum * 1.25), 100),
  quantity: Math.round(quantity),
  unit,
});

/** Ground footprint of the home, with a typical 1.3:1 length-to-width ratio. */
function footprint(size: HomeSize, stories: Stories) {
  const area = homeSizes[size].sqft / stories;
  const width = Math.sqrt(area / 1.3);
  return { area, perimeter: 2 * (width + width * 1.3) };
}

export function estimateRoof(input: { size: HomeSize; stories: Stories; shape: RoofShape; pitch: Pitch; material: keyof typeof roofRates.materials; livingSqft?: number }): Estimate {
  const area = input.livingSqft ? input.livingSqft / input.stories : footprint(input.size, input.stories).area;
  const shape = roofShapes[input.shape];
  const pitch = pitches[input.pitch];
  // 1.1 covers roof overhangs past the walls.
  const roofArea = area * 1.1 * pitch.area * shape.area;
  const rate = roofRates.materials[input.material];
  const labor = shape.labor * pitch.labor * storyLabor[input.stories];
  return range(roofArea * rate.low * labor, roofArea * rate.high * labor, roofRates.minimum, roofArea, "sq ft of roof");
}

export function estimateSiding(input: { size: HomeSize; stories: Stories; material: keyof typeof sidingRates.materials; trim: boolean; shutters: boolean }): Estimate {
  const { perimeter } = footprint(input.size, input.stories);
  // 9 ft per story, plus gable ends, minus about 15% for windows and doors.
  const wallArea = perimeter * 9 * input.stories * 1.08 * 0.85;
  const rate = sidingRates.materials[input.material];
  const access = storyLabor[input.stories] + (input.stories - 1) * 0.03;
  let low = wallArea * rate.low * access;
  let high = wallArea * rate.high * access;
  if (input.trim) { low *= 1 + sidingRates.upgrades.trim.share; high *= 1 + sidingRates.upgrades.trim.share; }
  if (input.shutters) { low += sidingRates.upgrades.shutters.low; high += sidingRates.upgrades.shutters.high; }
  return range(low, high, sidingRates.minimum, wallArea, "sq ft of wall");
}

export function estimateGutters(input: { size: HomeSize; stories: Stories; shape: RoofShape; gutter: keyof typeof gutterRates.sizes; guards: boolean; removeOld: boolean }): Estimate {
  const { perimeter } = footprint(input.size, input.stories);
  // Gutters run along the eaves; a hip roof has eaves on every side.
  const feet = Math.max(60, perimeter * 1.08 * roofShapes[input.shape].eaveShare);
  const size = gutterRates.sizes[input.gutter];
  const height = input.stories === 1 ? 1 : input.stories === 2 ? 1.1 : 1.25;
  let low = feet * size.low * height;
  let high = feet * size.high * height;
  if (input.guards) { low += feet * gutterRates.guards.low; high += feet * gutterRates.guards.high; }
  if (input.removeOld) { low += feet * gutterRates.removal.low; high += feet * gutterRates.removal.high; }
  return range(low, high, gutterRates.minimum, feet, "linear ft of gutter");
}

export const formatUsd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
