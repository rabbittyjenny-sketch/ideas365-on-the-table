# บันทึกการถอดข้อมูลจากภาพสูตรอาหาร

## ภาพ 01: Food Costing Calculation Guide

ภาพนี้เป็นคู่มือคำนวณต้นทุนอาหารทั่วไป ไม่ใช่สูตรพิซซ่าโดยตรง แต่เป็นโครงสร้างพื้นฐานที่ควรนำมาใช้กับสูตรพิซซ่าแบบหลายขั้นตอน

### ส่วนที่อ่านได้ชัดเจน

| ลำดับ | หัวข้อ | สูตร/แนวคิดที่เห็นในภาพ |
|---|---|---|
| 1 | Ingredient Cost | ราคาซื้อ ÷ ปริมาณซื้อ × ปริมาณที่ใช้ โดยภาพยกตัวอย่างไก่ 10 กก. ราคา 60 ดอลลาร์ ใช้ 250 กรัม |
| 2 | Total Recipe Cost | ผลรวมต้นทุนวัตถุดิบทุกบรรทัด |
| 3 | Cost per Portion | Total Recipe Cost ÷ จำนวน Portion |
| 4 | Food Cost Percentage | Cost per Portion ÷ Selling Price × 100 |
| 5 | Selling Price | Portion Cost ÷ Target Food Cost % ในรูปทศนิยม เช่น 3 ÷ 0.30 = 10 ดอลลาร์ |
| 6 | Gross Profit | Selling Price − Food Cost |
| 7 | Gross Profit Percentage | Gross Profit ÷ Selling Price × 100 |
| 8 | Yield Cost Calculation | Yield % = น้ำหนักที่ใช้ได้ ÷ น้ำหนักซื้อ × 100 |
| 9 | Edible Portion Cost | Purchase Cost ÷ Yield ในรูปทศนิยม เช่น 10 ÷ 0.80 = 12.50 ต่อกิโลกรัม |

### ประเด็นที่ต้องแก้เมื่อนำไปใช้กับระบบจริง

สูตรในภาพเป็นฐานการคำนวณระดับเมนู แต่พิซซ่าและงานอบต้องเพิ่มชั้นของ **Sub-recipe / Batch** เช่น ซอสที่ปรุงได้หลายถ้วย แป้งโดว์ที่หมักแล้วแบ่งเป็นหลายก้อน และท็อปปิงที่เตรียมเป็น batch ก่อนนำไปประกอบต่อหนึ่งชิ้น

ต้องแยกต้นทุนของส่วนประกอบตามผลผลิตหลังทำจริง เช่น ซอส 1 batch ต้นทุน 180 บาท ผลผลิตหลังเคี่ยว 600 กรัม ต้นทุนต่อกรัมคือ 180 ÷ 600 = 0.30 บาท/กรัม จากนั้นเมื่อใช้ซอส 45 กรัมบนพิซซ่า ต้นทุนซอสในจานคือ 0.30 × 45 = 13.50 บาท ไม่ควรนำราคาวัตถุดิบดิบของมะเขือเทศหรือเครื่องปรุงมาใส่ในจานโดยตรงซ้ำอีกครั้ง

## สิ่งที่ต้องตรวจสอบต่อจากภาพสูตรพิซซ่า

1. ชื่อสูตรและประเภท: dough, sauce, topping, filling, glaze หรือ finished product
2. หน่วยและน้ำหนักก่อน/หลังการปรุงหรือหมัก
3. ผลผลิตของแต่ละ batch เช่น กรัมรวม จำนวนก้อน หรือจำนวนชิ้น
4. ปริมาณที่ใช้ต่อพิซซ่าหรือผลิตภัณฑ์หนึ่งชิ้น
5. Yield จากการตัดแต่ง การเคี่ยว การอบ และการสูญเสียน้ำ
6. ต้นทุนบรรจุภัณฑ์และพลังงานที่ต้องการรวมแยกจาก Food Cost หรือไม่

## ภาพ 13: 17 Mushroom Pizza

ภาพส่วนต้นระบุชื่อหน้าเว็บ/สูตรว่า **17 Mushroom Pizza** และเห็นภาพพิซซ่าหน้าเห็ดกับน้ำมันทรัฟเฟิลบนแป้งอบ ภาพที่อ่านได้ในสอง tile แรกยังเป็นบทนำของสูตร ไม่พบตารางปริมาณวัตถุดิบที่ชัดเจน จึงยังไม่ควรเดาปริมาณเห็ด ชีส หรือ truffle oil จากภาพอาหาร

