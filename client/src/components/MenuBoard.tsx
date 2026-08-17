import { useMemo, useState } from "react";
import { AlertTriangle, Copy, Plus, Search, Trash2, Utensils } from "lucide-react";
import { FinishedProduct, FinishedProductCostResult } from "@/lib/costing-types";

const money = (value: number) => `฿${value.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pct = (value: number) => `${value.toFixed(1)}%`;

type Locale = "th" | "en";
function t(locale: Locale, th: string, en: string) {
  return locale === "th" ? th : en;
}

/** สถานะ food cost % เทียบกับเป้าหมาย — ใช้สีบอกสถานะโดยไม่ต้องอ่านตัวเลขละเอียด */
type CostStatus = "none" | "good" | "ok" | "over";

function statusOf(foodCostPct: number, target: number): CostStatus {
  if (foodCostPct <= 0) return "none";
  if (foodCostPct <= target * 0.85) return "good";
  if (foodCostPct <= target) return "ok";
  return "over";
}

const STATUS_STYLE: Record<CostStatus, { badge: string; bar: string; ring: string }> = {
  none: { badge: "bg-[#f1efe6] text-[#8a928d]", bar: "bg-[#d8d0c1]", ring: "border-[#ddd6c7]" },
  good: { badge: "bg-[#edf4ee] text-[#3d6249]", bar: "bg-[#517a61]", ring: "border-[#cfe0d4]" },
  ok: { badge: "bg-[#fdf6e8] text-[#8a6222]", bar: "bg-[#c99a3e]", ring: "border-[#e8d9b5]" },
  over: { badge: "bg-[#fdece4] text-[#a5401f]", bar: "bg-[#c8552c]", ring: "border-[#f0c9b5]" },
};

interface MenuBoardProps {
  locale: Locale;
  products: FinishedProduct[];
  productCosts: Map<string, FinishedProductCostResult>;
  onOpen: (id: string) => void;
  onCreate: () => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

function ProductCard({
  locale,
  product,
  cost,
  onOpen,
  onDuplicate,
  onDelete,
}: {
  locale: Locale;
  product: FinishedProduct;
  cost: FinishedProductCostResult | undefined;
  onOpen: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const fcp = cost?.foodCostPct ?? 0;
  const status = statusOf(fcp, product.targetFoodCostPct);
  const style = STATUS_STYLE[status];
  const hasIssue = cost?.hasUnresolvedRefs;

  return (
    <div className={`group flex flex-col rounded-[20px] border bg-[#fffdf7] shadow-[0_8px_24px_rgba(35,47,42,0.045)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(35,47,42,0.08)] ${style.ring}`}>
      <button onClick={onOpen} className="flex flex-1 flex-col p-5 text-left">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f1eee3] text-[#bd6c40]">
            <Utensils size={18} />
          </div>
          <div className="flex items-center gap-1.5">
            {hasIssue && (
              <span title={t(locale, "มีส่วนประกอบที่ถูกลบไปแล้ว", "A component reference is missing")}>
                <AlertTriangle size={14} className="text-[#b45331]" />
              </span>
            )}
            {fcp > 0 && (
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${style.badge}`}>{pct(fcp)}</span>
            )}
          </div>
        </div>
        <div className="font-display text-base font-semibold leading-snug text-[#173242]">{product.name}</div>
        <div className="mt-1 text-[11px] text-[#8a928d]">
          {product.components.length} {t(locale, "ส่วนประกอบ", "components")} · {product.portions} {t(locale, "portions", "portions")}
        </div>

        {fcp > 0 && (
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-[10px] text-[#9aa09c]">
              <span>food cost %</span>
              <span>{t(locale, "เป้า", "target")} {product.targetFoodCostPct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#eee9de]">
              <div className={`h-full rounded-full ${style.bar} transition-all`} style={{ width: `${Math.min(fcp, 100)}%` }} />
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[#eee9de] pt-3">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#a5aaa6]">{t(locale, "ราคาขาย", "sell price")}</div>
            <div className="text-sm font-semibold text-[#173242]">{product.sellingPrice > 0 ? money(product.sellingPrice) : "—"}</div>
          </div>
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#a5aaa6]">{t(locale, "ต้นทุน/จาน", "cost/portion")}</div>
            <div className="text-sm font-semibold text-[#bd6c40]">{cost ? money(cost.portionCost) : "—"}</div>
          </div>
        </div>
      </button>

      <div className="flex items-center gap-1 border-t border-[#eee9de] px-3 py-2">
        <button
          onClick={onOpen}
          className="flex-1 rounded-lg px-2 py-1.5 text-center text-[11px] font-semibold text-[#173242] hover:bg-[#f1eee3]"
        >
          {t(locale, "แก้ไข / คำนวณ", "Edit / calculate")}
        </button>
        <button
          aria-label={t(locale, "ทำสำเนา", "Duplicate")}
          onClick={onDuplicate}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#a5aaa6] hover:bg-[#edf4ee] hover:text-[#527960]"
        >
          <Copy size={14} />
        </button>
        <button
          aria-label={t(locale, "ลบเมนู", "Delete menu")}
          onClick={onDelete}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#a5aaa6] hover:bg-[#f8e8e1] hover:text-[#b45331]"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export default function MenuBoard({ locale, products, productCosts, onOpen, onCreate, onDuplicate, onDelete }: MenuBoardProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, search]);

  const summary = useMemo(() => {
    let inTarget = 0;
    let overTarget = 0;
    let unresolved = 0;
    for (const p of products) {
      const cost = productCosts.get(p.id);
      if (!cost || cost.foodCostPct <= 0) continue;
      if (cost.hasUnresolvedRefs) unresolved += 1;
      if (cost.foodCostPct <= p.targetFoodCostPct) inTarget += 1;
      else overTarget += 1;
    }
    return { inTarget, overTarget, unresolved };
  }, [products, productCosts]);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#ddd6c7] bg-[#fffdf7] p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8a928d]">{t(locale, "เมนูทั้งหมด", "total menu items")}</div>
          <div className="mt-2 font-display text-2xl font-semibold text-[#173242]">
            {products.length} {t(locale, "รายการ", "items")}
          </div>
        </div>
        <div className="rounded-2xl border border-[#cfe0d4] bg-[#edf4ee] p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#3d6249]">{t(locale, "อยู่ในเป้าหมาย", "within target")}</div>
          <div className="mt-2 font-display text-2xl font-semibold text-[#3d6249]">
            {summary.inTarget} {t(locale, "รายการ", "items")}
          </div>
        </div>
        <div className={`rounded-2xl border p-4 ${summary.overTarget > 0 ? "border-[#f0c9b5] bg-[#fdece4]" : "border-[#ddd6c7] bg-[#fffdf7]"}`}>
          <div className={`text-[10px] font-bold uppercase tracking-[0.14em] ${summary.overTarget > 0 ? "text-[#a5401f]" : "text-[#8a928d]"}`}>
            {t(locale, "เกินเป้าหมาย", "over target")}
          </div>
          <div className={`mt-2 font-display text-2xl font-semibold ${summary.overTarget > 0 ? "text-[#a5401f]" : "text-[#173242]"}`}>
            {summary.overTarget} {t(locale, "รายการ", "items")}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-[280px]">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#a5aaa6]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t(locale, "ค้นหาเมนู...", "Search menu...")}
            className="h-10 w-full rounded-xl border border-[#e3ded4] bg-[#fffdf7] pl-9 pr-3 text-sm text-[#173242] outline-none focus:border-[#cdbf9f]"
          />
        </div>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 rounded-xl bg-[#173242] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#25485b]"
        >
          <Plus size={15} />
          {t(locale, "เพิ่มเมนูใหม่", "Add new menu")}
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-[24px] border border-dashed border-[#d2c5ad] bg-[#fffdf7] py-16 text-center">
          <Utensils size={28} className="text-[#c9bfa9]" />
          <div className="font-display text-base font-semibold text-[#173242]">
            {products.length === 0 ? t(locale, "ยังไม่มีเมนู", "No menu items yet") : t(locale, "ไม่พบเมนูที่ค้นหา", "No menu matches your search")}
          </div>
          <div className="text-xs text-[#8a928d]">{t(locale, 'คลิก "เพิ่มเมนูใหม่" เพื่อเริ่มต้นคำนวณต้นทุน', 'Click "Add new menu" to start costing a dish')}</div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              locale={locale}
              product={p}
              cost={productCosts.get(p.id)}
              onOpen={() => onOpen(p.id)}
              onDuplicate={() => onDuplicate(p.id)}
              onDelete={() => onDelete(p.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
