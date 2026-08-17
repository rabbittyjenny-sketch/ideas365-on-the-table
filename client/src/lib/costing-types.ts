/**
 * โมเดลข้อมูลต้นทุนอาหารตามหลักสากล (Recipe Costing Data Model)
 * อ้างอิงโครงสร้าง: Ingredient AP → Sub-recipe / Batch → Batch Yield → Cost per Unit → Finished Product
 * แหล่งอ้างอิงหลัก:
 *  - Penn State Univ., Recipe & Menu Costing (AP/EP, yield %, portion cost)
 *  - King Arthur Baking / Nicolet College, Baker's Percentage (สำหรับ dough)
 */

// หน่วยฐานที่ระบบยอมรับ ต้องเป็นหน่วยที่ "ชั่ง/ตวงจริง" ได้ ไม่ใช้ cup/tbsp/tsp ตรง ๆ
export type BaseUnit = "g" | "kg" | "ml" | "l" | "piece";

export const GRAM_BASED_UNITS: BaseUnit[] = ["g", "kg"];
export const ML_BASED_UNITS: BaseUnit[] = ["ml", "l"];

// แปลงหน่วยภายในตระกูลเดียวกันเป็นหน่วยฐานเล็กสุด (g หรือ ml)
export function toBaseAmount(qty: number, unit: BaseUnit): number {
  switch (unit) {
    case "kg":
      return qty * 1000;
    case "l":
      return qty * 1000;
    case "g":
    case "ml":
    case "piece":
      return qty;
  }
}

export function baseUnitOf(unit: BaseUnit): BaseUnit {
  if (GRAM_BASED_UNITS.includes(unit)) return "g";
  if (ML_BASED_UNITS.includes(unit)) return "ml";
  return "piece";
}

// วัตถุดิบดิบ (Ingredient) — ระดับ AP (As Purchased)
export interface Ingredient {
  id: string;
  name: string;
  category: string;
  purchasePrice: number;
  purchaseQty: number;
  purchaseUnit: BaseUnit;
  yieldPct: number;
  supplier?: string;
  priceDate?: string;
  allergens?: string[];
  updatedAt?: string;
}

export function ingredientApUnitCost(ing: Ingredient): number {
  if (ing.purchaseQty <= 0) return 0;
  return ing.purchasePrice / ing.purchaseQty;
}

export function ingredientEpUnitCost(ing: Ingredient): number {
  const ap = ingredientApUnitCost(ing);
  const yieldFraction = Math.max(ing.yieldPct, 0.0001) / 100;
  return ap / yieldFraction;
}

export type LineSourceType = "ingredient" | "subrecipe";

export interface RecipeLine {
  id: string;
  sourceType: LineSourceType;
  refId: string;
  name: string;
  qty: number;
  unit: BaseUnit;
  bakerPct?: number;
}

export type SubRecipeType = "dough" | "sauce" | "prepared_topping" | "other";
export type RecipeStatus = "draft" | "tested" | "approved";

// สูตรย่อย / Batch
export interface SubRecipe {
  id: string;
  name: string;
  type: SubRecipeType;
  version: string;
  source?: string;
  status: RecipeStatus;
  method?: string;
  lines: RecipeLine[];
  weightBeforeCook?: number;
  batchYieldQty: number;
  batchYieldUnit: BaseUnit;
  ballCount?: number;
  flourIngredientLineId?: string;
  allergens?: string[];
  notes?: string;
  updatedAt?: string;
}

export interface SubRecipeCostResult {
  totalCost: number;
  costPerUnit: number;
  lineCosts: Record<string, number>;
  hasUnresolvedRefs: boolean;
  hasCycle: boolean;
}

export interface FinishedProduct {
  id: string;
  name: string;
  components: RecipeLine[];
  portions: number;
  sellingPrice: number;
  targetFoodCostPct: number;
  packagingCostPerPortion?: number;
  updatedAt?: string;
}

export interface FinishedProductCostResult {
  componentCosts: Record<string, number>;
  recipeCost: number;
  portionCost: number;
  foodCostPct: number;
  grossProfit: number;
  suggestedPrice: number;
  hasUnresolvedRefs: boolean;
}
