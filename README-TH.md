# Shopthai2026 Blogger A — คู่มือติดตั้ง (ชุดทดสอบ ไม่แก้ระบบจริง)

## ไฟล์
- `Shopthai2026-Blogger-A.xml` — ธีม Blogger พร้อมส่วนบทความและแค็ตตาล็อกสินค้า
- `assets/blogger-products.js` — อ่านสินค้าจาก Supabase REST API ด้วย public key, ค้นหาและกรองหมวดหมู่
- `sql/01_read_only_audit.sql` — ตรวจโครงสร้างและ RLS เท่านั้น ไม่แก้ข้อมูล

## ก่อนเริ่ม
1. สำรองธีม Blogger เดิม: Blogger > ธีม > สำรองข้อมูล
2. สำรองไฟล์ GitHub และตรวจว่าตาราง Supabase มีฟิลด์ `products`: `shopee_id,name,price,image_url,affiliate_url,category_slug,shop_name,is_featured,is_active,created_at`; `categories`: `slug,name,sort_order`
3. รัน SQL ตรวจสอบในไฟล์ `sql/01_read_only_audit.sql` และตรวจนโยบาย RLS ให้ `anon` อ่านเฉพาะสินค้าที่ `is_active=true` และหมวดหมู่สาธารณะได้ **อย่าปิด RLS** และอย่าให้ anon INSERT/UPDATE/DELETE สินค้า
4. ใส่ค่า public `publishableKey` หรือ legacy `anon` key ของโปรเจกต์เดิมในธีม XML ห้ามใส่ secret/service_role key

## ทดสอบแบบไม่แก้เว็บจริง (แนะนำ)
1. สร้างบล็อก Blogger **ใหม่สำหรับทดสอบ** ไม่ใช่บล็อกที่ใช้งานจริง
2. เนื่องจากธีมอ้างไฟล์ JS ที่ URL GitHub Pages ให้ทดสอบบน **repository/branch สำหรับทดลองที่เปิด GitHub Pages** แล้วเปลี่ยน `src` ใน XML ให้ชี้ URL ทดสอบนั้นก่อน หรือรอจนพร้อมเผยแพร่ไฟล์ JS ใหม่บน repo เดิม (ไม่ทับ app.js)
3. Blogger > ธีม > แก้ไข HTML / กู้คืนธีมจากไฟล์ XML; อัปโหลด `Shopthai2026-Blogger-A.xml` ไปยังบล็อกทดสอบ
4. เปิดหน้าเว็บทดสอบ ดู Developer Tools > Console/Network ถ้าโหลดสินค้าไม่ได้ ตรวจ URL, key, RLS, CORS และชื่อคอลัมน์
5. ทดสอบค้นหา กรองหมวดหมู่ ภาพสินค้า และลิงก์ซื้อ; ตรวจด้วยว่าหน้าบทความ Blogger ทำงาน

## วิธีใช้งานจริงหลังทดสอบผ่าน
1. เพิ่มไฟล์ `assets/blogger-products.js` ลง GitHub Pages repo เดิม (เป็นไฟล์ใหม่ ไม่ทับ `assets/app.js`)
2. เปลี่ยน public key ใน XML; ใช้ URL JS ที่เผยแพร่ได้จริง
3. สำรองธีม Blogger จริง แล้วนำเข้า XML ที่ผ่านการทดสอบ
4. เพิ่ม/แก้สินค้าใน Admin เดิมบน GitHub Pages; Blogger จะอ่านสินค้าใหม่เมื่อเปิด/รีเฟรชหน้า

## ระบบนับคลิก
ค่า `clickEndpoint` เริ่มต้นว่าง หมายถึง **ยังไม่ส่งสถิติคลิก** เพราะ Patch 03/04 อาจใช้ RPC/Edge Function ที่มีชื่อและรูปแบบ payload ต่างกัน ต้องตรวจ SQL และ API ที่ใช้งานจริงก่อนเชื่อมต่อ ห้ามเปิดตาราง click_events ให้ผู้เยี่ยมชมเขียนโดยตรง

หากมี Edge Function สำหรับรับ `POST {"shopee_id":"..."}` ที่ปลอดภัย มี rate limiting และรองรับ CORS แล้ว จึงกำหนด `clickEndpoint` เป็น HTTPS URL ภายใต้โดเมน Supabase เดิมได้ (เช่น `/functions/v1/<ชื่อฟังก์ชันจริง>`). โค้ดจะส่งแบบ best-effort ไม่ขัดขวางการเปิด Shopee; ไม่มีการรับประกันว่าทุกคลิกจะถูกนับ

## ข้อจำกัดและความปลอดภัย
- การอ่านข้อมูลจาก Browser ต้องอาศัย RLS เป็นตัวบังคับสิทธิ์; การกรอง `is_active` ใน URL ไม่ใช่กลไกความปลอดภัย
- คีย์ public สามารถมองเห็นได้ในซอร์ส HTML เป็นปกติ แต่ห้ามใส่ secret key
- URL Affiliate ที่แสดงปุ่มซื้อรองรับโดเมน `shopee.co.th`, `shopee.com`, `s.shopee.co.th` เท่านั้น; หากใช้โดเมน redirect ของ Shopee อื่น ให้ตรวจสอบและเพิ่มใน allowlist อย่างระมัดระวัง
- ธีมนี้แสดงสินค้าได้สูงสุด 100 รายการต่อครั้ง เป็นรุ่นเริ่มต้น ยังไม่มี pagination
- ยังไม่ได้ทดสอบนำเข้าธีมกับ Blogger หรือเชื่อม Supabase จริง; บางบล็อกอาจต้องปรับแต่ง widget ตามข้อกำหนดของ Blogger
- ไม่ได้แก้ไข Blogger, GitHub หรือ Supabase ของคุณ
