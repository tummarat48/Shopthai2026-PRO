(async()=>{
'use strict';const $=id=>document.getElementById(id), msg=t=>{$('status').textContent=t}, c=window.MEMBER_CONFIG||{};
if(!/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(c.url||'')||!c.key||!window.supabase){msg('ยังไม่ได้ตั้งค่า Member Staging');return;}
const db=window.supabase.createClient(c.url,c.key,{auth:{storageKey:'shopthai-member-v4',persistSession:true,detectSessionInUrl:true}}), redirect=location.origin+location.pathname;
let user=null, recovering=false;
const show=(id)=>{for(const x of ['guest','account','recovery'])$(x).hidden=x!==id;};
const check=({data,error})=>{if(error)throw error;return data;};
async function refresh(){const r=await db.auth.getUser();user=r.data?.user||null;if(recovering){show('recovery');return;}if(!user){show('guest');msg('สมัครสมาชิกหรือเข้าสู่ระบบ');return;}show('account');$('email').textContent=user.email||'';const p=check(await db.from('member_v4_profiles').select('username,phone').eq('user_id',user.id).maybeSingle());$('profile').elements.username.value=p?.username||user.user_metadata?.username||'';$('profile').elements.phone.value=p?.phone||user.user_metadata?.phone||'';msg(p?'เข้าสู่ระบบสำเร็จ':'กรุณาบันทึกชื่อผู้ใช้และเบอร์โทรเพื่อสร้างโปรไฟล์');}
function action(el,fn,event='click'){el.addEventListener(event,async e=>{e.preventDefault();const buttons=[...document.querySelectorAll('button')];buttons.forEach(b=>b.disabled=true);try{await fn();}catch(err){msg('ดำเนินการไม่สำเร็จ: '+(err.message||'กรุณาลองใหม่'));}finally{buttons.forEach(b=>b.disabled=false);}});}
const fields=id=>Object.fromEntries(new FormData($(id)));
action($('signup'),async()=>{const {email,password,username,phone}=fields('signup');const r=check(await db.auth.signUp({email,password,options:{emailRedirectTo:redirect,data:{username,phone}}}));$('signup').reset();if(r.session)await refresh();else msg('หากสมัครสำเร็จ โปรดตรวจสอบอีเมลเพื่อยืนยันบัญชี');},'submit');
action($('login'),async()=>{check(await db.auth.signInWithPassword(fields('login')));$('login').reset();await refresh();},'submit');
action($('google'),async()=>{check(await db.auth.signInWithOAuth({provider:'google',options:{redirectTo:redirect}}));});
action($('forgot'),async()=>{const e=$('login').elements.email;if(!e.reportValidity())return;check(await db.auth.resetPasswordForEmail(e.value,{redirectTo:redirect}));msg('หากมีบัญชีที่ตรงกัน โปรดตรวจสอบอีเมล');});
action($('profile'),async()=>{if(!user)throw Error('กรุณาเข้าสู่ระบบ');const p=fields('profile');check(await db.from('member_v4_profiles').upsert({user_id:user.id,username:p.username,phone:p.phone},{onConflict:'user_id'}));msg('บันทึกโปรไฟล์สำเร็จ');},'submit');
action($('logout'),async()=>{check(await db.auth.signOut({scope:'local'}));await refresh();});
action($('reset'),async()=>{check(await db.auth.updateUser({password:fields('reset').password}));recovering=false;$('reset').reset();await refresh();},'submit');
db.auth.onAuthStateChange((event)=>{if(event==='PASSWORD_RECOVERY'){recovering=true;show('recovery');msg('กรุณาตั้งรหัสผ่านใหม่');}});
try{await db.auth.getSession();await refresh();}catch(e){msg('ตรวจสอบบัญชีไม่สำเร็จ: '+e.message);}
})();
