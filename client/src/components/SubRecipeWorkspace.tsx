import { useState } from "react";
import { AlertTriangle, Check, Cloud, Plus, Trash2 } from "lucide-react";
import { nanoid } from "nanoid";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RecipeLineRow from "@/components/RecipeLineRow";
import {
  BaseUnit,
  Ingredient,
  RecipeLine,
  RecipeStatus,
  SubRecipe,
  SubRecipeCostResult,
  SubRecipeType,
} from "@/lib/costing-types";
import { computeBakerPercentages, formatUnit } from "@/lib/costing-engine";

const money = (value: number) => `฿${value.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
const money2 = (value: number) => `฿${value.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const TYPE_LABEL: Record<SubRecipeType, string> = {
  dough: "แป้ง (Dough)",
  sauce: "ซอส (Sauce)",
  prepared_topping: "ท็อปปิงที่เตรียมล่วงหน้า",
  other: "อื่น ๆ",
};

const STATUS_LABEL: Record<RecipeStatus, string> = { draft: "Draft", tested: "Tested", approved: "Approved" };
const STATUS_STYLE: Record<RecipeStatus, string> = {
  draft: "border-[#e3d9c5] bg-[#fdf6e8] text-[#a06b2a]",
  tested: "border-[#cfd9d2] bg-[#edf4ee] text-[#527960]",
  approved: "border-[#c9dae0] bg-[#e8f2f5] text-[#1d3343]",
};

const UNIT_OPTIONS: BaseUnit[] = ["g", "kg", "ml", "l", "piece"];

interface SubRecipeWorkspaceProps {
  ingredients: Ingredient[];
  subRecipes: SubRecipe[];
  subRecipeCosts: Map<string, SubRecipeCostResult>;
  onUpsert: (sub: SubRecipe) => void;
  onRemove: (id: string) => void;
  onSaveToSheets?: (sub: SubRecipe) => void;
  sheetsConfigured: boolean;
}

function blankSubRecipe(): SubRecipe {
  return {
    id: nanoid(8),
    name: "สูตรย่อยใหม่",
    type: "sauce",
    version: "v1",
    status: "draft",
    lines: [],
    batchYieldQty: 0,
    batchYieldUnit: "g",
  };
}

export default function SubRecipeWorkspace({
  ingredients,
  subRecipes,
  subRecipeCosts,
  onUpsert,
  onRemove,
  onSaveToSheets,
  sheetsConfigured,
}: SubRecipeWorkspaceProps) {
  const [selectedId, setSelectedId] = useState<string | null>(subRecipes[0]?.id ?? null);
  const selected = subRecipes.find((s) => s.id === selectedId) ?? null;
  const cost = selected ? subRecipeCosts.get(selected.id) : undefined;

  const handleCreate = () => {
    const fresh = blankSubRecipe();
    onUpsert(fresh);
    setSelectedId(fresh.id);
  };

  const patchSelected = (patch: Partial<SubRecipe>) => {
    if (!selected) return;
    onUpsert({ ...selected, ...patch });
  };

  const addLine = () => {
    if (!selected) return;
    const first = ingredients[0];
    const newLine: RecipeLine = {
      id: nanoid(6),
      sourceType: "ingredient",
      refId: first?.id ?? "",
      name: first?.name ?? "",
      qty: 0,
      unit: "g",
    };
    onUpsert({ ...selected, lines: [...selected.lines, newLine] });
  };

  const updateLine = (lineId: string, patch: Partial<RecipeLine>) => {
    if (!selected) return;
    onUpsert({ ...selected, lines: selected.lines.map((l) => (l.id === lineId ? { ...l, ...patch } : l)) });
  };

  const removeLine = (lineId: string) => {
    if (!selected) return;
    const nextLines = selected.lines.filter((l) => l.id !== lineId);
    const patch: Partial<SubRecipe> = { lines: nextLines };
    if (selected.flourIngredientLineId === lineId) patch.flourIngredientLineId = undefined;
    onUpsert({ ...selected, ...patch });
  };

  const bakerResult = selected && selected.type === "dough" ? computeBakerPercentages(selected) : null;

  const yieldLossPct =
    selected?.weightBeforeCook && selected.weightBeforeCook > 0
      ? ((selected.weightBeforeCook - selected.batchYieldQty) / selected.weightBeforeCook) * 100
      : null;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      {/* รายการสูตรย่อยทั้งหมด */}
      <div className="rounded-[24px] border border-[#ded9ce] bg-[#fbfaf6] p-4 shadow-[0_10px_30px_rgba(36,48,45,0.045)]">
        <div className="mb-3 flex items-center justify-between px-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a918d]">sub-recipe library</span>
        </div>
        <div className="space-y-1.5">
          {subRecipes.map((sub) => {
            const c = subRecipeCosts.get(sub.id);
            return (
              <button
                key={sub.id}
                onClick={() => setSelectedId(sub.id)}
                className={`w-full rounded-xl px-3 py-2.5 text-left transition-colors ${
                  sub.id === selectedId ? "bg-[#1d3343] text-white" : "text-[#1d3343] hover:bg-[#efece3]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold">{sub.name}</span>
                  {(c?.hasUnresolvedRefs || c?.hasCycle) && (
                    <AlertTriangle size={13} className={sub.id === selectedId ? "text-[#f5d58b]" : "text-[#b45331]"} />
                  )}
                </div>
                <div className={`mt-0.5 text-[10px] ${sub.id === selectedId ? "text-[#b9c5c8]" : "text-[#8a918d]"}`}>
                  {TYPE_LABEL[sub.type]} · {c ? `${money(c.costPerUnit)}/${formatUnit(sub.batchYieldUnit)}` : "-"}
                </div>
              </button>
            );
          })}
        </div>
        <button
          onClick={handleCreate}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#c9c2b3] px-3 py-2.5 text-xs font-semibold text-[#c56a3d] hover:bg-[#fff2ea]"
        >
          <Plus size={14} />สร้างสูตรย่อยใหม่
        </button>
      </div>

      {/* ตัวแก้ไขสูตรย่อยที่เลือก */}
      {!selected ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-[24px] border border-dashed border-[#ded9ce] bg-[#fbfaf6] text-sm text-[#8a918d]">
          ยังไม่มีสูตรย่อย — กด "สร้างสูตรย่อยใหม่" เพื่อเริ่มต้น
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-[24px] border border-[#ded9ce] bg-[#fbfaf6] p-6 shadow-[0_10px_30px_rgba(36,48,45,0.045)]">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <Input
                value={selected.name}
                onChange={(e) => patchSelected({ name: e.target.value })}
                className="h-10 max-w-[360px] border-transparent bg-transparent font-display text-lg font-semibold text-[#1d3343] shadow-none focus:border-[#d4c7ba] focus:bg-white"
              />
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`px-2.5 py-1 text-[11px] font-medium ${STATUS_STYLE[selected.status]}`}>
                  {selected.status === "approved" && <Check size={12} className="mr-1" />}
                  {STATUS_LABEL[selected.status]}
                </Badge>
                {sheetsConfigured && (
                  <button
                    onClick={() => onSaveToSheets?.(selected)}
                    className="flex items-center gap-1.5 rounded-lg bg-[#1d3343] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#274a5e]"
                  >
                    <Cloud size={13} />บันทึกลง Sheets
                  </button>
                )}
                <button
                  onClick={() => {
                    onRemove(selected.id);
                    setSelectedId(subRecipes.find((s) => s.id !== selected.id)?.id ?? null);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#a5aaa6] hover:bg-[#f8e8e1] hover:text-[#b45331]"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-[#8a918d]">ประเภท</span>
                <Select value={selected.type} onValueChange={(v: SubRecipeType) => patchSelected({ type: v })}>
                  <SelectTrigger className="h-9 w-full border-[#e3ded4] bg-white text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(TYPE_LABEL) as SubRecipeType[]).map((t) => (
                      <SelectItem key={t} value={t}>
                        {TYPE_LABEL[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-[#8a918d]">เวอร์ชัน</span>
                <Input value={selected.version} onChange={(e) => patchSelected({ version: e.target.value })} className="h-9 border-[#e3ded4] bg-white text-sm" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-[#8a918d]">สถานะ</span>
                <Select value={selected.status} onValueChange={(v: RecipeStatus) => patchSelected({ status: v })}>
                  <SelectTrigger className="h-9 w-full border-[#e3ded4] bg-white text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(STATUS_LABEL) as RecipeStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-[#8a918d]">ที่มาของสูตร</span>
                <Input
                  value={selected.source ?? ""}
                  onChange={(e) => patchSelected({ source: e.target.value })}
                  placeholder="เช่น ทดสอบในครัว"
                  className="h-9 border-[#e3ded4] bg-white text-sm"
                />
              </label>
            </div>
          </div>

          {/* ส่วนประกอบใน Batch */}
          <div className="rounded-[24px] border border-[#ded9ce] bg-[#fbfaf6] shadow-[0_10px_30px_rgba(36,48,45,0.045)]">
            <div className="flex items-center justify-between border-b border-[#e6e2d9] px-5 py-5 sm:px-7">
              <div>
                <h3 className="font-display text-base font-semibold text-[#1d3343]">ส่วนประกอบใน Batch</h3>
                <p className="mt-1 text-xs text-[#818987]">เลือกวัตถุดิบจากคลัง หรืออ้างอิงสูตรย่อยอื่นเป็นฐาน (เช่น ซอสที่ใช้ Sofrito)</p>
              </div>
            </div>
            <div className="overflow-x-auto px-5 py-4 sm:px-7">
              <div className="min-w-[620px]">
                <div className="grid grid-cols-[86px_minmax(160px,1.5fr)_75px_75px_95px_32px] gap-2 border-b border-[#e6e2d9] pb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[#929996]">
                  <div>แหล่งต้นทุน</div>
                  <div>รายการ</div>
                  <div>ปริมาณ</div>
                  <div>หน่วย</div>
                  <div className="text-right">ต้นทุน</div>
                  <div />
                </div>
                <div className="divide-y divide-[#eeeae1]">
                  {selected.lines.map((line) => (
                    <RecipeLineRow
                      key={line.id}
                      line={line}
                      ingredients={ingredients}
                      subRecipes={subRecipes}
                      subRecipeCosts={subRecipeCosts}
                      lineCost={cost?.lineCosts[line.id] ?? 0}
                      unresolved={
                        line.sourceType === "ingredient"
                          ? !ingredients.some((i) => i.id === line.refId)
                          : !subRecipes.some((s) => s.id === line.refId)
                      }
                      onChange={(patch) => updateLine(line.id, patch)}
                      onRemove={() => removeLine(line.id)}
                      excludeSubRecipeId={selected.id}
                    />
                  ))}
                </div>
                <button onClick={addLine} className="mt-3 flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold text-[#c56a3d] hover:bg-[#fff2ea]">
                  <Plus size={15} />เพิ่มรายการ
                </button>
              </div>
            </div>
          </div>

          {/* ผลผลิต / Batch Yield + สรุปต้นทุน */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[24px] border border-[#ded9ce] bg-[#fbfaf6] p-6 shadow-[0_10px_30px_rgba(36,48,45,0.045)]">
              <h3 className="font-display text-base font-semibold text-[#1d3343]">ผลผลิตจริงหลังทำ (Batch Yield)</h3>
              <p className="mt-1 text-xs text-[#818987]">ต้องชั่งน้ำหนักจริงหลังเคี่ยว/หมัก ไม่ใช้ปริมาณรวมก่อนปรุง</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-[#8a918d]">น้ำหนักก่อนปรุง (ถ้ามี)</span>
                  <Input
                    type="number"
                    value={selected.weightBeforeCook ?? ""}
                    onChange={(e) => patchSelected({ weightBeforeCook: e.target.value ? Number(e.target.value) : undefined })}
                    className="h-9 border-[#e3ded4] bg-white text-right text-sm"
                  />
                </label>
                <div />
                <label className="block">
                  <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-[#8a918d]">ผลผลิตจริง (ชั่งหลังทำ)</span>
                  <Input
                    type="number"
                    value={selected.batchYieldQty}
                    onChange={(e) => patchSelected({ batchYieldQty: Number(e.target.value) })}
                    className="h-9 border-[#e3ded4] bg-white text-right text-sm"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-[#8a918d]">หน่วยผลผลิต</span>
                  <Select value={selected.batchYieldUnit} onValueChange={(v: BaseUnit) => patchSelected({ batchYieldUnit: v })}>
                    <SelectTrigger className="h-9 w-full border-[#e3ded4] bg-white text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIT_OPTIONS.map((u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
                {selected.type === "dough" && (
                  <label className="block">
                    <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-[#8a918d]">จำนวนก้อนที่แบ่งได้</span>
                    <Input
                      type="number"
                      value={selected.ballCount ?? ""}
                      onChange={(e) => patchSelected({ ballCount: e.target.value ? Number(e.target.value) : undefined })}
                      className="h-9 border-[#e3ded4] bg-white text-right text-sm"
                    />
                  </label>
                )}
              </div>
              {yieldLossPct !== null && (
                <div className="mt-4 rounded-xl bg-[#fffaf0] px-4 py-3 text-xs text-[#917b56]">
                  น้ำหนักหายไประหว่างปรุง {yieldLossPct.toFixed(1)}% (ระเหย/ติดภาชนะ) — ปกติของซอสที่เคี่ยว
                </div>
              )}
              <label className="mt-4 block">
                <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-[#8a918d]">วิธีทำ / เวลา / อุณหภูมิ</span>
                <Textarea
                  value={selected.method ?? ""}
                  onChange={(e) => patchSelected({ method: e.target.value })}
                  className="min-h-[70px] border-[#e3ded4] bg-white text-sm"
                  placeholder="เช่น เคี่ยวไฟอ่อน 15–20 นาที"
                />
              </label>
            </div>

            <div className="overflow-hidden rounded-[24px] border-l-4 border-[#c56a3d] bg-[#1d3343] p-6 text-white shadow-[0_18px_50px_rgba(29,51,67,0.18)]">
              <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#b9c5c8]">batch cost summary</div>
              <h3 className="font-display text-xl font-semibold">{selected.name}</h3>
              <div className="mt-5 space-y-3 border-t border-dashed border-white/15 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#b9c5c8]">ต้นทุนรวม Batch</span>
                  <span className="font-display text-sm font-semibold">{money2(cost?.totalCost ?? 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#b9c5c8]">ผลผลิตจริง</span>
                  <span className="font-display text-sm font-semibold">
                    {selected.batchYieldQty} {formatUnit(selected.batchYieldUnit)}
                  </span>
                </div>
              </div>
              <div className="mt-4 rounded-2xl bg-[#284558] p-4">
                <div className="text-[10px] uppercase tracking-[0.14em] text-[#9eb0b2]">cost / {formatUnit(selected.batchYieldUnit)}</div>
                <div className="mt-1 font-display text-3xl font-semibold text-[#e7b887]">{money(cost?.costPerUnit ?? 0)}</div>
                <div className="mt-2 text-[11px] text-[#a8c7b0]">ตัวเลขนี้จะถูกดึงไปใช้อัตโนมัติเมื่อสินค้าสำเร็จรูปอ้างอิงสูตรย่อยนี้</div>
              </div>
              {(cost?.hasUnresolvedRefs || cost?.hasCycle) && (
                <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#4a2a22] px-3 py-2.5 text-[11px] text-[#f3c9b8]">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  <span>{cost?.hasCycle ? "พบการอ้างอิงสูตรย่อยแบบวนกลับ กรุณาตรวจสอบรายการ" : "มีบางบรรทัดอ้างอิงรายการที่ถูกลบไปแล้ว"}</span>
                </div>
              )}
            </div>
          </div>

          {/* Baker's Percentage */}
          {selected.type === "dough" && (
            <div className="rounded-[24px] border border-[#ded9ce] bg-[#fbfaf6] p-6 shadow-[0_10px_30px_rgba(36,48,45,0.045)]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-display text-base font-semibold text-[#1d3343]">Baker's Percentage</h3>
                  <p className="mt-1 text-xs text-[#818987]">กำหนดน้ำหนักแป้งเป็น 100% แล้วเทียบวัตถุดิบอื่นเป็นเปอร์เซ็นต์ของแป้ง</p>
                </div>
                <label className="block">
                  <span className="mb-1.5 block text-right text-[10px] font-semibold uppercase tracking-wide text-[#8a918d]">บรรทัดไหนคือ "แป้ง"</span>
                  <Select value={selected.flourIngredientLineId ?? ""} onValueChange={(v) => patchSelected({ flourIngredientLineId: v })}>
                    <SelectTrigger className="h-9 w-[220px] border-[#e3ded4] bg-white text-sm">
                      <SelectValue placeholder="เลือกบรรทัดแป้ง" />
                    </SelectTrigger>
                    <SelectContent>
                      {selected.lines.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
              </div>

              {!bakerResult ? (
                <div className="rounded-xl border border-dashed border-[#d6c6a5] bg-[#fffaf0] px-4 py-3 text-xs text-[#917b56]">
                  เลือกบรรทัดที่เป็น "แป้ง" ก่อน ระบบจะคำนวณ Baker's % และ Hydration ให้อัตโนมัติ
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-3 border-b border-[#e6e2d9] pb-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#929996]">
                    <div>วัตถุดิบ</div>
                    <div className="text-right">น้ำหนัก (g)</div>
                    <div className="text-right">Baker %</div>
                  </div>
                  <div className="divide-y divide-[#eeeae1]">
                    {bakerResult.rows.map((row) => (
                      <div key={row.lineId} className="grid grid-cols-3 gap-3 py-2 text-sm">
                        <div className="text-[#1d3343]">{row.name}</div>
                        <div className="text-right text-[#707a78]">{row.weightGrams.toFixed(0)}</div>
                        <div className="text-right font-display font-semibold text-[#c56a3d]">{row.bakerPct.toFixed(1)}%</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-[#edf4ee] p-4">
                      <div className="text-[10px] uppercase tracking-[0.14em] text-[#66806d]">hydration</div>
                      <div className="mt-1 font-display text-xl font-semibold text-[#2f6549]">
                        {bakerResult.hydrationPct !== null ? `${bakerResult.hydrationPct.toFixed(1)}%` : "-"}
                      </div>
                    </div>
                    <div className="rounded-xl bg-[#f5e8d0] p-4">
                      <div className="text-[10px] uppercase tracking-[0.14em] text-[#a06b2a]">น้ำหนักโดว์รวม</div>
                      <div className="mt-1 font-display text-xl font-semibold text-[#a06b2a]">{bakerResult.totalDoughWeightGrams.toFixed(0)} g</div>
                    </div>
                    <div className="rounded-xl bg-[#eef1f6] p-4">
                      <div className="text-[10px] uppercase tracking-[0.14em] text-[#495a73]">น้ำหนัก/ก้อน</div>
                      <div className="mt-1 font-display text-xl font-semibold text-[#1d3343]">
                        {bakerResult.doughBallWeightGrams !== null ? `${bakerResult.doughBallWeightGrams.toFixed(0)} g` : "ระบุจำนวนก้อน"}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <label className="block rounded-[22px] border border-dashed border-[#ded9ce] bg-[#fbfaf6] p-5">
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-[#8a918d]">หมายเหตุ / Allergen</span>
            <Textarea
              value={selected.notes ?? ""}
              onChange={(e) => patchSelected({ notes: e.target.value })}
              className="min-h-[60px] border-[#e3ded4] bg-white text-sm"
              placeholder="เช่น มีกลูเตนและนม, ยังไม่ยืนยันน้ำหนักก้อนจริง"
            />
          </label>
        </div>
      )}
    </div>
  );
}
