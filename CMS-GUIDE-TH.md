# Shopthai2026 V3.0–V3.4

## ทดลองโดยไม่แตะ Production
1. แตก FULL ZIP ไปยัง F:\WEB_SERVER\sites\shopthai2026-v3 (โฟลเดอร์ใหม่) หรือแตก PATCH ทับสำเนา V2 เท่านั้น
2. สำคัญ: V2 assets/config.js เดิมชี้ Production อยู่ หากต้องการทดสอบแบบไม่ติดต่อ Production เลย ให้แก้สำเนาไฟล์นี้เป็น `window.SHOP_CONFIG={supabaseUrl:'',supabaseAnonKey:''};` ก่อนเปิดเว็บ ห้ามแก้ไฟล์จริงบน GitHub ในขั้นนี้
3. เปิด PowerShell ปกติ: `Set-Location 'F:\WEB_SERVER\sites\shopthai2026-v3'` แล้ว `py -m http.server 8090 --bind 127.0.0.1` (ต้องมี Python) หรือใช้ Caddy เดิมตั้ง root ไปที่สำเนาเท่านั้น
4. เปิด http://127.0.0.1:8090/admin-tools/customizer.html
5. ทดลองแก้ข้อความ สี URL ภาพ และ YouTube ID เช่น ID 11 ตัวจากลิงก์ watch?v=... เปิดส่วนวิดีโอในรายการจัดวาง ใช้ลูกศรขึ้นลงจัดลำดับ บันทึกร่างในเครื่องหรือส่งออก JSON
6. ส่งออก index.html เพื่อให้ข้อความ H1/Title/Description อยู่ใน HTML จริง ไฟล์นี้เป็น snapshot ไม่โหลด CMS สดอีก ให้เก็บต้นฉบับ V3 ไว้ก่อนแทนที่ และทดสอบก่อน commit

## Staging เท่านั้น
สร้าง Supabase project แยกจาก Production ตั้ง Auth และ admin_users ให้มี user_id UUID ของแอดมินจริง โดยผู้ใช้ทั่วไปอ่านได้เฉพาะแถวตัวเองและไม่มีสิทธิ์เขียน ตรวจสอบ RLS และ grants ก่อนติดตั้ง ไม่ต้องใช้ PostgreSQL Windows Service
รัน 031 audit ก่อนและหลัง 030; ตรวจสอบว่าไม่มี storage policy กว้างที่ให้ผู้ใช้ทั่วไปเขียน bucket ใหม่ หากพบให้หยุด ไม่แก้ policy เดิมโดยอัตโนมัติ
รัน 030 ครั้งเดียวใน SQL Editor ของ Staging (ไม่ใช่ PowerShell) แล้ว 032 ทดสอบแบบ rollback
แก้ assets/cms/settings.js เฉพาะ CMS_STAGING.url และ key เป็น Project URL และ sb_publishable_ ของ Staging ห้ามใส่ service role หรือ secret key โค้ดปฏิเสธ URL Production เดิม
เข้าสู่ระบบใน customizer ด้วยบัญชี Staging; เลือกภาพ JPG PNG WebP ไม่เกิน 5 MB แล้วอัปโหลด เลือกตำแหน่งและกดเผยแพร่ Staging เปิดหน้าแรกอีกแท็บเพื่อดูผล
รูปใน bucket เป็นสาธารณะทันทีที่อัปโหลด ห้ามอัปโหลดสลิปหรือข้อมูลส่วนตัว ไม่มีระบบลบภาพในรุ่นนี้
ทดสอบแอดมิน publish และ upload ได้ ผู้ใช้ทั่วไป publish/upload ไม่ได้ anonymous อ่านค่าที่เผยแพร่ได้ และไม่สามารถแก้ไขได้ ทดสอบผ่าน API/Storage จริงก่อนใช้ Production

## ข้อจำกัด
ร่างเก็บใน localStorage ของเบราว์เซอร์ ไม่ใช่ร่างบนเซิร์ฟเวอร์; ตัวแก้ไขเป็นข้อความธรรมดา ไม่รับ HTML อิสระ; จัดลำดับด้วยลูกศร ไม่ใช่ drag/drop; วิดีโอ YouTube เท่านั้น; preview ไม่โหลดสินค้าจริงหรือเล่นสคริปต์; การปรับแต่งใช้หน้าแรกเท่านั้น; ภาพที่อัปโหลดอาจเหลือแม้ไม่เผยแพร่; ไม่มี revision history; SEO dynamic ไม่รับประกัน indexing จึงมี static export; SQL และ browser ยังต้องทดสอบบน staging จริง
ไม่มีการเปลี่ยน config.js/app.js หรือฐานข้อมูลเดิมในแพ็กเกจ ไม่ได้เผยแพร่ GitHub Pages หรือแก้ Production อัตโนมัติ