การนำสูตรนี้เข้าระบบควรจัดเป็น **Finished Product Recipe** ที่อ้างอิง sub-recipes อย่างน้อยสองส่วน ได้แก่ Dough Base และ Mushroom Topping / Mushroom Preparation หากเห็ดถูกผัดหรืออบเพื่อลดน้ำก่อนวางบนพิซซ่า ต้องสร้าง batch ย่อยสำหรับเห็ดผัดและใช้ผลผลิตหลังผัดเป็นฐานคำนวณ ไม่ใช้ราคาซื้อเห็ดสดคูณปริมาณเสิร์ฟโดยตรง

## ภาพ 05: 6 Homemade Pizza Sauce Recipes

ภาพนี้เป็นชุดสูตรซอส 6 แบบ และควรนำเข้าระบบเป็น **Sub-recipe Library** ไม่ใช่ใส่เป็นวัตถุดิบของพิซซ่าโดยตรง

| สูตรซอส | วัตถุดิบและปริมาณที่อ่านได้จากภาพ | ข้อจำกัดที่ต้องยืนยัน |
|---|---|---|
| Classic Tomato Pizza Sauce | canned crushed tomatoes 800 g, olive oil 2 tbsp, garlic cloves minced 2, dried oregano 1 tsp, salt 1 tsp, black pepper 1/2 tsp | ยังไม่ระบุผลผลิตหลังปรุงและน้ำหนักต่อการใช้หนึ่งพิซซ่า |
| Garlic White Pizza Sauce | butter 2 tbsp, minced garlic 3 cloves, all-purpose flour 2 tbsp, milk 1 cup, Parmesan cheese 1/2 cup, salt & pepper | ต้องชั่งผลผลิตหลังทำ เพราะการเคี่ยวทำให้น้ำหนักลด และ Parmesan มีต้นทุนสูง |
| Spicy Arrabbiata Pizza Sauce | crushed tomatoes 800 g, olive oil 2 tbsp, minced garlic 3 cloves, red chili flakes 1 tsp, salt 1 tsp | ต้องยืนยันผลผลิตและการสูญเสียน้ำหลังเคี่ยว |
| Pesto Pizza Sauce | fresh basil leaves 2 cups, Parmesan 1/2 cup, pine nuts 1/2 cup, garlic cloves 2, olive oil 1/2 cup | หน่วยถ้วยของใบโหระพาและถั่วต้องแปลงเป็นกรัมเพื่อความสม่ำเสมอ |
| Vodka Pizza Sauce | olive oil 2 tbsp, minced garlic 2 cloves, crushed tomatoes 800 g, vodka 1/4 cup, heavy cream 1/2 cup | ต้องกำหนดว่าต้นทุนสุราและครีมรวมใน Food Cost หรือไม่ และชั่งผลผลิตหลังเคี่ยว |
| BBQ Pizza Sauce | barbecue sauce 1 cup, ketchup 2 tbsp, honey 1 tbsp, smoked paprika 1 tsp | มีลักษณะเป็นการผสม sub-recipe มากกว่าการปรุงยาว แต่ยังต้องกำหนดผลผลิตเป็นกรัมหรือมิลลิลิตร |

### วิธีนำเข้าระบบ

แต่ละซอสควรมี Batch Yield เช่น ผลผลิตหลังทำ 650 กรัม และต้นทุนรวม batch 210 บาท ระบบจึงคำนวณต้นทุนต่อกรัม = 210 ÷ 650 = 0.3231 บาท/กรัม หากพิซซ่าใช้ซอส 55 กรัม ต้นทุนซอสในพิซซ่าคือ 17.77 บาท สูตรซอสต้องเก็บวิธีทำ เวลาเคี่ยว และน้ำหนักก่อน/หลังปรุง เพื่อให้ต้นทุนตรวจสอบย้อนกลับได้

ภาพเป็น infographic จาก Pinterest จึงควรใช้เป็นแหล่งตั้งต้นเท่านั้น ไม่ควรถือว่าหน่วยถ้วย ช้อนโต๊ะ หรือผลผลิตเป็นค่ามาตรฐานจนกว่าจะทดสอบและชั่งจริงในครัว

## ภาพ 09: Pizza Doughs – Part 8

