# รายงานวิเคราะห์สูตร Pizza Recipes และแนวทางคำนวณต้นทุนสำหรับ Pizza / Homemade Bake

## 1. ขอบเขตการวิเคราะห์

ผมเข้าถึง Google Drive และพบโฟลเดอร์ชื่อ **pizza recipes picture** ซึ่งตรงกับคำค้น `pizza recipes` โดยมีไฟล์ภาพ JPEG ทั้งหมด 16 รายการ แต่มีภาพซ้ำตามค่า checksum อยู่ 2 คู่ จึงมีภาพเนื้อหาไม่ซ้ำประมาณ 14 รายการ ภาพส่วนใหญ่เป็น screenshot แนวตั้งจาก Pinterest หรือเว็บบนมือถือ จึงต้องอ่านจากภาพที่แบ่งเป็นช่วงสำหรับภาพยาวมาก

> **สถานะข้อมูล:** รายงานนี้แยกชัดเจนระหว่าง “ข้อมูลที่อ่านได้จากภาพ” กับ “ข้อมูลที่ต้องชั่งหรือยืนยันในครัว” ภาพจาก Pinterest ใช้เป็นต้นแบบสูตรได้ แต่ไม่ควรถือว่าปริมาณและผลผลิตเป็นมาตรฐานจริงจนกว่าจะทดสอบ

ภาพที่พบครอบคลุมคู่มือคำนวณต้นทุน สูตรซอส พิซซ่า pepperoni, seafood, mushroom, Neapolitan และสูตรแป้งหลายแบบ ยังไม่พบภาพสูตร bagel โดยตรง ดังนั้น bagel ควรเป็นโมดูลถัดไปที่ใช้โครงสร้างเดียวกับ dough/batch ของพิซซ่า

## 2. ข้อสรุปหลักที่ควรใช้กับเว็บไซต์

ระบบไม่ควรคิดพิซซ่าเป็นรายการวัตถุดิบแบน ๆ เพียงชุดเดียว เพราะสูตรจริงมีหลายชั้น ได้แก่ แป้งที่ผสมและหมักก่อน ซอสที่ปรุงหรือเคี่ยวก่อน ท็อปปิงที่อาจต้องผัด/ลวก/ปอก/ต้ม และขั้นตอนประกอบเป็นพิซซ่าหนึ่งชิ้น

โครงสร้างที่ถูกต้องควรเป็น:

```text
วัตถุดิบ AP
  → สูตรย่อย / Batch เช่น Dough, Sauce, Prepared Topping
    → ผลผลิตหลังทำจริง เช่น กรัม, มิลลิลิตร, ก้อน, ชิ้น
      → ต้นทุนต่อหน่วยของสูตรย่อย
        → Finished Product เช่น Pizza / Bagel / Bake
          → Portion Cost → Food Cost % → ราคาขาย → Contribution / Gross Profit
```

แนวคิดนี้สอดคล้องกับหลัก recipe costing ที่ให้คำนวณ standard portion cost จากต้นทุนส่วนประกอบหารด้วยจำนวน portion และกำหนด yield ของสูตรอย่างชัดเจน [3]

## 3. ข้อมูลสูตรที่อ่านได้จากภาพ

### 3.1 Classic Pepperoni Pizza

ภาพ 06 ระบุข้อมูลต่อ 1 พิซซ่า ดังนี้

| ส่วนประกอบ | ปริมาณจากภาพ | วิธีนำเข้าในระบบ |
|---|---:|---|
| Pizza dough | 250 g | อ้างอิง Dough Batch และตัดต้นทุน 250 g |
| Tomato sauce | 120 g | อ้างอิง Tomato Sauce Batch ที่มี yield หลังทำ |
| Mozzarella cheese | 150 g | วัตถุดิบหรือ cheese portion โดยตรง |
| Pepperoni | 80–100 g | ต้องกำหนด standard portion เช่น 90 g และเก็บช่วง tolerance แยก |
| Olive oil | 1 tbsp | ชั่ง/แปลงเป็นกรัมหรือมิลลิลิตรตามหน่วยมาตรฐาน |
| Dried oregano | 1/2 tsp | แปลงเป็นกรัมจากฉลากหรือการชั่งจริง |
| Salt / black pepper | ตามชอบ | ไม่ควรปล่อยเป็นศูนย์ในต้นทุน ควรกำหนด standard pinch หรือ gram |

