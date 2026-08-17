import { useState } from "react";
import { RotateCcw } from "lucide-react";

const money = (value: number) => `฿${value.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pct = (value: number) => `${value.toFixed(1)}%`;

type Locale = "th" | "en";
function t(locale: Locale, th: string, en: string) {
  return locale === "th" ? th : en;
}

interface PriceScenarioProps {
  locale: Locale;
  portionCost: number;
  targetFoodCostPct: number;
}

/**
 * คิดย้อนกลับ (reverse calculation): ผู้ใช้ใส่ "ราคาขายที่สนใจ" แล้วระบบคำนวณ food cost %
 * และ gross profit ให้ทันที — โดยไม่บันทึกทับราคาขายจริงของเมนู เหมาะกับการทดลองตั้งราคาโปรโมชัน
 */
export default function PriceScenario({ locale, portionCost, targetFoodCostPct }: PriceScenarioProps) {
  const [testPrice, setTestPrice] = useState<string>("");
  const parsed = Number(testPrice);
  const hasPrice = testPrice.trim() !== "" && parsed > 0;
  const fcp = hasPrice && portionCost > 0 ? (portionCost / parsed) * 100 : 0;
  const gp = hasPrice ? parsed - portionCost : 0;
  const withinTarget = fcp > 0 && fcp <= targetFoodCostPct;

  return (
    <div className="rounded-[22px] border border-dashed border-[#cdbf9f] bg-[#fffaf0] p-5">
      <div className="mb-1 flex items-center gap-2">
        <RotateCcw size={14} className="text-[#bd6c40]" />
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a6222]">
          {t(locale, "คิดย้อนกลับ (ไม่บันทึก)", "Reverse calculator (not saved)")}
        </span>
      </div>
      <p className="mb-3 text-xs leading-5 text-[#917b56]">
        {t(
          locale,
          "ลองใส่ราคาขายที่สนใจ เพื่อดูว่าจะได้ food cost % เท่าไร — ใช้ทดลองตั้งราคาโปรโมชันได้โดยไม่กระทบราคาขายจริงของเมนู",
          "Enter a candidate selling price to see the resulting food cost % — test promo pricing without touching the saved price.",
        )}
      </p>
      <div className="relative mb-3">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#8a928d]">฿</span>
        <input
          type="number"
          min="0"
          value={testPrice}
          onChange={(e) => setTestPrice(e.target.value)}
          placeholder={t(locale, "เช่น 259", "e.g. 259")}
          className="h-10 w-full rounded-xl border border-[#e3ded4] bg-white pl-8 pr-3 text-sm text-[#173242] outline-none focus:border-[#cdbf9f]"
        />
      </div>
      {hasPrice && portionCost > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className={`rounded-xl p-3 ${withinTarget ? "bg-[#edf4ee]" : "bg-[#fdece4]"}`}>
            <div className={`text-[10px] font-bold uppercase tracking-[0.1em] ${withinTarget ? "text-[#3d6249]" : "text-[#a5401f]"}`}>
              food cost %
            </div>
            <div className={`mt-1 font-display text-xl font-semibold ${withinTarget ? "text-[#3d6249]" : "text-[#a5401f]"}`}>{pct(fcp)}</div>
            <div className={`mt-0.5 text-[10px] ${withinTarget ? "text-[#527960]" : "text-[#b45331]"}`}>
              {withinTarget
                ? t(locale, `✓ อยู่ในเป้า ${targetFoodCostPct}%`, `✓ within ${targetFoodCostPct}% target`)
                : t(locale, `เกินเป้า ${(fcp - targetFoodCostPct).toFixed(1)}%`, `${(fcp - targetFoodCostPct).toFixed(1)}% over target`)}
            </div>
          </div>
          <div className="rounded-xl bg-[#eef1f6] p-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#495a73]">
              {t(locale, "กำไรต่อจาน", "gross profit / portion")}
            </div>
            <div className="mt-1 font-display text-xl font-semibold text-[#1d3343]">{money(gp)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