ภาพนี้มีสูตรแป้ง 5 แบบ โดยอ่านได้ดังนี้

| สูตรแป้ง | ส่วนประกอบที่ระบุในภาพ | ประเด็นคำนวณ |
|---|---|---|
| Classic Pizza Dough | Flour 3¾ cups, warm water 1¼ cups, oil 2 tbsp, sugar 1 tbsp, salt 1 tsp, 1 packet dry yeast | ต้องแปลง cup/tbsp/tsp เป็นกรัมหรือมิลลิลิตร และชั่งน้ำหนักโดว์รวมหลังผสม |
| Neapolitan Pizza Dough | Flour 3¾ cups (00 flour if possible), warm water, salt 2 tsp, ¼ tsp dry yeast (optional) | ปริมาณน้ำในภาพอ่านไม่ชัด ต้องขอชั่ง/ยืนยันก่อนใช้เป็นสูตรจริง |
| Thin Crust Pizza Dough | Flour 2¼ cups, warm water ¼ cup, olive oil 2 tbsp, sugar 1 tsp, salt 1 tsp, 1 packet dry yeast | ต้องตรวจความสมเหตุสมผลของ hydration เพราะน้ำที่อ่านได้อาจเป็นภาพย่อหรือหน่วยอ่านคลาดเคลื่อน |
| Deep Dish Pizza Dough | Flour 3½ cups, warm water ¼ cup, olive oil ¼ cup, melted butter 4 tbsp, sugar 1 tbsp, salt 1¼ tsp, 1 packet dry yeast | ต้องแยกสูตรนี้เป็น dough style ที่มีไขมันและผลผลิตต่างจากแป้งบาง |
| Stuffed Crust Pizza Dough | Flour 3¼ cups, warm water 1¾ cups, olive oil 2 tbsp, sugar 1 tbsp, salt 1 tsp, 1 packet dry yeast, mozzarella sticks for stuffing crust | mozzarella sticks เป็นองค์ประกอบของ finished product ไม่ควรรวมไว้ในต้นทุน dough base ถ้าจะใช้แป้งเดียวกับหน้าอื่น |

### วิธีคำนวณแป้ง

ควรคำนวณเป็น **Dough Batch** โดยเก็บน้ำหนักโดว์รวมหลังผสม/หมัก และจำนวนก้อนที่แบ่งได้จริง เช่น batch ต้นทุน 96 บาท น้ำหนักโดว์หลังหมัก 1,200 กรัม แบ่งได้ 4 ก้อน ก้อนละ 300 กรัม ต้นทุนต่อกรัม = 96 ÷ 1,200 = 0.08 บาท และต้นทุน dough ต่อพิซซ่า = 300 × 0.08 = 24 บาท

## ภาพ 11: Red, White และ Spicy Pizza Sauce

ภาพนี้ระบุสูตรพร้อมวิธีทำแบบย่อชัดเจนกว่า infographic บางภาพ

| ซอส | ส่วนประกอบที่อ่านได้ | วิธีทำ/ผลต่อ Yield |
|---|---|---|
| Red Pizza Sauce (Classic Tomato) | crushed tomatoes 2 cups, olive oil 3 tbsp, garlic 2 cloves, dried oregano 1 tsp, dried basil 1 tsp, sugar 1 tsp, salt 1/2 tsp, black pepper 1/4 tsp, red pepper flakes 1/2 tsp | Simmer 15–20 minutes; ต้องชั่งน้ำหนักหลังเคี่ยว |
| White Pizza Sauce (Creamy Garlic) | butter 2 tbsp, flour 1 tbsp, heavy cream 1 cup, milk 1/2 cup, garlic 4 cloves, grated Parmesan 1/2 cup, dried Italian herbs 1/2 tsp, salt 1/4 tsp, black pepper 1/4 tsp | Cook until thickened; ต้องใช้ yield หลังข้น ไม่ใช้ปริมาตรก่อนปรุง |
| Spicy Pizza Sauce (Peri Peri Style) | crushed tomatoes 2 cups, olive oil 2 tbsp, chopped onions 1/2 cup, garlic 3 cloves, peri peri sauce 2 tbsp, smoked paprika 1 tsp, chili flakes 1/2 tsp, cayenne pepper 1/2 tsp, vinegar 1 tsp, salt 1/2 tsp, sugar 1 tsp | Simmer 15–20 minutes; onion และน้ำระเหยทำให้ yield เปลี่ยน |