ภาพเดียวกันระบุ Dough Batch เป็น all-purpose flour 500 g, warm water 300 ml, yeast 5 g, sugar 1 tsp, salt 10 g และ olive oil 2 tbsp ส่วน Tomato Sauce ระบุ crushed tomato 400 g, minced garlic 1 tsp, olive oil 1 tbsp, salt ตามชอบ, sugar 1/2 tsp และ dried oregano 1/2 tsp

ข้อสังเกตคือภาพไม่ได้ระบุว่า Dough Batch ได้กี่ก้อนหรือเหลือโดว์กี่กรัมหลังพัก ดังนั้น **250 g เป็นปริมาณใช้ต่อพิซซ่า แต่ยังไม่ใช่ข้อมูล yield ของ batch** ต้องชั่งจริงก่อนอนุมัติสูตร

### 3.2 Classic Seafood Pizza

ภาพ 07 ระบุข้อมูลต่อ 1 พิซซ่า ดังนี้

| ส่วนประกอบ | ปริมาณจากภาพ | จุดตรวจสอบสำคัญ |
|---|---:|---|
| Pizza dough | 250 g | ใช้ Dough Batch เดียวกับ pepperoni ได้ถ้าสไตล์เดียวกัน |
| Tomato sauce | 120 g | ใช้ Sauce Batch ที่ผ่าน yield test |
| Mozzarella | 150 g | วัตถุดิบหลัก |
| Shrimp peeled/deveined | 100 g | เป็น EP/processed แล้ว ต้องแยกจากน้ำหนักซื้อทั้งเปลือก |
| Calamari rings | 100 g | ตรวจ yield หลังทำความสะอาด |
| Cooked mussels | 80 g | ต้องกำหนดว่าเป็นเนื้อหอยหลังสุก/แกะเปลือกหรือไม่ |
| Garlic | 1 tsp | ตั้ง standard gram |
| Olive oil | 1 tbsp | ตั้ง standard ml หรือ gram |
| Fresh parsley | 2 tbsp | ชั่งจริงเพื่อไม่ให้ต้นทุนตกหล่น |
| Salt / black pepper | ตามชอบ | กำหนด standard portion |

Seafood ไม่ควรคิดจากราคาซื้อ AP โดยตรง เพราะภาพระบุ shrimp ที่ปอกและผ่าหลังแล้ว และ mussels ที่ cooked แล้ว ระบบควรมี Seafood Preparation Batch หรือ yield test รายชนิด

### 3.3 Authentic Neapolitan Pizza

ภาพ 08 ระบุว่าเสิร์ฟ 2–3 คน และใช้ pizza dough, San Marzano tomato sauce 1/2 cup, fresh mozzarella buffalo 125 g, basil หนึ่งกำมือ, extra virgin olive oil 1–2 tbsp และเกลือตามชอบ

ภาพเดียวกันให้ Dough Batch ที่ **ทำได้ 2 dough balls** ได้แก่ all-purpose flour 500 g, warm water 325 ml, salt 10 g, instant yeast 2 g และ olive oil 1 tbsp วิธีทำมี first rise 1–2 ชั่วโมง แบ่งและพัก 4–6 ชั่วโมง หรือแช่เย็น 24 ชั่วโมง

ระบบควรบันทึกเป็น Dough Batch ผลผลิต 2 ก้อน แล้ว Finished Product ใช้ 1 ก้อนต่อพิซซ่า ดังนั้นถ้าต้นทุน batch เท่ากับ `B` บาท และได้ 2 ก้อนเท่ากัน ต้นทุน dough ต่อพิซซ่าเริ่มต้นคือ `B ÷ 2` แต่ถ้าน้ำหนักก้อนไม่เท่ากัน ให้คิดตามกรัมจริงแทนการหารเท่ากัน

### 3.4 สูตรแป้งหลายแบบ

ภาพ 09 และ 10 มีสูตรหลายเวอร์ชัน ซึ่ง **ไม่ควรนำมารวมเป็นสูตรเดียว** เพราะตัวเลขต่างกัน

