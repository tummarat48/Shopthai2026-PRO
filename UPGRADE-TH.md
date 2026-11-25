# Marketplace V2
อัปเดตหน้า public 5 หน้า เพิ่ม pricing.html, shops.html และ assets/marketplace.css; app.js เปลี่ยนเฉพาะการค้นหา/เรียงสินค้าในหน้า products.
สำรอง repository ก่อนอัปโหลด ทดสอบบน branch แยกก่อน merge. อัปโหลดไฟล์ภายในโฟลเดอร์ ไม่ใช่โฟลเดอร์ครอบ. ไม่ต้องแก้ config.js หรือ SQL.
ทดสอบหน้าแรก สินค้าจริง ค้นหา เรียงราคา หมวดหมู่ รายละเอียด รายการสนใจ Admin login และ analytics. การกดลิงก์ Affiliate อาจบันทึกคลิกจริง.
หน้าร้านสมาชิกและแพ็กเกจเป็นหน้าข้อมูลเท่านั้น noindex; ยังไม่เปิดสมัครหรือชำระเงิน. รายการสินค้าจำกัดตามโค้ดเดิม 500 รายการ.
Checkpoint PostgreSQL: 025F-3E-6E ผ่านตามผลตรวจเดิม; กลับมาที่ 025F-3F startup test; service stopped/disabled. ไม่แก้ production.
