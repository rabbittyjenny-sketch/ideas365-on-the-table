import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import {
  FinishedProduct,
  FinishedProductCostResult,
  Ingredient,
  RecipeLine,
  SubRecipe,
} from "@/lib/costing-types";
import {
  computeFinishedProductCost,
  computeSubRecipeCost,
} from "@/lib/costing-engine";
import {
  fetchAllData,
  isSheetsSyncConfigured,
  saveRecord,
  deleteRecord as deleteRemoteRecord,
} from "@/lib/sheets-sync";

const LOCAL_STORAGE_KEY = "food-costing-calculator:v3";

const seedIngredients: Ingredient[] = [
  { id: "ing-flour", name: "แป้งสาลี All-purpose", category: "แป้ง", purchasePrice: 45, purchaseQty: 1000, purchaseUnit: "g", yieldPct: 100, supplier: "ร้านวัตถุดิบเบเกอรี่", priceDate: "2026-08-01" },
  { id: "ing-tomato", name: "มะเขือเทศบด (กระป๋อง)", category: "ผัก/ซอส", purchasePrice: 65, purchaseQty: 800, purchaseUnit: "g", yieldPct: 100, supplier: "ร้านค้าส่ง", priceDate: "2026-08-01" },
  { id: "ing-mozzarella", name: "มอสซาเรลล่าชีส", category: "นม/ชีส", purchasePrice: 320, purchaseQty: 1000, purchaseUnit: "g", yieldPct: 100, supplier: "ร้านนำเข้าชีส", priceDate: "2026-08-01" },
  { id: "ing-oliveoil", name: "น้ำมันมะกอก", category: "น้ำมัน/เครื่องปรุง", purchasePrice: 260, purchaseQty: 500, purchaseUnit: "ml", yieldPct: 100, supplier: "ร้านวัตถุดิบทั่วไป", priceDate: "2026-08-01" },
  { id: "ing-water", name: "น้ำ", category: "น้ำ/ของเหลว", purchasePrice: 0, purchaseQty: 1000, purchaseUnit: "ml", yieldPct: 100 },
  { id: "ing-yeast", name: "ยีสต์แห้งสำเร็จรูป", category: "แป้ง", purchasePrice: 90, purchaseQty: 100, purchaseUnit: "g", yieldPct: 100, supplier: "ร้านวัตถุดิบเบเกอรี่", priceDate: "2026-08-01" },
  { id: "ing-salt", name: "เกลือ", category: "เครื่องปรุง", purchasePrice: 15, purchaseQty: 1000, purchaseUnit: "g", yieldPct: 100 },
  { id: "ing-garlic", name: "กระเทียมสับ", category: "ผัก", purchasePrice: 60, purchaseQty: 1000, purchaseUnit: "g", yieldPct: 90 },
];

const seedSauceBatch: SubRecipe = {
  id: "sub-tomato-sauce",
  name: "Classic Tomato Pizza Sauce",
  type: "sauce",
  version: "v1",
  source: "ทดสอบในครัว",
  status: "tested",
  method: "เคี่ยวไฟอ่อน 15–20 นาทีจนข้น",
  lines: [
    { id: nanoid(6), sourceType: "ingredient", refId: "ing-tomato", name: "มะเขือเทศบด (กระป๋อง)", qty: 400, unit: "g" },
    { id: nanoid(6), sourceType: "ingredient", refId: "ing-garlic", name: "กระเทียมสับ", qty: 5, unit: "g" },
    { id: nanoid(6), sourceType: "ingredient", refId: "ing-oliveoil", name: "น้ำมันมะกอก", qty: 15, unit: "ml" },
    { id: nanoid(6), sourceType: "ingredient", refId: "ing-salt", name: "เกลือ", qty: 3, unit: "g" },
  ],
  weightBeforeCook: 423,
  batchYieldQty: 360,
  batchYieldUnit: "g",
  notes: "น้ำหนักหลังเคี่ยวลดลงจากการระเหย ต้องชั่งจริงทุกครั้งที่เปลี่ยน batch",
};