| สูตร/ภาพ | ข้อมูลที่อ่านได้ |
|---|---|
| Classic Pizza Dough, ภาพ 10 | AP flour 315 g, instant yeast 2 tsp, salt 1 tsp, olive oil 1 tbsp, warm water 240 ml |
| Neapolitan Pizza Dough, ภาพ 10 | 00 flour 250 g, warm water 180 ml, instant yeast 1/4 tsp, salt 1 tsp |
| Whole Wheat Pizza Dough, ภาพ 10 | whole wheat flour 250 g, instant yeast 1/4 tsp, salt 1 tsp, olive oil 1 tbsp, warm water 240 ml |
| Thin Crust Pizza Dough, ภาพ 10 | AP flour 315 g, instant yeast 2 tsp, salt 1 tsp, olive oil 1 tbsp, warm water 180 ml |
| Classic Pizza Dough, ภาพ 09 | flour 3¾ cups, warm water 1¼ cups, oil 2 tbsp, sugar 1 tbsp, salt 1 tsp, dry yeast 1 packet |
| Neapolitan Pizza Dough, ภาพ 09 | flour 3¾ cups, warm waterอ่านไม่ชัด, salt 2 tsp, dry yeast 1/4 tsp optional |
| Thin Crust, ภาพ 09 | flour 2¼ cups, warm water 1/4 cup, oil 2 tbsp, sugar 1 tsp, salt 1 tsp, dry yeast 1 packet |
| Deep Dish, ภาพ 09 | flour 3½ cups, warm water 1/4 cup, olive oil 1/4 cup, melted butter 4 tbsp, sugar 1 tbsp, salt 1¼ tsp, dry yeast 1 packet |
| Stuffed Crust, ภาพ 09 | flour 3¼ cups, warm water 1¾ cups, oil 2 tbsp, sugar 1 tbsp, salt 1 tsp, dry yeast 1 packet, mozzarella sticks สำหรับยัดขอบ |

เวอร์ชันเดียวกันที่มีค่าต่างกันควรสร้างเป็น **Recipe Version A / Version B** แล้วระบุแหล่งที่มาและสถานะ “ยังไม่ยืนยัน” แทนการเลือกตัวเลขใดตัวเลขหนึ่งโดยไม่มีหลักฐาน

### 3.5 สูตรซอส

ภาพ 05 มีซอส 6 แบบ ได้แก่ Classic Tomato, Garlic White, Spicy Arrabbiata, Pesto, Vodka และ BBQ Pizza Sauce ส่วนภาพ 11 มี Red, White และ Spicy Peri Peri Sauce ซึ่งปริมาณต่างจากภาพ 05

ตัวอย่าง Red Pizza Sauce จากภาพ 11 ระบุ crushed tomatoes 2 cups, olive oil 3 tbsp, garlic 2 cloves, oregano 1 tsp, basil 1 tsp, sugar 1 tsp, salt 1/2 tsp, black pepper 1/4 tsp และ red pepper flakes 1/2 tsp พร้อม simmer 15–20 นาที

ตัวอย่าง White Pizza Sauce ระบุ butter 2 tbsp, flour 1 tbsp, heavy cream 1 cup, milk 1/2 cup, garlic 4 cloves, Parmesan 1/2 cup, Italian herbs 1/2 tsp, salt 1/4 tsp และ black pepper 1/4 tsp พร้อม cook until thickened

**ข้อเสนอ:** สร้างทุกซอสเป็น sub-recipe คนละรายการ และเก็บ source/version แยกกัน เพราะสูตรภาพ 05 กับ 11 ไม่ใช่สูตรเดียวกัน แม้ชื่อใกล้กัน

## 4. สูตรคำนวณที่ถูกต้องสำหรับระบบ

### 4.1 ต้นทุนวัตถุดิบต่อหน่วย

```text
AP Unit Cost = ราคาซื้อสุทธิ ÷ ปริมาณที่ซื้อ
Ingredient Line Cost = AP Unit Cost × ปริมาณที่ใช้
```

ระบบควรเก็บหน่วยมาตรฐานเป็น g, kg, ml, L และ piece โดยแปลงก่อนคำนวณ ไม่ควรคูณราคาต่อกิโลกรัมกับกรัมโดยตรงโดยไม่แปลงหน่วย

### 4.2 Yield Test

```text
EP Weight = AP Weight − Waste / Trim
Yield % = EP Weight ÷ AP Weight × 100
EP Unit Cost = AP Unit Cost ÷ Yield ในรูปทศนิยม
```

