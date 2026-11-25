# Shopthai2026 V4.0 Member Staging
เพิ่มไฟล์ใหม่เท่านั้น ไม่ทับ CMS หรือหน้าแรกเดิม ใช้ Supabase project ทดสอบสมาชิกแยกจาก Production และ CMS (หากโควตาไม่พอ ให้หยุดก่อน)
1. สร้าง project shopthai2026-member-staging; เปิด Email provider และ Confirm email ตั้ง SMTP ตามความเหมาะสม
2. SQL Editor รัน sql/040_members.sql หนึ่งครั้ง แล้ว sql/041_audit.sql: RLS true และ anon_read/member_delete/change_owner false
3. Authentication URL Configuration: Site URL https://tummarat48.github.io/Shopthai2026-PRO/ และ Redirect URL https://tummarat48.github.io/Shopthai2026-PRO/member.html (เพิ่ม URL localhost เฉพาะทดสอบถ้าจำเป็น)
4. Google Cloud Console: ตั้ง OAuth consent screen, Web application OAuth client; Authorized redirect URI ใช้ callback URL ที่ Supabase Google provider แสดง (https://PROJECT.supabase.co/auth/v1/callback); ใส่ Client ID และ Client Secret ใน Supabase Authentication Google provider เท่านั้น เปิด provider และเพิ่ม test users หาก OAuth อยู่โหมด Testing
5. assets/member-config.js ใส่ URL และ publishable key ของ member staging เท่านั้น ห้ามใส่ secret/service_role
6. อัปโหลด member.html และไฟล์ assets/member* บน branch ทดสอบ เปิดผ่าน HTTP/HTTPS ไม่ใช่ file://; SQL ไม่จำเป็นต้องเผยแพร่ผ่าน Pages
7. สมัครด้วยอีเมล ยืนยันอีเมล เข้าสู่ระบบ แล้วกดบันทึกโปรไฟล์; Google ต้องกรอก username/phone เพิ่มหลัง login; email อยู่ใน auth.users ไม่ซ้ำใน profile
8. ทดสอบสองบัญชี: อ่าน/แก้ไขได้เฉพาะของตนเอง, anon อ่านไม่ได้, username ซ้ำต้องถูกปฏิเสธ, logout, recovery, Google. ตรวจสอบ SQL และ API จริงก่อนเปิดรับสมาชิกจริง
9. เมื่อผ่านแล้วเพิ่ม <a href="member.html">บัญชีสมาชิก</a> ใน nav ของหน้าเว็บเดิมด้วยมือ โดยไม่ทับ index.html ล่าสุด
ข้อจำกัด: ไม่รองรับ login ด้วย username/phone, ไม่มี OTP โทรศัพท์, รูปโปรไฟล์, admin manager, แพ็กเกจ หรือร้านค้าใน patch นี้; ไม่มี trigger สร้าง profile อัตโนมัติ ต้องกดบันทึกหลังยืนยันบัญชี; ยังไม่ได้ทดสอบ browser/SQL/OAuth จริง. ก่อนเปิดจริงต้องมีนโยบายความเป็นส่วนตัว การลบบัญชี การจำกัด abuse และทดสอบ RLS.