ภาพ 09 และ 11 มีหน่วยถ้วย/ช้อนเป็นหลัก จึงควรเก็บทั้ง **หน่วยตามสูตรต้นฉบับ** และ **น้ำหนักมาตรฐานที่ชั่งจริง** ในระบบ พร้อมสถานะว่า “ยังไม่ได้ยืนยันน้ำหนัก” เพื่อป้องกันการนำตัวเลขจากภาพไปใช้เป็นต้นทุนจริงโดยไม่มีการทดสอบ

## ภาพ 08: Authentic Neapolitan Pizza

ภาพนี้เป็นตัวอย่างสูตรพิซซ่าสำเร็จรูปที่มีทั้ง finished product และ dough sub-recipe ในภาพเดียวกัน

### ข้อมูลที่อ่านได้

| ส่วน | ข้อมูล |
|---|---|
| ผลผลิต | Serves 2–3; prep 20 min; cook 60–90 sec |
| ส่วนประกอบบนพิซซ่า | pizza dough, San Marzano tomato sauce 1/2 cup, fresh mozzarella (buffalo) 125 g / 4 oz, fresh basil leaves 1 handful, extra virgin olive oil 1–2 tbsp, salt to taste |
| Dough sub-recipe | Makes 2 dough balls: all-purpose flour 500 g (4 cups), warm water 325 ml (1⅓ cups), salt 10 g (2 tsp), instant yeast 2 g (1/2 tsp), olive oil 1 tbsp |
| ขั้นตอนสำคัญ | ผสมและนวด 8–10 นาที, first rise 1–2 ชั่วโมง, divide เป็น 2 ลูก, พัก 4–6 ชั่วโมง หรือแช่เย็น 24 ชั่วโมง |
| การอบ | เตาอบร้อนมากประมาณ 250–280°C / 480–540°F และอบบน pizza stone/steel ตามภาพ |

### วิธีนำเข้าระบบ

ควรสร้าง Dough Batch ผลผลิต 2 ก้อน แล้วให้ finished pizza ใช้ dough ball 1 ก้อน ดังนั้นต้นทุน dough ต่อพิซซ่า = ต้นทุน batch ÷ 2 หากมีการสูญเสียติดโถหรือ scrap ต้องบันทึกน้ำหนัก dough ที่แบ่งได้จริง ไม่ใช้เพียง “ทำได้ 2 ลูก” หากน้ำหนักไม่เท่ากัน

Sauce 1/2 cup และ mozzarella 125 g เป็นปริมาณต่อ finished pizza แต่ sauce ยังต้องอ้างอิง batch recipe และ actual yield หากมีการปรุงหรือเคี่ยวก่อน

## ภาพ 10: 4 Types of Pizza Dough

ภาพนี้ให้สูตรแป้ง 4 แบบพร้อมน้ำหนักบางรายการ

| สูตร | ข้อมูลที่อ่านได้ |
|---|---|
| Classic Pizza Dough | all-purpose flour 2½ cups (315 g), instant yeast 2 tsp, salt 1 tsp, olive oil 1 tbsp, warm water 1 cup (240 ml) |
| Neapolitan Pizza Dough | 00 flour 2 cups (250 g), warm water ¾ cup (180 ml), instant yeast ¼ tsp, salt 1 tsp |
| Whole Wheat Pizza Dough | whole wheat flour 2 cups (250 g), instant yeast ¼ tsp, salt 1 tsp, olive oil 1 tbsp, warm water 1 cup (240 ml) |
| Thin Crust Pizza Dough | all-purpose flour 2½ cups (315 g), instant yeast 2 tsp, salt 1 tsp, olive oil 1 tbsp, warm water ¾ cup (180 ml) |

ภาพ 08 และ 10 มีข้อมูลน้ำหนักบางส่วนที่ใช้เป็น baseline ได้ดีกว่าภาพที่ให้เฉพาะถ้วย แต่ยังต้องทดสอบจริงเรื่องน้ำหนักหลังผสม การแบ่งก้อน และน้ำหนักหลังอบ เพราะ hydration, flour brand และเวลาหมักทำให้ yield และน้ำหนักที่ขายได้เปลี่ยน

## หลักการสากลที่ค้นคว้าเพิ่ม

### Baker’s Percentage