ตัวอย่างเชิงโครงสร้าง ถ้าซื้อกุ้งทั้งเปลือก 1,000 g แล้วได้กุ้งปอกพร้อมใช้ 700 g Yield = 70% หาก AP cost เท่ากับ 280 บาทต่อกิโลกรัม EP cost = 280 ÷ 0.70 = 400 บาทต่อกิโลกรัมของกุ้งพร้อมใช้

หากมี cooking loss ต้องแยก yield อีกขั้น:

```text
Cooking Yield % = น้ำหนักหลังปรุง ÷ น้ำหนักก่อนปรุง × 100
Total Yield % = น้ำหนักพร้อมเสิร์ฟ ÷ น้ำหนัก AP × 100
```

### 4.3 Sub-recipe / Batch Cost

```text
Batch Cost = ผลรวมต้นทุนวัตถุดิบและส่วนประกอบใน batch
Cost per Batch Unit = Batch Cost ÷ Actual Batch Yield
```

ตัวอย่าง: ซอส batch ต้นทุน 210 บาท เคี่ยวแล้วเหลือ 650 g

```text
Cost per gram = 210 ÷ 650 = 0.3231 บาทต่อกรัม
Sauce cost on pizza = 0.3231 × 120 = 38.77 บาท
```

การใช้ **Actual Batch Yield หลังทำจริง** สำคัญกว่าการใช้ปริมาณรวมก่อนปรุง เพราะซอสมีการระเหยและสูตรครีมมีการข้น

### 4.4 Dough / Bagel ด้วย Baker’s Percentage

Baker’s Percentage กำหนดแป้งเป็น 100% และคำนวณวัตถุดิบอื่นเทียบกับน้ำหนักแป้ง [1] [2]

```text
Baker % = น้ำหนักวัตถุดิบ ÷ น้ำหนักแป้ง × 100
Hydration % = น้ำหนักน้ำ ÷ น้ำหนักแป้ง × 100
Desired Ingredient Weight = Baker % ÷ 100 × น้ำหนักแป้งเป้าหมาย
Total Dough Weight = ผลรวมวัตถุดิบทั้งหมด
Dough Ball Weight = Total Dough Weight ÷ จำนวนก้อน
```

สำหรับ Neapolitan จากภาพ 08 แป้ง 500 g และน้ำ 325 g ทำให้ hydration เบื้องต้นเท่ากับ 65% สูตรนี้ทำได้ 2 dough balls จึงควรตรวจว่าน้ำหนักโดว์รวมจริงใกล้ 837 g หรือมีการสูญเสียระหว่างผสม/ติดภาชนะ แล้วบันทึกน้ำหนักก้อนจริง

### 4.5 Finished Pizza Cost

```text
Finished Pizza Cost = Dough Portion
                    + Sauce Portion
                    + Cheese Portion
                    + Topping Portions
                    + Oil / Seasoning
                    + Packaging ถ้ากำหนดให้รวม
```

ต้นทุนของซอสหรือ topping ที่เป็น batch ต้องดึงจาก cost per g/ml/piece ของสูตรย่อย ไม่ควรนำต้นทุนวัตถุดิบของ batch มาบวกซ้ำทั้งก้อนในพิซซ่าหนึ่งชิ้น

### 4.6 ราคาขายและกำไร

```text
Food Cost % = Food Cost per Pizza ÷ Selling Price × 100
Suggested Price = Food Cost per Pizza ÷ Target Food Cost %
Gross Profit / Contribution = Selling Price − Food Cost − ค่าใช้จ่ายผันแปรที่เลือกให้รวม
```

คำว่า **Net Profit** ควรใช้เมื่อรวมค่าแรง ค่าไฟ ค่าเช่า ค่าธรรมเนียม delivery ภาษี และค่าใช้จ่ายอื่นครบแล้วเท่านั้น แบบฟอร์มในภาพ 03 ใช้คำว่า Net Profit แต่เว็บควรแสดงเป็น Gross Profit หรือ Contribution ก่อน เพื่อไม่ให้ตีความเกินข้อมูลที่มี

## 5. โมเดลข้อมูลที่ควรใช้ในเว็บไซต์

