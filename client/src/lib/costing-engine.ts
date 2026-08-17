/**
 * เครื่องคำนวณต้นทุนสูตรอาหารตามลำดับหลักสากล:
 * Ingredient AP cost → Sub-recipe batch cost → Batch yield → Cost per unit → Finished product portion cost
 *
 * กติกาสำคัญ:
 * 1) ต้นทุนของ sub-recipe ต้องคิดจาก "ต้นทุนต่อหน่วยหลังผลิตจริง" (batch cost ÷ batch yield)
 * 2) วัตถุดิบทุกตัวต้องผ่าน Yield ก่อนเป็น EP cost เสมอ
 * 3) สูตรย่อยสามารถอ้างอิงสูตรย่อยอื่นได้ พร้อมป้องกัน circular reference
 */
import {
  BaseUnit,
  FinishedProduct,
  FinishedProductCostResult,
  Ingredient,
  RecipeLine,
  SubRecipe,
  SubRecipeCostResult,
  baseUnitOf,
  ingredientEpUnitCost,
  toBaseAmount,
} from "./costing-types";

export type IngredientMap = Map<string, Ingredient>;
export type SubRecipeMap = Map<string, SubRecipe>;

function resolveLineUnitCost(
  line: RecipeLine,
  ingredients: IngredientMap,
  subRecipes: SubRecipeMap,
  visiting: Set<string>,
): { unitCost: number; unresolved: boolean; cycle: boolean } {
  if (line.sourceType === "ingredient") {
    const ing = ingredients.get(line.refId);
    if (!ing) return { unitCost: 0, unresolved: true, cycle: false };
    const epCostPerPurchaseUnit = ingredientEpUnitCost(ing);
    const purchaseBaseQty = toBaseAmount(ing.purchaseQty, ing.purchaseUnit);
    const epCostPerBaseUnit =
      baseUnitOf(ing.purchaseUnit) === baseUnitOf(line.unit) && purchaseBaseQty > 0
        ? (epCostPerPurchaseUnit * ing.purchaseQty) / purchaseBaseQty
        : epCostPerPurchaseUnit;
    return { unitCost: epCostPerBaseUnit, unresolved: false, cycle: false };
  }

  // sourceType === "subrecipe"
  if (visiting.has(line.refId)) {
    return { unitCost: 0, unresolved: false, cycle: true };
  }
  const sub = subRecipes.get(line.refId);
  if (!sub) return { unitCost: 0, unresolved: true, cycle: false };

  const nextVisiting = new Set(visiting);
  nextVisiting.add(line.refId);
  const result = computeSubRecipeCostInternal(sub, ingredients, subRecipes, nextVisiting);
  return { unitCost: result.costPerUnit, unresolved: result.hasUnresolvedRefs, cycle: result.hasCycle };
}

function computeSubRecipeCostInternal(
  subRecipe: SubRecipe,
  ingredients: IngredientMap,
  subRecipes: SubRecipeMap,
  visiting: Set<string>,
): SubRecipeCostResult {
  const lineCosts: Record<string, number> = {};
  let totalCost = 0;
  let hasUnresolvedRefs = false;
  let hasCycle = false;

  for (const line of subRecipe.lines) {
    const { unitCost, unresolved, cycle } = resolveLineUnitCost(line, ingredients, subRecipes, visiting);
    if (unresolved) hasUnresolvedRefs = true;
    if (cycle) hasCycle = true;
    const lineBaseQty = toBaseAmount(line.qty, line.unit);
    const lineCost = cycle ? 0 : unitCost * lineBaseQty;
    lineCosts[line.id] = lineCost;
    totalCost += lineCost;
  }

  const yieldBaseQty = toBaseAmount(subRecipe.batchYieldQty, subRecipe.batchYieldUnit);
  const costPerUnit = yieldBaseQty > 0 ? totalCost / yieldBaseQty : 0;

  return { totalCost, costPerUnit, lineCosts, hasUnresolvedRefs, hasCycle };
}

/** ต้นทุนของ sub-recipe หนึ่งรายการ */
export function computeSubRecipeCost(
  subRecipe: SubRecipe,
  ingredients: IngredientMap,
  subRecipes: SubRecipeMap,
): SubRecipeCostResult {
  return computeSubRecipeCostInternal(subRecipe, ingredients, subRecipes, new Set([subRecipe.id]));
}

