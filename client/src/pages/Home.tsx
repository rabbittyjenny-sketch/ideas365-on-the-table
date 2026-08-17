/* Design philosophy: International kitchen ledger — precise costing controls, editorial typography, warm paper surfaces, ink-blue structure, copper action states, and no dead-end screens. */
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowLeft,
  BadgeCheck,
  Beaker,
  BookOpen,
  Cloud,
  CloudOff,
  FileJson,
  Globe2,
  Layers3,
  Library,
  Plus,
  RefreshCw,
  Save,
  Scale,
  Sparkles,
  Target,
  Utensils,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import IngredientLibrary from "@/components/IngredientLibrary";
import RecipeLineRow from "@/components/RecipeLineRow";
import SubRecipeWorkspace from "@/components/SubRecipeWorkspace";
import MenuBoard from "@/components/MenuBoard";
import PriceScenario from "@/components/PriceScenario";
import { useCostingStore } from "@/hooks/useCostingStore";
import { BaseUnit, FinishedProduct, FinishedProductCostResult, LineSourceType, RecipeLine } from "@/lib/costing-types";
import { formatUnit } from "@/lib/costing-engine";

type Workspace = "dashboard" | "ingredients" | "subrecipes" | "finished";
type FinishedView = "board" | "detail";
type LocaleMode = "th" | "en";
type CostingStore = ReturnType<typeof useCostingStore>;

const workspaceItems: Array<{ id: Workspace; icon: typeof Sparkles; th: string; en: string }> = [
  { id: "dashboard", icon: Sparkles, th: "ภาพรวม", en: "Overview" },
  { id: "ingredients", icon: Library, th: "คลังวัตถุดิบ", en: "Ingredients" },
  { id: "subrecipes", icon: Layers3, th: "สูตรย่อย / Batch", en: "Sub-recipes" },
  { id: "finished", icon: Utensils, th: "เมนู / สินค้าสำเร็จรูป", en: "Menu items" },
];