const seedDoughBatch: SubRecipe = {
  id: "sub-classic-dough",
  name: "Classic Pizza Dough",
  type: "dough",
  version: "v1",
  source: "ทดสอบในครัว",
  status: "tested",
  method: "นวด 8–10 นาที พักตัวแรก 1–2 ชม. แบ่งก้อน พักตัวที่สอง 4–6 ชม.",
  lines: [
    { id: "line-flour", sourceType: "ingredient", refId: "ing-flour", name: "แป้งสาลี All-purpose", qty: 500, unit: "g" },
    { id: nanoid(6), sourceType: "ingredient", refId: "ing-water", name: "น้ำ", qty: 300, unit: "ml" },
    { id: nanoid(6), sourceType: "ingredient", refId: "ing-yeast", name: "ยีสต์แห้งสำเร็จรูป", qty: 5, unit: "g" },
    { id: nanoid(6), sourceType: "ingredient", refId: "ing-salt", name: "เกลือ", qty: 10, unit: "g" },
    { id: nanoid(6), sourceType: "ingredient", refId: "ing-oliveoil", name: "น้ำมันมะกอก", qty: 15, unit: "ml" },
  ],
  weightBeforeCook: 830,
  batchYieldQty: 800,
  batchYieldUnit: "g",
  ballCount: 4,
  flourIngredientLineId: "line-flour",
  notes: "ทำได้ 4 ก้อน ก้อนละประมาณ 200 กรัม — ต้องชั่งยืนยันน้ำหนักก้อนจริงก่อนอนุมัติสูตร",
};

export function defaultProduct(): FinishedProduct {
  return {
    id: "product-classic-pepperoni",
    name: "Classic Pepperoni Pizza",
    components: [
      { id: nanoid(6), sourceType: "subrecipe", refId: "sub-classic-dough", name: "Classic Pizza Dough", qty: 250, unit: "g" },
      { id: nanoid(6), sourceType: "subrecipe", refId: "sub-tomato-sauce", name: "Classic Tomato Pizza Sauce", qty: 120, unit: "g" },
      { id: nanoid(6), sourceType: "ingredient", refId: "ing-mozzarella", name: "มอสซาเรลล่าชีส", qty: 150, unit: "g" },
    ],
    portions: 1,
    sellingPrice: 289,
    targetFoodCostPct: 30,
  };
}

function blankProduct(): FinishedProduct {
  return {
    id: `product-${nanoid(8)}`,
    name: "เมนูใหม่",
    components: [],
    portions: 1,
    sellingPrice: 0,
    targetFoodCostPct: 30,
  };
}

interface PersistedState {
  ingredients: Ingredient[];
  subRecipes: SubRecipe[];
  products: FinishedProduct[];
  selectedProductId: string | null;
}