| Entity | ฟิลด์สำคัญ | ตัวอย่าง |
|---|---|---|
| Ingredient | ชื่อ, category, AP unit, ราคา, supplier, วันที่ราคา, allergen | 00 flour, 250 บาท/กก. |
| Yield Test | AP weight, trim, cooked weight, yield stage, วันที่ทดสอบ | shrimp 1,000 g → EP 700 g |
| Recipe | ชื่อ, type, version, source, method, status | Classic Tomato Sauce v1 |
| Recipe Line | ingredient/sub-recipe, quantity, unit, baker %, cost | crushed tomato 400 g |
| Batch | recipe id, batch yield, yield unit, actual output, loss | Sauce batch 650 g |
| Dough Formula | flour weight, hydration, salt %, yeast %, target dough weight, ball count | Neapolitan 65% hydration |
| Finished Product | dough portion, sauce portion, toppings, bake notes | Pepperoni Pizza 1 ชิ้น |
| Cost Snapshot | ราคาที่ใช้คำนวณ ณ วันที่, total cost, cost/portion | snapshot ณ วันที่บันทึก |
| Allergen / Label | gluten, milk, nuts, egg, seafood, alcohol | Pizza seafood: milk, seafood, gluten |

### กฎสำคัญของโมเดล

สูตรหนึ่งรายการต้องมี `recipe_type` อย่างน้อย 4 ค่า ได้แก่ `dough`, `sauce`, `prepared_topping` และ `finished_product` ส่วน `batch_yield` ต้องมีหน่วยเสมอ เช่น g, ml, ball หรือ piece

Finished product ควรอ้างอิง recipe ย่อยด้วย `recipe_component_id` และ quantity ที่ใช้จริง เช่น sauce component 120 g ไม่ควร copy รายการซอสมาทั้งชุด เพราะจะทำให้ต้นทุนซ้ำและแก้สูตรยาก

## 6. หน้าจอที่ควรเพิ่มในเว็บไซต์

### หน้า 1: Recipe Library

ให้ผู้ใช้เลือกประเภทสูตร ได้แก่ Dough, Sauce, Prepared Topping, Finished Product และ Bagel/Bake พร้อมแสดงสถานะ `Draft`, `Tested`, `Approved` และวันที่ต้นทุนล่าสุด

### หน้า 2: Sub-recipe Builder

ใช้สร้าง Dough หรือ Sauce Batch โดยมี input วัตถุดิบ ปริมาณ หน่วย วิธีทำ น้ำหนักก่อนทำ น้ำหนักหลังทำ และ batch yield ระบบแสดงต้นทุนรวมและต้นทุนต่อ g/ml/ball ทันที

### หน้า 3: Baker’s Math

ใช้กับ pizza dough และ bagel โดยให้กรอก flour target หรือ desired dough weight แล้วคำนวณน้ำ เกลือ ยีสต์ น้ำมัน และ starter ตาม Baker’s Percentage พร้อมแสดง hydration และ total dough weight

### หน้า 4: Finished Pizza Builder

เลือก dough base, sauce base, cheese, toppings และปริมาณต่อพิซซ่า ระบบรวมต้นทุนจากสูตรย่อยและแสดง calculation trail:

```text
Dough 250 g → Sauce 120 g → Cheese 150 g → Topping 90 g → Bake / Package → Final Cost
```

### หน้า 5: Yield & Waste Test

บันทึกน้ำหนัก AP, waste, EP raw, EP cooked, จำนวน portion และหมายเหตุการเตรียม เพื่อให้ระบบคำนวณ Yield แยกตามขั้นตอนและไม่ใช้ค่าประมาณที่ไม่มีหลักฐาน

### หน้า 6: Method / Label / Allergen

เก็บขั้นตอนเตรียม, หมัก, เคี่ยว, อบ, อุณหภูมิ, เวลา, อายุการเก็บ, allergen และข้อมูลฉลาก เพราะแบบฟอร์มในภาพ 03 ชี้ว่าข้อมูล production และ labeling สำคัญพอ ๆ กับตัวเลขต้นทุน

## 7. แนวทางเริ่มต้นที่แนะนำ

ควรเริ่มจากสูตรที่มีข้อมูลครบที่สุดก่อน คือ **Classic Pepperoni Pizza** และ **Classic Seafood Pizza** เพราะภาพ 06 และ 07 ระบุปริมาณต่อ 1 พิซซ่า พร้อมแยก Dough และ Tomato Sauce แล้ว จากนั้นสร้าง sub-recipe สองรายการ ได้แก่ Basic Dough Batch และ Classic Tomato Sauce Batch แล้วกำหนดน้ำหนักผลผลิตจริงจากการทดลองในครัว

