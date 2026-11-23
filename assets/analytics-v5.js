(() => { 'use strict';
const $=id=>document.getElementById(id), cfg=window.SHOP_CONFIG||{};
const status=t=>{$('status').textContent=t;};
if (!window.supabase || !cfg.supabaseUrl || !cfg.supabaseAnonKey) {status('ไม่พบ Supabase config');return;}
const db=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey);
const cell=(tr,v)=>{const td=document.createElement('td');td.textContent=String(v??'');tr.append(td);};
async function load(){
 const {data:{user},error:authError}=await db.auth.getUser();
 if(authError||!user){$('login').hidden=false;$('report').hidden=true;status('กรุณาเข้าสู่ระบบ');return;}
 const {data,error}=await db.rpc('affiliate_dashboard_v5');
 if(error){status('อ่านสถิติไม่ได้: '+error.message);$('report').hidden=true;return;}
 $('login').hidden=true;$('report').hidden=false;
 for(const k of ['today','last7','last30'])$(k).textContent=Number(data[k]||0).toLocaleString('th-TH');
 $('rows').replaceChildren();
 const rows=[...(data.top||[])].sort((a,b)=>b.clicks7-a.clicks7||b.clicks-a.clicks);
 for(const p of rows){const tr=document.createElement('tr');for(const v of [p.name||p.shopee_id,p.clicks7,p.clicks,p.blogger,p.github,p.clicks7>=10?'พิจารณาทำคลิป':'เก็บข้อมูลเพิ่ม'])cell(tr,v);$('rows').append(tr);}
 status('อัปเดตข้อมูลแล้ว • ยังไม่สามารถพิสูจน์ว่าเป็นคนจริงทั้งหมด');
}
$('login-form').addEventListener('submit',async e=>{e.preventDefault();const {error}=await db.auth.signInWithPassword({email:$('email').value,password:$('password').value});if(error){status(error.message);return;}await load();});
$('refresh').addEventListener('click',load);load();
})();