const money = (value: number) =>
  `฿${value.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const compactMoney = (value: number) =>
  `฿${value.toLocaleString("th-TH", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

function t(locale: LocaleMode, th: string, en: string) {
  return locale === "th" ? th : en;
}

function SectionKicker({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#bd6c40]">
      <span className="h-px w-6 bg-[#bd6c40]" />
      {children}
    </div>
  );
}

function MetricCard({
  label,
  value,
  note,
  tone = "ink",
}: {
  label: string;
  value: string;
  note: string;
  tone?: "ink" | "copper" | "sage" | "gold";
}) {
  const color =
    tone === "copper" ? "text-[#bd6c40]" : tone === "sage" ? "text-[#517a61]" : tone === "gold" ? "text-[#a07828]" : "text-[#173242]";

  return (
    <div className="rounded-2xl border border-[#ddd6c7] bg-[#fffdf7] p-4 shadow-[0_8px_24px_rgba(35,47,42,0.045)]">
      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8a928d]">{label}</div>
      <div className={`mt-3 font-display text-2xl font-semibold ${color}`}>{value}</div>
      <div className="mt-1 text-xs leading-5 text-[#74807a]">{note}</div>
    </div>
  );
}

function SyncBadge({ configured, state }: { configured: boolean; state: string }) {
  const Icon = configured ? Cloud : CloudOff;
  return (
    <Badge
      variant="outline"
      className={`gap-1.5 rounded-full px-3 py-1 text-[11px] ${
        configured ? "border-[#cfd9d2] bg-[#edf4ee] text-[#517a61]" : "border-[#e5d7bf] bg-[#fff8ea] text-[#9a6b26]"
      }`}
    >
      <Icon size={13} />
      {configured ? `Sheets ${state}` : "Local mode"}
    </Badge>
  );
}

function exportJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function FinishedProductDetail({
  locale,
  store,
  product,
  cost,
  onBack,
}: {
  locale: LocaleMode;
  store: CostingStore;
  product: FinishedProduct;
  cost: FinishedProductCostResult;
  onBack: () => void;
}) {
  const {
    ingredients,
    subRecipes,
    subRecipeCosts,
    updateProduct,
    updateComponent,
    addComponent,
    removeComponent,
    saveProductToSheets,
    sheetsConfigured,
  } = store;

  const addLine = (sourceType: LineSourceType) => {
    if (sourceType === "ingredient") {
      const first = ingredients[0];
      addComponent(product.id, {
        sourceType,
        refId: first?.id ?? "",
        name: first?.name ?? t(locale, "วัตถุดิบใหม่", "New ingredient"),
        qty: 0,
        unit: "g",
      });
      return;
    }

    const first = subRecipes[0];
    addComponent(product.id, {
      sourceType,
      refId: first?.id ?? "",
      name: first?.name ?? t(locale, "สูตรย่อยใหม่", "New sub-recipe"),
      qty: 0,
      unit: first?.batchYieldUnit ?? "g",
    });
  };

  const unresolvedCount = product.components.filter((line) =>
    line.sourceType === "ingredient" ? !ingredients.some((i) => i.id === line.refId) : !subRecipes.some((s) => s.id === line.refId),
  ).length;

  return (
    <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#e3ded4] bg-[#fffdf7] text-[#74807a] hover:bg-[#f5efe4]"
            aria-label={t(locale, "กลับไปหน้าเมนูทั้งหมด", "Back to menu board")}
          >
            <ArrowLeft size={16} />
          </button>
          <div className="text-xs text-[#8a928d]">
            {t(locale, "เมนูทั้งหมด", "All menu items")} <span className="mx-1">/</span>
            <span className="font-semibold text-[#173242]">{product.name}</span>
          </div>
        </div>

        <div className="rounded-[24px] border border-[#ddd6c7] bg-[#fffdf7] p-6 shadow-[0_12px_34px_rgba(35,47,42,0.055)]">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <SectionKicker>{t(locale, "finished product", "finished product")}</SectionKicker>
              <Input
                value={product.name}
                onChange={(event) => updateProduct(product.id, { name: event.target.value })}
                className="h-12 max-w-[440px] border-transparent bg-transparent px-0 font-display text-2xl font-semibold text-[#173242] shadow-none focus:border-[#d4c7ba] focus:bg-white focus:px-3"
              />
            </div>
            <div className="flex items-center gap-2">
              {unresolvedCount > 0 && (
                <Badge className="gap-1.5 bg-[#fff0e8] text-[#b45331] hover:bg-[#fff0e8]">
                  <AlertTriangle size={13} />
                  {unresolvedCount} unresolved
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => saveProductToSheets(product.id)}
                className="border-[#d7c9b5] bg-white text-[#173242] hover:bg-[#f5efe4]"
              >
                <Save size={14} />
                {sheetsConfigured ? t(locale, "บันทึกลง Sheets", "Save to Sheets") : t(locale, "ทดสอบการบันทึก", "Check sync")}
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <label>
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#8a928d]">
                {t(locale, "จำนวน portions", "Portions")}
              </span>
              <Input
                type="number"
                min="1"
                value={product.portions}
                onChange={(event) => updateProduct(product.id, { portions: Math.max(1, Number(event.target.value)) })}
                className="h-10 border-[#e3ded4] bg-white text-right"
              />
            </label>
            <label>
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#8a928d]">
                {t(locale, "ราคาขาย", "Selling price")}
              </span>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-[#8a928d]">฿</span>
                <Input
                  type="number"
                  value={product.sellingPrice}
                  onChange={(event) => updateProduct(product.id, { sellingPrice: Number(event.target.value) })}
                  className="h-10 border-[#e3ded4] bg-white pl-8 text-right"
                />
              </div>
            </label>
            <label>
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#8a928d]">
                {t(locale, "เป้าหมาย food cost", "Target food cost")}
              </span>
              <div className="relative">
                <Input
                  type="number"
                  value={product.targetFoodCostPct}
                  onChange={(event) => updateProduct(product.id, { targetFoodCostPct: Number(event.target.value) })}
                  className="h-10 border-[#e3ded4] bg-white pr-8 text-right"
                />
                <span className="absolute right-3 top-2.5 text-sm text-[#8a928d]">%</span>
              </div>
            </label>
          </div>
        </div>

        <div className="rounded-[24px] border border-[#ddd6c7] bg-[#fffdf7] shadow-[0_12px_34px_rgba(35,47,42,0.055)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e6e0d3] px-5 py-5 sm:px-7">
            <div>
              <h3 className="font-display text-lg font-semibold text-[#173242]">{t(locale, "ส่วนประกอบสินค้า", "Product components")}</h3>
              <p className="mt-1 text-xs text-[#74807a]">
                {t(locale, "อ้างอิงได้ทั้งวัตถุดิบ AP/EP และสูตรย่อยที่มี batch yield แล้ว", "Use AP/EP ingredients or tested sub-recipes with real batch yields.")}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => addLine("ingredient")} className="border-[#d7c9b5] bg-white text-[#173242]">
                <Plus size={14} />
                {t(locale, "วัตถุดิบ", "Ingredient")}
              </Button>
              <Button size="sm" onClick={() => addLine("subrecipe")} className="bg-[#173242] text-white hover:bg-[#25485b]">
                <Plus size={14} />
                {t(locale, "สูตรย่อย", "Sub-recipe")}
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto px-5 py-4 sm:px-7">
            <div className="min-w-[650px]">
              <div className="grid grid-cols-[86px_minmax(160px,1.5fr)_75px_75px_95px_32px] gap-2 border-b border-[#e6e0d3] pb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[#929996]">
                <div>{t(locale, "แหล่ง", "source")}</div>
                <div>{t(locale, "รายการ", "item")}</div>
                <div>{t(locale, "ปริมาณ", "qty")}</div>
                <div>{t(locale, "หน่วย", "unit")}</div>
                <div className="text-right">{t(locale, "ต้นทุน", "cost")}</div>
                <div />
              </div>
              {product.components.length === 0 ? (
                <div className="py-10 text-center text-xs text-[#a5aaa6]">
                  {t(locale, 'ยังไม่มีส่วนประกอบ — กด "วัตถุดิบ" หรือ "สูตรย่อย" ด้านบนเพื่อเริ่มต้น', 'No components yet — click "Ingredient" or "Sub-recipe" above to start')}
                </div>
              ) : (
                <div className="divide-y divide-[#eee9de]">
                  {product.components.map((line: RecipeLine) => (
                    <RecipeLineRow
                      key={line.id}
                      line={line}
                      ingredients={ingredients}
                      subRecipes={subRecipes}
                      subRecipeCosts={subRecipeCosts}
                      lineCost={cost.componentCosts[line.id] ?? 0}
                      unresolved={
                        line.sourceType === "ingredient"
                          ? !ingredients.some((i) => i.id === line.refId)
                          : !subRecipes.some((s) => s.id === line.refId)
                      }
                      onChange={(patch) => updateComponent(product.id, line.id, patch)}
                      onRemove={() => removeComponent(product.id, line.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <aside className="space-y-5 xl:sticky xl:top-[92px]">
        <div className="overflow-hidden rounded-[24px] border-l-4 border-[#bd6c40] bg-[#173242] text-white shadow-[0_18px_50px_rgba(23,50,66,0.2)]">
          <div className="border-b border-white/10 px-6 py-5">
            <SectionKicker>{t(locale, "live result", "live result")}</SectionKicker>
            <h3 className="font-display text-2xl font-semibold">{t(locale, "ต้นทุนต่อ Portion", "Cost per portion")}</h3>
            <p className="mt-1 text-xs text-[#aebec0]">AP → EP → Batch → Portion</p>
          </div>
          <div className="space-y-4 px-6 py-6">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#b9c5c8]">{t(locale, "ต้นทุนสูตรรวม", "Recipe cost")}</span>
              <span className="font-display text-sm font-semibold">{money(cost.recipeCost)}</span>
            </div>
            <div className="rounded-2xl bg-[#27485a] p-4">
              <div className="text-[10px] uppercase tracking-[0.14em] text-[#9fb2b5]">{t(locale, "portion cost", "portion cost")}</div>
              <div className="mt-1 font-display text-4xl font-semibold text-[#e9bc83]">{money(cost.portionCost)}</div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#b9c5c8]">Food cost %</span>
              <span className={`font-display text-lg font-semibold ${cost.foodCostPct <= product.targetFoodCostPct ? "text-[#a8c7b0]" : "text-[#f0b18f]"}`}>
                {cost.foodCostPct.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-[#bd6c40] transition-all duration-300" style={{ width: `${Math.min(cost.foodCostPct, 100)}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/8 p-3">
                <div className="text-[10px] uppercase tracking-[0.12em] text-[#9fb2b5]">{t(locale, "gross profit", "gross profit")}</div>
                <div className="mt-1 font-display text-lg font-semibold text-white">{money(cost.grossProfit)}</div>
              </div>
              <div className="rounded-xl bg-white/8 p-3">
                <div className="text-[10px] uppercase tracking-[0.12em] text-[#9fb2b5]">{t(locale, "suggested", "suggested")}</div>
                <div className="mt-1 font-display text-lg font-semibold text-[#e9bc83]">{money(cost.suggestedPrice)}</div>
              </div>
            </div>
          </div>
        </div>

        <PriceScenario locale={locale} portionCost={cost.portionCost} targetFoodCostPct={product.targetFoodCostPct} />

        <div className="rounded-[22px] border border-[#ddd6c7] bg-[#fffdf7] p-5">
          <div className="mb-4 flex items-center gap-2">
            <ArrowDownToLine size={15} className="text-[#bd6c40]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a928d]">
              {t(locale, "cost trail", "cost trail")}
            </span>
          </div>
          <div className="space-y-3">
            {product.components.map((line, index) => (
              <div key={line.id} className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e9eee9] text-[10px] font-bold text-[#517a61]">{index + 1}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-3 text-xs font-semibold text-[#52615b]">
                    <span className="truncate">{line.name}</span>
                    <span>{line.qty} {formatUnit(line.unit as BaseUnit)}</span>
                  </div>
                  <div className="text-[10px] text-[#9aa09c]">{line.sourceType === "subrecipe" ? "Batch yield cost" : "EP ingredient cost"}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </section>
  );
}

function Dashboard({ locale, onNavigate, store }: { locale: LocaleMode; onNavigate: (workspace: Workspace) => void; store: CostingStore }) {
  const { ingredients, subRecipes, products, productCosts, subRecipeCosts, sheetsConfigured, syncState } = store;

  const approvedCount = subRecipes.filter((recipe) => recipe.status === "approved").length;
  const totalBatchValue = useMemo(
    () => Array.from(subRecipeCosts.values()).reduce((sum, result) => sum + result.totalCost, 0),
    [subRecipeCosts],
  );
  const withinTargetCount = useMemo(
    () => products.filter((p) => {
      const c = productCosts.get(p.id);
      return c && c.foodCostPct > 0 && c.foodCostPct <= p.targetFoodCostPct;
    }).length,
    [products, productCosts],
  );
  const needsAttention = Array.from(productCosts.values()).some((r) => r.hasUnresolvedRefs) ||
    Array.from(subRecipeCosts.values()).some((result) => result.hasCycle || result.hasUnresolvedRefs);

  const avgFoodCostPct = useMemo(() => {
    const withPrice = products.filter((p) => (productCosts.get(p.id)?.foodCostPct ?? 0) > 0);
    if (withPrice.length === 0) return 0;
    return withPrice.reduce((sum, p) => sum + (productCosts.get(p.id)?.foodCostPct ?? 0), 0) / withPrice.length;
  }, [products, productCosts]);

  return (
    <div className="space-y-8">
      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="relative min-h-[320px] overflow-hidden rounded-[30px] bg-[#173242] p-7 text-white shadow-[0_24px_70px_rgba(23,50,66,0.22)] sm:p-9">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08)_0_1px,transparent_1px_20px)] opacity-30" />
          <div className="absolute -right-20 top-8 h-64 w-64 rotate-12 border border-[#e9bc83]/35" />
          <div className="absolute -right-10 bottom-[-90px] h-64 w-64 rounded-full border-[42px] border-[#bd6c40]/25" />
          <div className="relative max-w-[650px]">
            <SectionKicker>{t(locale, "recipe costing lab", "recipe costing lab")}</SectionKicker>
            <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
              {t(locale, "ควบคุมต้นทุนอาหารจากราคาซื้อถึงกำไรต่อจาน", "Control recipe cost from purchase price to plate margin")}
            </h1>
            <p className="mt-5 max-w-[560px] text-sm leading-7 text-[#c7d2d2]">
              {t(
                locale,
                "ระบบนี้ใช้หลัก AP/EP yield, batch yield, cost per unit และ finished product portion cost เพื่อให้สูตรอาหารตรวจสอบได้แบบสากล.",
                "A standards-based workspace for AP/EP yield, batch costing, cost per unit, baker's percentages, and finished product profitability.",
              )}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button onClick={() => onNavigate("finished")} className="bg-[#e9bc83] text-[#173242] hover:bg-[#f0ca99]">
                <Target size={16} />
                {t(locale, "ดูเมนูทั้งหมด", "Browse all menu items")}
              </Button>
              <Button variant="outline" onClick={() => onNavigate("subrecipes")} className="border-white/20 bg-white/10 text-white hover:bg-white/15">
                <Beaker size={16} />
                {t(locale, "จัดการสูตรย่อย", "Manage sub-recipes")}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <MetricCard label={t(locale, "เมนูทั้งหมด", "menu items")} value={String(products.length)} note={t(locale, `${withinTargetCount} รายการอยู่ในเป้าหมาย`, `${withinTargetCount} within target`)} tone="copper" />
          <MetricCard label={t(locale, "food cost % เฉลี่ย", "avg food cost %")} value={avgFoodCostPct > 0 ? `${avgFoodCostPct.toFixed(1)}%` : "—"} note={t(locale, "เฉลี่ยจากเมนูที่ตั้งราคาแล้ว", "average across priced menu items")} tone={avgFoodCostPct > 0 && avgFoodCostPct <= 35 ? "sage" : "copper"} />
          <MetricCard label={t(locale, "batch value", "batch value")} value={compactMoney(totalBatchValue)} note={t(locale, "ต้นทุนรวมของสูตรย่อย", "total sub-recipe value")} tone="gold" />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label={t(locale, "ingredients", "ingredients")} value={String(ingredients.length)} note={t(locale, "มี AP/EP yield", "with AP/EP yield")} />
        <MetricCard label={t(locale, "sub-recipes", "sub-recipes")} value={String(subRecipes.length)} note={`${approvedCount} approved`} tone="sage" />
        <MetricCard label={t(locale, "เมนูในเป้าหมาย", "on-target items")} value={String(withinTargetCount)} note={t(locale, `จากทั้งหมด ${products.length} เมนู`, `of ${products.length} menu items`)} tone="sage" />
        <MetricCard label={t(locale, "quality gate", "quality gate")} value={needsAttention ? t(locale, "ต้องตรวจ", "Review") : t(locale, "พร้อมใช้", "Ready")} note={needsAttention ? t(locale, "มี reference ที่ต้องแก้", "references need attention") : "No unresolved references"} tone={needsAttention ? "copper" : "sage"} />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_1fr_1fr]">
        {[
          {
            icon: Library,
            title: t(locale, "Ingredient AP/EP", "Ingredient AP/EP"),
            text: t(locale, "บันทึกราคาซื้อ ปริมาณซื้อ และ yield เพื่อคำนวณต้นทุนใช้งานจริง.", "Track purchase price, pack size, and yield to calculate edible portion cost."),
            target: "ingredients" as Workspace,
          },
          {
            icon: Scale,
            title: t(locale, "Batch Yield", "Batch Yield"),
            text: t(locale, "สูตรย่อยคิดต้นทุนจากผลผลิตจริงหลังปรุง ไม่ใช่แค่ผลรวมก่อนปรุง.", "Sub-recipes use real post-process yield, not only pre-cook input weight."),
            target: "subrecipes" as Workspace,
          },
          {
            icon: BadgeCheck,
            title: t(locale, "Menu Price", "Menu Price"),
            text: t(locale, "ดูทุกเมนูพร้อม food cost %, gross profit และราคาแนะนำในหน้าเดียว.", "See every menu item's food cost %, gross profit, and suggested price in one board."),
            target: "finished" as Workspace,
          },
        ].map((item) => (
          <button
            key={item.title}
            onClick={() => onNavigate(item.target)}
            className="group rounded-[24px] border border-[#ddd6c7] bg-[#fffdf7] p-6 text-left shadow-[0_10px_28px_rgba(35,47,42,0.045)] transition hover:-translate-y-0.5 hover:border-[#cdbf9f]"
          >
            <item.icon size={22} className="text-[#bd6c40]" />
            <h3 className="mt-5 font-display text-lg font-semibold text-[#173242]">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[#74807a]">{item.text}</p>
          </button>
        ))}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-[#ddd6c7] bg-[#fffdf7] px-5 py-4">
        <div className="flex items-center gap-3">
          <SyncBadge configured={sheetsConfigured} state={syncState} />
          <span className="text-xs text-[#74807a]">
            {t(locale, "ข้อมูลบันทึกอัตโนมัติในเครื่อง และพร้อมต่อ Google Sheets เมื่อใส่ Apps Script URL", "Data autosaves locally and can sync to Google Sheets when an Apps Script URL is configured.")}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportJson("food-costing-data.json", { ingredients, subRecipes, products })}
          className="border-[#d7c9b5] bg-white text-[#173242] hover:bg-[#f5efe4]"
        >
          <FileJson size={14} />
          Export JSON
        </Button>
      </div>
    </div>
  );
}

export default function Home() {
  const [workspace, setWorkspace] = useState<Workspace>("dashboard");
  const [finishedView, setFinishedView] = useState<FinishedView>("board");
  const [locale, setLocale] = useState<LocaleMode>("th");
  const store = useCostingStore();

  const {
    ingredients,
    subRecipes,
    products,
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
    loadFromSheets,
    saveIngredientToSheets,
    saveSubRecipeToSheets,
    deleteFromSheets,
  } = store;

  const currentTitle = workspaceItems.find((item) => item.id === workspace);

  const goToWorkspace = (target: Workspace) => {
    if (target === "finished") setFinishedView("board");
    setWorkspace(target);
  };

  const openProduct = (id: string) => {
    selectProduct(id);
    setFinishedView("detail");
    setWorkspace("finished");
  };

  const backToBoard = () => setFinishedView("board");

  const handleCreateProduct = () => {
    const id = createProduct();
    setFinishedView("detail");
    setWorkspace("finished");
    void id;
  };

  const removeIngredientEverywhere = (id: string) => {
    removeIngredient(id);
    deleteFromSheets("ingredients", id);
    toast.success(t(locale, "ลบวัตถุดิบแล้ว", "Ingredient removed"));
  };

  const removeSubRecipeEverywhere = (id: string) => {
    removeSubRecipe(id);
    deleteFromSheets("subRecipes", id);
    toast.success(t(locale, "ลบสูตรย่อยแล้ว", "Sub-recipe removed"));
  };

  const removeProductEverywhere = (id: string) => {
    removeProduct(id);
    deleteFromSheets("finishedProducts", id);
    toast.success(t(locale, "ลบเมนูแล้ว", "Menu item removed"));
  };

  const pageTitle =
    workspace === "finished" && finishedView === "detail" && selectedProduct
      ? selectedProduct.name
      : t(locale, currentTitle?.th ?? "", currentTitle?.en ?? "");

  return (
    <div className="min-h-screen bg-[#f5f1e8] text-[#173242]">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[246px] flex-col border-r border-[#d8d0c1] bg-[#173242] text-[#edf0eb] lg:flex">
        <div className="px-6 py-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e9bc83] text-[#173242] shadow-[0_10px_24px_rgba(233,188,131,0.22)]">
              <Scale size={22} strokeWidth={2.2} />
            </div>
            <div>
              <div className="font-display text-[16px] font-semibold">COST LEDGER</div>
              <div className="mt-0.5 text-[10px] uppercase tracking-[0.22em] text-[#aebec0]">kitchen standard</div>
            </div>
          </div>
        </div>

        <div className="px-4">
          <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8fa5ad]">workspace</div>
          <nav className="space-y-1">
            {workspaceItems.map((item) => {
              const Icon = item.icon;
              const active = workspace === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => goToWorkspace(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                    active ? "bg-[#bd6c40] font-semibold text-white shadow-lg shadow-[#bd6c40]/20" : "text-[#b9c5c8] hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={17} strokeWidth={1.9} />
                  {t(locale, item.th, item.en)}
                  {item.id === "finished" && (
                    <span className="ml-auto rounded-full bg-white/15 px-1.5 py-0.5 text-[10px]">{products.length}</span>
                  )}
                  {active && item.id !== "finished" && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#e9bc83]" />}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto space-y-4 border-t border-white/10 p-4">
          <div className="rounded-2xl bg-[#27485a] p-4">
            <div className="mb-2 flex items-center gap-2 text-[#e9bc83]">
              <BookOpen size={15} />
              <span className="text-[11px] font-semibold uppercase tracking-wider">AP / EP / Yield</span>
            </div>
            <p className="text-xs leading-5 text-[#b9c5c8]">
              {t(locale, "โครงคำนวณแยกราคาซื้อ yield สูตรย่อย และ portion cost", "Costing separates purchase price, yield, batches, and portions.")}
            </p>
          </div>
          <SyncBadge configured={sheetsConfigured} state={syncState} />
        </div>
      </aside>

      <main className="lg:ml-[246px]">
        <header className="sticky top-0 z-10 border-b border-[#ddd6c7] bg-[#f5f1e8]/92 px-5 py-4 backdrop-blur-xl sm:px-8">
          <div className="mx-auto flex max-w-[1480px] flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#173242] text-[#e9bc83] lg:hidden">
                <Scale size={18} />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8a928d]">
                  {workspace === "finished" && finishedView === "detail"
                    ? t(locale, "แก้ไขเมนู", "Editing menu item")
                    : t(locale, currentTitle?.th ?? "", currentTitle?.en ?? "")}
                </div>
                <div className="mt-0.5 text-sm font-semibold text-[#173242]">{pageTitle}</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocale(locale === "th" ? "en" : "th")}
                className="border-[#d7c9b5] bg-white text-[#173242] hover:bg-[#f5efe4]"
              >
                <Globe2 size={14} />
                {locale === "th" ? "TH" : "EN"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={loadFromSheets}
                className="border-[#d7c9b5] bg-white text-[#173242] hover:bg-[#f5efe4]"
              >
                <RefreshCw size={14} />
                {t(locale, "โหลด Sheets", "Load Sheets")}
              </Button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1480px] px-5 pb-16 pt-8 sm:px-8 lg:px-10">
          {!(workspace === "finished" && finishedView === "detail") && (
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <SectionKicker>{t(locale, "live costing workspace", "live costing workspace")}</SectionKicker>
                <h2 className="font-display text-2xl font-semibold text-[#173242] sm:text-3xl">
                  {t(locale, currentTitle?.th ?? "", currentTitle?.en ?? "")}
                </h2>
                <p className="mt-1 max-w-[700px] text-sm leading-6 text-[#6f7b75]">
                  {t(
                    locale,
                    "แก้ข้อมูลได้ทันที ทุกตัวเลขคำนวณต่อเนื่องจากวัตถุดิบไปถึงราคาขาย และบันทึกลง localStorage อัตโนมัติ.",
                    "Edit in place; every number recalculates from ingredients through selling price and autosaves to localStorage.",
                  )}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 rounded-xl border border-[#ddd6c7] bg-[#fffdf7] p-1">
                {workspaceItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => goToWorkspace(item.id)}
                    className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                      workspace === item.id ? "bg-[#173242] text-white shadow-sm" : "text-[#74807a] hover:text-[#173242]"
                    }`}
                  >
                    {t(locale, item.th, item.en)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {workspace === "dashboard" && <Dashboard locale={locale} onNavigate={goToWorkspace} store={store} />}

          {workspace === "ingredients" && (
            <IngredientLibrary
              ingredients={ingredients}
              onUpsert={upsertIngredient}
              onRemove={removeIngredientEverywhere}
              onSaveToSheets={saveIngredientToSheets}
              sheetsConfigured={sheetsConfigured}
            />
          )}

          {workspace === "subrecipes" && (
            <SubRecipeWorkspace
              ingredients={ingredients}
              subRecipes={subRecipes}
              subRecipeCosts={store.subRecipeCosts}
              onUpsert={upsertSubRecipe}
              onRemove={removeSubRecipeEverywhere}
              onSaveToSheets={saveSubRecipeToSheets}
              sheetsConfigured={sheetsConfigured}
            />
          )}

          {workspace === "finished" && finishedView === "board" && (
            <MenuBoard
              locale={locale}
              products={products}
              productCosts={productCosts}
              onOpen={openProduct}
              onCreate={handleCreateProduct}
              onDuplicate={duplicateProduct}
              onDelete={removeProductEverywhere}
            />
          )}

          {workspace === "finished" && finishedView === "detail" && selectedProduct && selectedProductId && (
            <FinishedProductDetail
              locale={locale}
              store={store}
              product={selectedProduct}
              cost={selectedProductCost}
              onBack={backToBoard}
            />
          )}
        </div>
      </main>
    </div>
  );
}