หลังจากนั้นจึงเพิ่ม **Neapolitan Pizza** โดยใช้ dough batch ที่ทำได้ 2 ก้อน และเพิ่ม Baker’s Percentage / hydration เป็นฟังก์ชันหลัก ส่วนซอสหลายแบบจากภาพ 05 และ 11 ควรนำเข้าเป็น library พร้อม versioning แต่ยังไม่ควร auto-approve เพราะเป็นสูตรคนละชุดและยังไม่มี actual batch yield

สำหรับ Homemade Bake และ Bagel ให้ใช้ architecture เดียวกัน โดยเปลี่ยน finished product จาก Pizza เป็น Bagel หรือ Bake และเพิ่มข้อมูล shaping, boil/poach, topping, bake loss และ final baked weight

## 8. สิ่งที่ต้องยืนยันก่อนนำตัวเลขไปใช้จริง

| ประเด็น | เหตุผล |
|---|---|
| น้ำหนักโดว์รวมหลังผสมและหลังหมัก | ใช้คำนวณต้นทุนต่อก้อนอย่างถูกต้อง |
| จำนวน dough balls และน้ำหนักต่อก้อน | ภาพบางสูตรบอกจำนวนก้อน แต่บางสูตรไม่บอก |
| น้ำหนักซอสหลังเคี่ยว | ป้องกันต้นทุนต่อกรัมต่ำกว่าความจริง |
| น้ำหนักชีสและท็อปปิงต่อพิซซ่า | ช่วยควบคุม portion และ food cost |
| Yield ของกุ้ง ปลาหมึก และหอย | AP กับ EP ต่างกันมากและมี cooking loss |
| หน่วยถ้วย/ช้อน | ต้องชั่งจริงหรือมี conversion policy เดียวกัน |
| อุณหภูมิและเวลาอบ | เกี่ยวข้องกับ cooking loss และคุณภาพ ไม่ควรใช้เพื่อเดาต้นทุนโดยตรง |
| ค่าไฟ เตาอบ แรงงาน และบรรจุภัณฑ์ | ต้องกำหนดว่าจะรวมใน Food Cost, Contribution หรือ Operating Cost |
| สูตร version ที่เลือก | ภาพ 05/09/10/11 มีสูตรหลายเวอร์ชันที่ตัวเลขต่างกัน |
| Allergen และ labeling | จำเป็นสำหรับผลิตภัณฑ์ Homemade ที่ขายจริง โดยเฉพาะ gluten, milk, nuts และ seafood |

## 9. ข้อสรุปเชิงผลิตภัณฑ์

เว็บไซต์ปัจจุบันมีแกนคำนวณ Food Cost ต่อจานแล้ว แต่สำหรับพิซซ่าและงาน Homemade ควรเปลี่ยนจาก “Ingredient Table” เป็น **Recipe Costing Workspace แบบหลายชั้น** โดยให้ผู้ใช้สร้างสูตรย่อยก่อน แล้วนำสูตรย่อยไปประกอบเป็นสินค้าสำเร็จรูป

ลำดับการพัฒนาที่เหมาะสมคือเพิ่ม `recipe_type`, `batch_yield`, `cost_per_batch_unit`, `baker_percentage`, `hydration`, `version`, `yield_test` และ `allergen` ก่อน จากนั้นจึงทำหน้า Finished Product Builder และรายงานต้นทุนตามเวอร์ชัน การทำเช่นนี้จะช่วยให้ระบบรองรับพิซซ่า เบเกิล ขนมปัง และงานอบ Homemade โดยไม่ต้องเขียนสูตรใหม่แยกกันทุกประเภท

## References

[1]: https://www.kingarthurbaking.com/pro/reference/bakers-percentage "King Arthur Baking — Baker’s Percentage"

[2]: https://nicoletcollege.pressbooks.pub/culinarymath/back-matter/bakers-percentage/ "Nicolet College — Bakers Percentage and Recipe Scaling"

[3]: https://psu.pb.unizin.org/hmd329/chapter/ch7/ "Pennsylvania State University — Chapter 7: Recipe and Menu Costing"