/** ต้นทุนของสินค้าสำเร็จรูป */
export function computeFinishedProductCost(
  product: FinishedProduct,
  ingredients: IngredientMap,
  subRecipes: SubRecipeMap,
): FinishedProductCostResult {
  const componentCosts: Record<string, number> = {};
  let recipeCost = 0;
  let hasUnresolvedRefs = false;

  for (const line of product.components) {
    const { unitCost, unresolved } = resolveLineUnitCost(line, ingredients, subRecipes, new Set());
    if (unresolved) hasUnresolvedRefs = true;
    const lineBaseQty = toBaseAmount(line.qty, line.unit);
    const cost = unitCost * lineBaseQty;
    componentCosts[line.id] = cost;
    recipeCost += cost;
  }

  const packaging = product.packagingCostPerPortion ?? 0;
  const portions = Math.max(product.portions, 1);
  const portionCost = recipeCost / portions + packaging;
  const foodCostPct = product.sellingPrice > 0 ? (portionCost / product.sellingPrice) * 100 : 0;
  const grossProfit = product.sellingPrice - portionCost;
  const suggestedPrice = product.targetFoodCostPct > 0 ? portionCost / (product.targetFoodCostPct / 100) : 0;

  return { componentCosts, recipeCost, portionCost, foodCostPct, grossProfit, suggestedPrice, hasUnresolvedRefs };
}

/* ------------------------------------------------------------------ */
/* Baker's Percentage                                                    */
/* ------------------------------------------------------------------ */

export interface BakerPercentageRow {
  lineId: string;
  name: string;
  weightGrams: number;
  bakerPct: number;
}

export interface BakerPercentageResult {
  flourWeightGrams: number;
  rows: BakerPercentageRow[];
  hydrationPct: number | null;
  totalDoughWeightGrams: number;
  doughBallWeightGrams: number | null;
}

const WATER_KEYWORDS = ["น้ำ", "water"];

export function computeBakerPercentages(subRecipe: SubRecipe): BakerPercentageResult | null {
  const flourLine = subRecipe.lines.find((l) => l.id === subRecipe.flourIngredientLineId);
  if (!flourLine) return null;

  const flourWeightGrams = toBaseAmount(flourLine.qty, flourLine.unit);
  if (flourWeightGrams <= 0) return null;

  let totalDoughWeightGrams = 0;
  let waterWeightGrams: number | null = null;

  const rows: BakerPercentageRow[] = subRecipe.lines.map((line) => {
    const weightGrams = toBaseAmount(line.qty, line.unit);
    totalDoughWeightGrams += weightGrams;
    if (WATER_KEYWORDS.some((kw) => line.name.toLowerCase().includes(kw))) {
      waterWeightGrams = (waterWeightGrams ?? 0) + weightGrams;
    }
    return {
      lineId: line.id,
      name: line.name,
      weightGrams,
      bakerPct: (weightGrams / flourWeightGrams) * 100,
    };
  });

  const hydrationPct = waterWeightGrams !== null ? (waterWeightGrams / flourWeightGrams) * 100 : null;
  const doughBallWeightGrams =
    subRecipe.ballCount && subRecipe.ballCount > 0 ? totalDoughWeightGrams / subRecipe.ballCount : null;

  return { flourWeightGrams, rows, hydrationPct, totalDoughWeightGrams, doughBallWeightGrams };
}

export function scaleDoughByFlourWeight(
  baseRows: BakerPercentageRow[],
  targetFlourWeightGrams: number,
): { lineId: string; name: string; weightGrams: number }[] {
  return baseRows.map((row) => ({
    lineId: row.lineId,
    name: row.name,
    weightGrams: (row.bakerPct / 100) * targetFlourWeightGrams,
  }));
}

export function formatUnit(unit: BaseUnit): string {
  switch (unit) {
    case "g":
      return "กรัม";
    case "kg":
      return "กก.";
    case "ml":
      return "มล.";
    case "l":
      return "ลิตร";
    case "piece":
      return "ชิ้น/ก้อน";
  }
}
