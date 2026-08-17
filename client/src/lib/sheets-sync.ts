/**
 * ตัวเชื่อมต่อกับ Google Sheets ผ่าน Google Apps Script Web App
 * ดู google-apps-script/Code.gs สำหรับโค้ดฝั่ง Apps Script และวิธี deploy
 *
 * วิธีติดตั้ง:
 * 1) เปิด Google Sheet ที่ต้องการใช้เก็บข้อมูล
 * 2) Extensions → Apps Script → วางโค้ดจาก google-apps-script/Code.gs
 * 3) Deploy → New deployment → เลือกประเภท "Web app"
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 4) คัดลอก Web app URL ที่ได้ แล้วนำมาแทนที่ค่าในบรรทัดข้างล่างนี้
 */

// ============================================================
// แก้ URL ตรงนี้บรรทัดเดียว (แทนที่ YOUR_DEPLOYMENT_ID ด้วย ID จริง)
// ============================================================
export const APPS_SCRIPT_URL =
  import.meta.env.VITE_APPS_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbzKtUck1kqSDBAou3sZv3A6wVGyXD96MEUqXdoRZYNXxVDRKojQVAqp7EtIdnoNjZ_L/exec";

export type SheetEntityType = "ingredients" | "subRecipes" | "finishedProducts";

export interface SheetsAllData {
  ingredients: unknown[];
  subRecipes: unknown[];
  finishedProducts: unknown[];
}

function isConfigured(): boolean {
  return Boolean(APPS_SCRIPT_URL) && !APPS_SCRIPT_URL.includes("YOUR_DEPLOYMENT_ID");
}

export function isSheetsSyncConfigured(): boolean {
  return isConfigured();
}

/** ดึงข้อมูลทั้งหมด (ingredients, subRecipes, finishedProducts) จาก Google Sheets */
export async function fetchAllData(): Promise<SheetsAllData> {
  if (!isConfigured()) {
    throw new Error("ยังไม่ได้ตั้งค่า APPS_SCRIPT_URL ใน client/src/lib/sheets-sync.ts");
  }
  const res = await fetch(`${APPS_SCRIPT_URL}?action=getAll`, { method: "GET" });
  if (!res.ok) throw new Error(`โหลดข้อมูลไม่สำเร็จ (HTTP ${res.status})`);
  const json = await res.json();
  if (json.ok === false) throw new Error(json.error || "โหลดข้อมูลไม่สำเร็จ");
  return {
    ingredients: json.data?.ingredients ?? [],
    subRecipes: json.data?.subRecipes ?? [],
    finishedProducts: json.data?.finishedProducts ?? [],
  };
}

/**
 * บันทึก (สร้างใหม่หรืออัปเดต) record หนึ่งรายการลง Google Sheets
 * ใช้ Content-Type: text/plain โดยตั้งใจ เพื่อให้ browser ส่งเป็น "simple request"
 * ไม่ trigger CORS preflight (OPTIONS) ซึ่ง Apps Script Web App ไม่รองรับ
 */
export async function saveRecord(type: SheetEntityType, record: Record<string, unknown>): Promise<void> {
  if (!isConfigured()) {
    throw new Error("ยังไม่ได้ตั้งค่า APPS_SCRIPT_URL ใน client/src/lib/sheets-sync.ts");
  }
  const res = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action: "save", type, record }),
  });
  if (!res.ok) throw new Error(`บันทึกไม่สำเร็จ (HTTP ${res.status})`);
  const json = await res.json();
  if (json.ok === false) throw new Error(json.error || "บันทึกไม่สำเร็จ");
}

/** ลบ record ออกจาก Google Sheets ตาม id */
export async function deleteRecord(type: SheetEntityType, id: string): Promise<void> {
  if (!isConfigured()) {
    throw new Error("ยังไม่ได้ตั้งค่า APPS_SCRIPT_URL ใน client/src/lib/sheets-sync.ts");
  }
  const res = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action: "delete", type, id }),
  });
  if (!res.ok) throw new Error(`ลบไม่สำเร็จ (HTTP ${res.status})`);
  const json = await res.json();
  if (json.ok === false) throw new Error(json.error || "ลบไม่สำเร็จ");
}

/** บันทึกข้อมูลทั้งหมดทีเดียว (ใช้ตอนกด "ซิงก์ทั้งหมด") */
export async function saveAllData(data: SheetsAllData): Promise<void> {
  if (!isConfigured()) {
    throw new Error("ยังไม่ได้ตั้งค่า APPS_SCRIPT_URL ใน client/src/lib/sheets-sync.ts");
  }
  const res = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action: "saveAll", data }),
  });
  if (!res.ok) throw new Error(`ซิงก์ข้อมูลไม่สำเร็จ (HTTP ${res.status})`);
  const json = await res.json();
  if (json.ok === false) throw new Error(json.error || "ซิงก์ข้อมูลไม่สำเร็จ");
}