function loadFromLocalStorage(): PersistedState | null {
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (!Array.isArray(parsed.products)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** ย้ายข้อมูลจาก schema เดิม (v2 — เก็บ product เดี่ยว) มาเป็น v3 (products[]) ถ้ามี */
function loadLegacyMigration(): PersistedState | null {
  try {
    const raw = window.localStorage.getItem("food-costing-calculator:v2");
    if (!raw) return null;
    const legacy = JSON.parse(raw) as { ingredients: Ingredient[]; subRecipes: SubRecipe[]; product: FinishedProduct };
    if (!legacy.product) return null;
    return {
      ingredients: legacy.ingredients ?? seedIngredients,
      subRecipes: legacy.subRecipes ?? [seedDoughBatch, seedSauceBatch],
      products: [legacy.product],
      selectedProductId: legacy.product.id,
    };
  } catch {
    return null;
  }
}

function saveToLocalStorage(state: PersistedState) {
  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage เต็มหรือถูกปิด
  }
}

export function useCostingStore() {
  const cached = useRef(loadFromLocalStorage() ?? loadLegacyMigration()).current;
  const [ingredients, setIngredients] = useState<Ingredient[]>(cached?.ingredients ?? seedIngredients);
  const [subRecipes, setSubRecipes] = useState<SubRecipe[]>(cached?.subRecipes ?? [seedDoughBatch, seedSauceBatch]);
  const [products, setProducts] = useState<FinishedProduct[]>(cached?.products ?? [defaultProduct()]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    cached?.selectedProductId ?? cached?.products?.[0]?.id ?? defaultProduct().id,
  );
  const [syncState, setSyncState] = useState<"idle" | "loading" | "saving" | "error">("idle");
  const sheetsConfigured = isSheetsSyncConfigured();

  // แคชลง localStorage ทุกครั้งที่ข้อมูลเปลี่ยน
  useEffect(() => {
    saveToLocalStorage({ ingredients, subRecipes, products, selectedProductId });
  }, [ingredients, subRecipes, products, selectedProductId]);

  const ingredientMap = useMemo(() => new Map(ingredients.map((i) => [i.id, i])), [ingredients]);
  const subRecipeMap = useMemo(() => new Map(subRecipes.map((s) => [s.id, s])), [subRecipes]);

  const subRecipeCosts = useMemo(() => {
    const result = new Map<string, ReturnType<typeof computeSubRecipeCost>>();
    for (const sub of subRecipes) {
      result.set(sub.id, computeSubRecipeCost(sub, ingredientMap, subRecipeMap));
    }
    return result;
  }, [subRecipes, ingredientMap, subRecipeMap]);

  // ต้นทุนของ "ทุก" เมนู — ใช้แสดงในหน้า Menu Board / Dashboard โดยไม่ต้องเปิดดูทีละเมนู
  const productCosts = useMemo(() => {
    const result = new Map<string, FinishedProductCostResult>();
    for (const p of products) {
      result.set(p.id, computeFinishedProductCost(p, ingredientMap, subRecipeMap));
    }
    return result;
  }, [products, ingredientMap, subRecipeMap]);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) ?? null,
    [products, selectedProductId],
  );

  const selectedProductCost: FinishedProductCostResult = useMemo(() => {
    if (selectedProduct) return productCosts.get(selectedProduct.id) as FinishedProductCostResult;
    return { componentCosts: {}, recipeCost: 0, portionCost: 0, foodCostPct: 0, grossProfit: 0, suggestedPrice: 0, hasUnresolvedRefs: false };
  }, [selectedProduct, productCosts]);

  // ----- Ingredient CRUD -----
  const upsertIngredient = useCallback((ing: Ingredient) => {
    setIngredients((current) => {
      const exists = current.some((i) => i.id === ing.id);
      return exists ? current.map((i) => (i.id === ing.id ? ing : i)) : [...current, ing];
    });
  }, []);

  const removeIngredient = useCallback((id: string) => {
    setIngredients((current) => current.filter((i) => i.id !== id));
  }, []);

  // ----- SubRecipe CRUD -----
  const upsertSubRecipe = useCallback((sub: SubRecipe) => {
    setSubRecipes((current) => {
      const exists = current.some((s) => s.id === sub.id);
      return exists ? current.map((s) => (s.id === sub.id ? sub : s)) : [...current, sub];
    });
  }, []);

  const removeSubRecipe = useCallback((id: string) => {
    setSubRecipes((current) => current.filter((s) => s.id !== id));
  }, []);

  // ----- Finished product (menu item) CRUD -----
  const selectProduct = useCallback((id: string | null) => {
    setSelectedProductId(id);
  }, []);

  const createProduct = useCallback(() => {
    const fresh = blankProduct();
    setProducts((current) => [...current, fresh]);
    setSelectedProductId(fresh.id);
    return fresh.id;
  }, []);

  const duplicateProduct = useCallback((id: string) => {
    setProducts((current) => {
      const source = current.find((p) => p.id === id);
      if (!source) return current;
      const copy: FinishedProduct = {
        ...source,
        id: `product-${nanoid(8)}`,
        name: `${source.name} (สำเนา)`,
        components: source.components.map((c) => ({ ...c, id: nanoid(6) })),
      };
      setSelectedProductId(copy.id);
      return [...current, copy];
    });
  }, []);

  const removeProduct = useCallback((id: string) => {
    setProducts((current) => current.filter((p) => p.id !== id));
    setSelectedProductId((current) => (current === id ? null : current));
  }, []);

  const updateProduct = useCallback((id: string, patch: Partial<FinishedProduct>) => {
    setProducts((current) => current.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  const updateComponent = useCallback((productId: string, lineId: string, patch: Partial<RecipeLine>) => {
    setProducts((current) =>
      current.map((p) =>
        p.id === productId
          ? { ...p, components: p.components.map((line) => (line.id === lineId ? { ...line, ...patch } : line)) }
          : p,
      ),
    );
  }, []);

  const addComponent = useCallback((productId: string, line: Omit<RecipeLine, "id">) => {
    setProducts((current) =>
      current.map((p) => (p.id === productId ? { ...p, components: [...p.components, { ...line, id: nanoid(6) }] } : p)),
    );
  }, []);

  const removeComponent = useCallback((productId: string, lineId: string) => {
    setProducts((current) =>
      current.map((p) => (p.id === productId ? { ...p, components: p.components.filter((l) => l.id !== lineId) } : p)),
    );
  }, []);

  // ----- Google Sheets sync -----
  const loadFromSheets = useCallback(async () => {
    if (!sheetsConfigured) {
      toast.error("ยังไม่ได้ตั้งค่า URL ของ Google Apps Script (ดู client/src/lib/sheets-sync.ts)");
      return;
    }
    setSyncState("loading");
    try {
      const data = await fetchAllData();
      if (data.ingredients.length) setIngredients(data.ingredients as Ingredient[]);
      if (data.subRecipes.length) setSubRecipes(data.subRecipes as SubRecipe[]);
      if (data.finishedProducts.length) {
        const loaded = data.finishedProducts as FinishedProduct[];
        setProducts(loaded);
        setSelectedProductId((current) => (current && loaded.some((p) => p.id === current) ? current : loaded[0].id));
      }
      setSyncState("idle");
      toast.success("โหลดข้อมูลจาก Google Sheets สำเร็จ");
    } catch (err) {
      setSyncState("error");
      toast.error(err instanceof Error ? err.message : "โหลดข้อมูลไม่สำเร็จ");
    }
  }, [sheetsConfigured]);

  const saveIngredientToSheets = useCallback(
    async (ing: Ingredient) => {
      if (!sheetsConfigured) return;
      try {
        await saveRecord("ingredients", ing as unknown as Record<string, unknown>);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "บันทึกวัตถุดิบไม่สำเร็จ");
      }
    },
    [sheetsConfigured],
  );

  const saveSubRecipeToSheets = useCallback(
    async (sub: SubRecipe) => {
      if (!sheetsConfigured) return;
      const cost = computeSubRecipeCost(sub, ingredientMap, subRecipeMap);
      try {
        await saveRecord("subRecipes", {
          ...sub,
          totalCost: cost.totalCost,
          costPerUnit: cost.costPerUnit,
        } as unknown as Record<string, unknown>);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "บันทึกสูตรย่อยไม่สำเร็จ");
      }
    },
    [sheetsConfigured, ingredientMap, subRecipeMap],
  );

  const saveProductToSheets = useCallback(
    async (id: string) => {
      const product = products.find((p) => p.id === id);
      if (!product) return;
      if (!sheetsConfigured) {
        toast.error("ยังไม่ได้ตั้งค่า URL ของ Google Apps Script (ดู client/src/lib/sheets-sync.ts)");
        return;
      }
      setSyncState("saving");
      try {
        const cost = computeFinishedProductCost(product, ingredientMap, subRecipeMap);
        await saveRecord("finishedProducts", {
          ...product,
          recipeCost: cost.recipeCost,
          portionCost: cost.portionCost,
          foodCostPct: cost.foodCostPct,
          grossProfit: cost.grossProfit,
          suggestedPrice: cost.suggestedPrice,
        } as unknown as Record<string, unknown>);
        setSyncState("idle");
        toast.success(`บันทึก "${product.name}" ลง Google Sheets แล้ว`);
      } catch (err) {
        setSyncState("error");
        toast.error(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
      }
    },
    [products, sheetsConfigured, ingredientMap, subRecipeMap],
  );

  const deleteFromSheets = useCallback(
    async (type: "ingredients" | "subRecipes" | "finishedProducts", id: string) => {
      if (!sheetsConfigured) return;
      try {
        await deleteRemoteRecord(type, id);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "ลบข้อมูลบน Google Sheets ไม่สำเร็จ");
      }
    },
    [sheetsConfigured],
  );

  return {
    ingredients,
    subRecipes,
    products,
    ingredientMap,
    subRecipeMap,
    subRecipeCosts,
    productCosts,
    selectedProductId,
    selectedProduct,
    selectedProductCost,
    sheetsConfigured,
    syncState,
    upsertIngredient,
    removeIngredient,
    upsertSubRecipe,
    removeSubRecipe,
    selectProduct,
    createProduct,
    duplicateProduct,
    removeProduct,
    updateProduct,
    updateComponent,
    addComponent,
    removeComponent,
    loadFromSheets,
    saveIngredientToSheets,
    saveSubRecipeToSheets,
    saveProductToSheets,
    deleteFromSheets,
  };
}
