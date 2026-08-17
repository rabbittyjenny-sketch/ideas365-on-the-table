import { Plus, Trash2, Cloud } from "lucide-react";
import { nanoid } from "nanoid";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BaseUnit, Ingredient, ingredientApUnitCost, ingredientEpUnitCost } from "@/lib/costing-types";

const money = (value: number) => `฿${value.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const UNIT_OPTIONS: BaseUnit[] = ["g", "kg", "ml", "l", "piece"];

interface IngredientLibraryProps {
  ingredients: Ingredient[];
  onUpsert: (ing: Ingredient) => void;
  onRemove: (id: string) => void;
  onSaveToSheets?: (ing: Ingredient) => void;
  sheetsConfigured: boolean;
}

export default function IngredientLibrary({ ingredients, onUpsert, onRemove, onSaveToSheets, sheetsConfigured }: IngredientLibraryProps) {
  const addIngredient = () => {
    onUpsert({
      id: nanoid(8),
      name: "วัตถุดิบใหม่",
      category: "ทั่วไป",
      purchasePrice: 0,
      purchaseQty: 1,
      purchaseUnit: "g",
      yieldPct: 100,
      priceDate: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <div className="rounded-[24px] border border-[#ded9ce] bg-[#fbfaf6] shadow-[0_10px_30px_rgba(36,48,45,0.045)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e6e2d9] px-5 py-5 sm:px-7">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#1d3343] text-xs font-bold text-white">A</span>
            <h3 className="font-display text-lg font-semibold text-[#1d3343]">คลังวัตถุดิบ (Ingredient Library)</h3>
          </div>
          <p className="mt-2 pl-8 text-xs text-[#818987]">ราคาซื้อ (AP) และ Yield ของวัตถุดิบ — ใช้ร่วมกันได้ทั้งในสูตรย่อยและสินค้าสำเร็จรูป</p>
        </div>
        <button onClick={addIngredient} className="flex items-center gap-2 rounded-lg bg-[#1d3343] px-3 py-2 text-xs font-semibold text-white hover:bg-[#274a5e]">
          <Plus size={14} />เพิ่มวัตถุดิบ
        </button>
      </div>

      <div className="overflow-x-auto px-5 py-4 sm:px-7">
        <div className="min-w-[880px]">
          <div className="grid grid-cols-[minmax(160px,1.3fr)_120px_95px_85px_85px_75px_100px_100px_32px] items-center gap-3 border-b border-[#e6e2d9] pb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#929996]">
            <div>ingredient</div>
            <div>category</div>
            <div>ราคาซื้อ</div>
            <div>ปริมาณซื้อ</div>
            <div>หน่วย</div>
            <div>yield %</div>
            <div className="text-right">AP / หน่วย</div>
            <div className="text-right">EP / หน่วย</div>
            <div />
          </div>

          <div className="divide-y divide-[#eeeae1]">
            {ingredients.map((ing) => {
              const ap = ingredientApUnitCost(ing);
              const ep = ingredientEpUnitCost(ing);
              return (
                <div key={ing.id} className="group grid grid-cols-[minmax(160px,1.3fr)_120px_95px_85px_85px_75px_100px_100px_32px] items-center gap-3 py-3">
                  <div>
                    <Input
                      value={ing.name}
                      onChange={(e) => onUpsert({ ...ing, name: e.target.value })}
                      onBlur={() => onSaveToSheets?.(ing)}
                      className="h-9 border-transparent bg-transparent px-2 text-sm font-medium text-[#1d3343] shadow-none focus:border-[#d4c7ba] focus:bg-white"
                    />
                    {ing.supplier && <div className="pl-2 text-[10px] text-[#9aa09c]">{ing.supplier}</div>}
                  </div>
                  <Input
                    value={ing.category}
                    onChange={(e) => onUpsert({ ...ing, category: e.target.value })}
                    onBlur={() => onSaveToSheets?.(ing)}
                    className="h-9 border-[#e3ded4] bg-white text-xs"
                  />
                  <div className="relative">
                    <span className="absolute left-2 top-2 text-xs text-[#8a918d]">฿</span>
                    <Input
                      type="number"
                      value={ing.purchasePrice}
                      onChange={(e) => onUpsert({ ...ing, purchasePrice: Number(e.target.value) })}
                      onBlur={() => onSaveToSheets?.(ing)}
                      className="h-9 border-[#e3ded4] bg-white pl-6 text-right text-sm"
                    />
                  </div>
                  <Input
                    type="number"
                    value={ing.purchaseQty}
                    onChange={(e) => onUpsert({ ...ing, purchaseQty: Number(e.target.value) })}
                    onBlur={() => onSaveToSheets?.(ing)}
                    className="h-9 border-[#e3ded4] bg-white text-right text-sm"
                  />
                  <Select value={ing.purchaseUnit} onValueChange={(v: BaseUnit) => onUpsert({ ...ing, purchaseUnit: v })}>
                    <SelectTrigger className="h-9 border-[#e3ded4] bg-white text-xs">
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
                  <div className="relative">
                    <Input
                      type="number"
                      value={ing.yieldPct}
                      onChange={(e) => onUpsert({ ...ing, yieldPct: Number(e.target.value) })}
                      onBlur={() => onSaveToSheets?.(ing)}
                      className={`h-9 border-[#e3ded4] bg-white pr-6 text-right text-sm ${ing.yieldPct < 70 ? "text-[#b45331]" : "text-[#527960]"}`}
                    />
                    <span className="absolute right-2 top-2 text-xs text-[#89928c]">%</span>
                  </div>
                  <div className="text-right text-xs text-[#707a78]">{money(ap)}</div>
                  <div className="text-right font-display text-sm font-semibold text-[#1d3343]">{money(ep)}</div>
                  <div className="flex items-center gap-1">
                    {sheetsConfigured && (
                      <button
                        aria-label="บันทึกลง Google Sheets"
                        onClick={() => onSaveToSheets?.(ing)}
                        className="invisible flex h-8 w-8 items-center justify-center rounded-lg text-[#a5aaa6] hover:bg-[#edf4ee] hover:text-[#527960] group-hover:visible"
                      >
                        <Cloud size={14} />
                      </button>
                    )}
                    <button
                      aria-label={`ลบ ${ing.name}`}
                      onClick={() => onRemove(ing.id)}
                      className="invisible flex h-8 w-8 items-center justify-center rounded-lg text-[#a5aaa6] hover:bg-[#f8e8e1] hover:text-[#b45331] group-hover:visible"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