King Arthur Baking และ Nicolet College อธิบายตรงกันว่า Baker’s Percentage กำหนดน้ำหนักแป้งเป็น 100% และแสดงวัตถุดิบอื่นเป็นเปอร์เซ็นต์ของน้ำหนักแป้ง เช่น น้ำ 325 กรัมต่อแป้ง 500 กรัม = hydration 65% [1] [2] วิธีนี้เหมาะกับ dough, bagel และขนมปัง เพราะใช้หน่วยน้ำหนักเดียว ทำให้ scale สูตรขึ้นลงและตรวจสอบ hydration ได้ง่าย

สูตรหลักคือ:

```text
Baker % = น้ำหนักวัตถุดิบ ÷ น้ำหนักแป้ง × 100
Hydration % = น้ำหนักน้ำ ÷ น้ำหนักแป้ง × 100
น้ำหนักวัตถุดิบเมื่อ scale = Baker % ÷ 100 × น้ำหนักแป้งเป้าหมาย
```

เมื่อมี preferment เช่น poolish หรือ starter ระบบควรมีสองมุมมอง คือสูตรย่อยตาม batch และ Overall Baker’s Percentage ที่รวมแป้ง น้ำ และยีสต์จาก preferment กลับเข้ากับสูตรหลัก เพื่อไม่ให้ hydration และ baker percentage ถูกตีความผิด [1]

### Yield และ EP Cost

Pennsylvania State University ระบุว่า standard portion cost ต้องคำนวณจากต้นทุนวัตถุดิบของสูตรหารด้วยจำนวน portion และ professional recipe ควรระบุ yield เสมอ [3] การทำ Yield Test ต้องบันทึกน้ำหนัก AP, น้ำหนัก waste/trim, น้ำหนัก EP และคำนวณ EP ÷ AP × 100 จากนั้น EP Cost = AP Cost ÷ Yield ในรูปทศนิยม [3]

### Batch / Sub-recipe

สำหรับพิซซ่าและงานอบ ระบบควรคิดตามลำดับนี้:

```text
Ingredient AP cost → Sub-recipe batch cost → Batch yield → Cost per g/ml/ball → Finished product portion cost
```

ตัวอย่างเชิงโครงสร้าง: Dough Batch มีต้นทุนรวม 96 บาท ผลผลิต 1,200 กรัม แบ่งเป็น 4 dough balls จึงมีต้นทุน 0.08 บาท/กรัม หรือ 24 บาทต่อก้อน 300 กรัม ส่วน Sauce Batch มีต้นทุน 210 บาท ผลผลิตหลังเคี่ยว 650 กรัม จึงมีต้นทุน 0.3231 บาท/กรัม ถ้าใช้ซอส 55 กรัมบนพิซซ่า ต้นทุนซอสคือ 17.77 บาท

### แหล่งอ้างอิง

[1] King Arthur Baking, Baker’s Percentage: https://www.kingarthurbaking.com/pro/reference/bakers-percentage
[2] Nicolet College, Bakers Percentage: https://nicoletcollege.pressbooks.pub/culinarymath/back-matter/bakers-percentage/
[3] Pennsylvania State University, Chapter 7 – Recipe and Menu Costing: https://psu.pb.unizin.org/hmd329/chapter/ch7/

## ภาพ 06: Classic Pepperoni Pizza

ภาพระบุปริมาณต่อ 1 พิซซ่าและแยก Pizza Dough กับ Tomato Sauce ไว้ชัดเจน

| ส่วน | ปริมาณที่อ่านได้ |
|---|---|
| Finished pizza | Pizza dough 250 g, tomato sauce 120 g, mozzarella 150 g, pepperoni slices 80–100 g, olive oil 1 tbsp, dried oregano 1/2 tsp, salt/black pepper ตามชอบ |
| Pizza Dough basic | all-purpose flour 500 g, warm water 300 ml, yeast 5 g (1 tsp), sugar 1 tsp, salt 10 g (2 tsp), olive oil 2 tbsp |
| Tomato Sauce classic | crushed tomato 400 g, minced garlic 1 tsp, olive oil 1 tbsp, salt ตามชอบ, sugar 1/2 tsp, dried oregano 1/2 tsp |
| Process | เตรียมและพักแป้ง 1 ชั่วโมง, ขึ้นรูป, ใส่ซอส ชีส pepperoni เครื่องปรุง แล้วอบที่ 250°C–280°C ประมาณ 8–10 นาที |

