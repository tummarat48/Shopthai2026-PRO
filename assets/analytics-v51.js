/* Test dashboard; public anon/publishable key only, admin login via Supabase Auth. */
(()=>{'use strict';
const cfg=window.SHOP_CONFIG||{};
const $=id=>document.getElementById(id);
const status=s=>{$('status').textContent=s};
const sup=window.supabase;
if(!sup||!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(cfg.supabaseUrl||'')||!cfg.supabaseAnonKey){status('กรุณาตั้งค่า assets/config.js ด้วย URL และ public key ของโปรเจกต์ทดสอบ');return;}
const db=sup.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey);
const num=x=>Number(x||0).toLocaleString('th-TH');
const cell=(tr,value)=>{const td=document.createElement('td');td.textContent=String(value??'');tr.append(td)};
async function load(){
 status('กำลังตรวจสอบสิทธิ์...');
 const {data:{user},error:ue}=await db.auth.getUser();if(ue||!user){status('กรุณาเข้าสู่ระบบแอดมินก่อน');return;}
 const {data:admin,error:ae}=await db.from('admin_users').select('user_id').eq('user_id',user.id).maybeSingle();
 if(ae||!admin){status('บัญชีนี้ไม่มีสิทธิ์แอดมิน');return;}
 const [d,r]=await Promise.all([db.rpc('affiliate_click_dashboard_v51'),db.rpc('affiliate_promotion_recommendations_v51')]);
 if(d.error||r.error){status('โหลดรายงานไม่สำเร็จ: '+(d.error?.message||r.error?.message));return;}
 const a=d.data||{}; $('today').textContent=num(a.today);$('last7').textContent=num(a.last7);$('last30').textContent=num(a.last30);
 $('sources').replaceChildren();(a.sources||[]).forEach(s=>{const tr=document.createElement('tr');cell(tr,s.source);cell(tr,num(s.clicks));$('sources').append(tr)});
 $('top').replaceChildren();(a.top||[]).forEach((p,i)=>{const tr=document.createElement('tr');[i+1,p.name,p.shopee_id,num(p.clicks),num(p.last7)].forEach(v=>cell(tr,v));$('top').append(tr)});
 $('recommendations').replaceChildren();(r.data||[]).forEach(p=>{const tr=document.createElement('tr');[p.name,p.shopee_id,num(p.clicks30),num(p.clicks7),num(p.score),p.recommendation,p.max_per_minute>=10?'ตรวจสอบคลิกพุ่ง':'—'].forEach(v=>cell(tr,v));$('recommendations').append(tr)});
 status('รายงาน V5 เท่านั้น — ไม่รวมข้อมูลเก่า และไม่ใช่ยอดขายจริง');
}
$('login').addEventListener('submit',async e=>{e.preventDefault();const {error}=await db.auth.signInWithPassword({email:$('email').value,password:$('password').value});if(error){status(error.message);return;}await load()});
$('refresh').addEventListener('click',()=>load().catch(e=>status(e.message)));
$('logout').addEventListener('click',async()=>{await db.auth.signOut();status('ออกจากระบบแล้ว')});
load().catch(e=>status(e.message));
})();
