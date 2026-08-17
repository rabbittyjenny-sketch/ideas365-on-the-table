import { AlertTriangle, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BaseUnit, Ingredient, LineSourceType, RecipeLine, SubRecipe, SubRecipeCostResult } from "@/lib/costing-types";
import { formatUnit } from "@/lib/costing-engine";

const money = (value: number) => `฿${value.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const UNIT_OPTIONS: BaseUnit[] = ["g", "kg", "ml", "l", "piece"];

interface RecipeLineRowProps {
  line: RecipeLine;
  ingredients: Ingredient[];
  subRecipes: SubRecipe[];
  subRecipeCosts: Map<string, SubRecipeCostResult>;
  lineCost: number;
  unresolved: boolean;
  onChange: (patch: Partial<RecipeLine>) => void;
  onRemove: () => void;
  excludeSubRecipeId?: string;
}

export default function RecipeLineRow({
  line,
  ingredients,
  subRecipes,
  subRecipeCosts,
  lineCost,
  unresolved,
  onChange,
  onRemove,
  excludeSubRecipeId,
}: RecipeLineRowProps) {
  const availableSubRecipes = subRecipes.filter((s) => s.id !== excludeSubRecipeId);

  const handleSourceTypeChange = (value: LineSourceType) => {
    if (value === "ingredient") {
      const first = ingredients[0];
      onChange({ sourceType: "ingredient", refId: first?.id ?? "", name: first?.name ?? "" });
    } else {
      const first = availableSubRecipes[0];
      onChange({ sourceType: "subrecipe", refId: first?.id ?? "", name: first?.name ?? "" });
    }
  };

  const handleRefChange = (refId: string) => {
    if (line.sourceType === "ingredient") {
      const ing = ingredients.find((i) => i.id === refId);
      onChange({ refId, name: ing?.name ?? "" });
    } else {
      const sub = availableSubRecipes.find((s) => s.id === refId);
      onChange({ refId, name: sub?.name ?? "" });
    }
  };

  return (
    <div className="grid grid-cols-[86px_minmax(160px,1.5fr)_75px_75px_95px_32px] items-center gap-2 py-2.5">
      <Select value={line.sourceType} onValueChange={handleSourceTypeChange}>
        <SelectTrigger className="h-9 border-[#e3ded4] bg-white text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ingredient">วัตถุดิบ</SelectItem>
          <SelectItem value="subrecipe">สูตรย่อย</SelectItem>
        </SelectContent>
      </Select>

      <div>
        <Select value={line.refId} onValueChange={handleRefChange}>
          <SelectTrigger className="h-9 w-full border-[#e3ded4] bg-white text-sm">
            <SelectValue placeholder="เลือกรายการ" />
          </SelectTrigger>
          <SelectContent>
            {line.sourceType === "ingredient"
              ? ingredients.map((ing) => (
                  <SelectItem key={ing.id} value={ing.id}>
                    {ing.name}
                  </SelectItem>
                ))
              : availableSubRecipes.map((sub) => {
                  const cost = subRecipeCosts.get(sub.id);
                  return (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.name} {cost ? `· ${money(cost.costPerUnit)}/${formatUnit(sub.batchYieldUnit)}` : ""}
                    </SelectItem>
                  );
                })}
          </SelectContent>
        </Select>
        {unresolved && (
          <div className="mt-1 flex items-center gap-1 pl-1 text-[10px] text-[#b45331]">
            <AlertTriangle size={11} /> รายการต้นทางถูกลบไปแล้ว
          </div>
        )}
      </div>

      <Input
        type="number"
        value={line.qty}
        onChange={(event) => onChange({ qty: Number(event.target.value) })}
        className="h-9 border-[#e3ded4] bg-white text-right text-sm"
      />

      <Select value={line.unit} onValueChange={(value: BaseUnit) => onChange({ unit: value })}>
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

      <div className="text-right font-display text-sm font-semibold text-[#1d3343]">{money(lineCost)}</div>

      <button
        aria-label={`ลบ ${line.name}`}
        onClick={onRemove}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#a5aaa6] transition-colors hover:bg-[#f8e8e1] hover:text-[#b45331]"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