ข้อสำคัญคือภาพระบุ dough 250 g ต่อพิซซ่า แต่สูตร dough batch ไม่ได้ระบุว่าได้กี่ก้อน จึงต้องชั่งน้ำหนัก dough รวมและจำนวนก้อนจริงก่อนใช้เป็นต้นทุนมาตรฐาน Pepperoni มีช่วง 80–100 g จึงควรเลือก standard portion เดียว เช่น 90 g และบันทึกเป็น tolerance แยกต่างหาก ไม่ปล่อยให้สูตรต้นทุนใช้ช่วงโดยไม่กำหนดค่ากลาง

## ภาพ 07: Classic Seafood Pizza

| ส่วน | ปริมาณที่อ่านได้ |
|---|---|
| Finished pizza | Pizza dough 250 g, tomato sauce 120 g, mozzarella 150 g, peeled/deveined shrimp 100 g, calamari rings 100 g, cooked mussels 80 g, minced garlic 1 tsp, olive oil 1 tbsp, fresh parsley 2 tbsp, salt/black pepper ตามชอบ |
| Dough และ sauce | ใช้สูตร basic dough และ classic tomato sauce แบบเดียวกับภาพ 06 |
| Process | เตรียมแป้ง ขึ้นรูป ใส่ซอสและชีส เติม seafood และสมุนไพร แล้วอบที่ 250°C–280°C ประมาณ 8–10 นาที |

Seafood ควรมีการตรวจสอบ yield แยกตามรายการ เช่น กุ้งก่อน/หลังปอกและผ่าหลัง ปลาหมึกก่อน/หลังทำความสะอาด และหอยก่อน/หลังสุก/แกะเปลือก เพราะภาพระบุ shrimp peeled/deveined และ mussels cooked แล้ว จึงเป็น EP หรือ processed ingredient ไม่ใช่ AP ตรง ๆ

ถ้าทะเลถูกผัดหรือปรุงก่อนวางบนพิซซ่า ต้องสร้าง seafood preparation batch แยกจาก finished pizza และใช้ต้นทุนต่อกรัมหลังเตรียมจริง เพื่อไม่ให้คิดต้นทุนจากน้ำหนักซื้อซ้ำกับน้ำหนักที่เสิร์ฟ

## ภาพ 02 และ 03: แบบฟอร์มต้นทุน

ภาพ 02 เป็น Recipe Cost Template ที่มี Recipe Information ได้แก่ วันที่ ชื่อสูตร จำนวนผลผลิต และราคา พร้อมตาราง Item, Quantity Measurement, Unit Cost และ Total Cost จุดที่ควรนำมาใช้คือ **วันที่ราคา, จำนวนผลผลิต, หน่วยวัด และต้นทุนต่อรายการ** แต่ต้องแก้ตัวอย่างให้ใช้หน่วยและตัวเลขที่สอดคล้องกัน เพราะ template บางบรรทัดดูเป็นตัวอย่างประกอบ ไม่ใช่ข้อมูลที่ควรนำไปคำนวณจริง

ภาพ 03 แบ่งข้อมูลเป็น Estimated Sales Price, Total Cost, Cost Margin, Net Profit, Primary Ingredients, Secondary Ingredients, Preparation Steps และ Allergens and Labelling Info โครงสร้างนี้เหมาะกับเว็บเวอร์ชัน Homemade มาก โดยควรปรับคำดังนี้:

- **Primary ingredients:** แป้ง ซอส ชีส และวัตถุดิบหลักที่อยู่ในสูตร
- **Secondary ingredients:** น้ำมัน เครื่องปรุง สมุนไพร บรรจุภัณฑ์ และ garnish
- **Preparation steps:** ขั้นตอนเตรียม sub-recipe และขั้นตอนประกอบ finished product
- **Allergens:** กลูเตน นม ถั่ว ไข่ หรือ seafood ตามสูตรจริง
- **Net profit:** ไม่ควรคำนวณเป็นกำไรสุทธิจนกว่าจะรวมแรงงาน ค่าไฟ ค่าเช่า ค่าธรรมเนียม และค่าใช้จ่ายอื่น ควรใช้คำว่า Contribution / Gross Profit หากยังหักเฉพาะต้นทุนวัตถุดิบ

แบบฟอร์มทั้งสองช่วยยืนยันว่าเครื่องมือควรมีทั้ง **ตัวเลขต้นทุน** และ **ข้อมูลการผลิต/การกำกับสูตร** ไม่ใช่มีเพียงช่อง ingredient กับราคาขายเท่านั้น
