/* Shopthai2026: static multi-page frontend + Supabase backend */
const C=window.SHOP_CONFIG||{}, ready=!!(C.supabaseUrl?.startsWith('https://')&&C.supabaseAnonKey&&!C.supabaseAnonKey.startsWith('YOUR_'));
const db=ready&&window.supabase?window.supabase.createClient(C.supabaseUrl,C.supabaseAnonKey):null;
const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const qs=new URLSearchParams(location.search);const fallback='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="#fff1e9"/><text x="50%" y="50%" font-size="24" fill="#c85b35" text-anchor="middle">Shopthai2026</text></svg>');
const money=v=>'฿'+Number(v||0).toLocaleString('th-TH',{maximumFractionDigits:2});
function notice(t){const el=$('#message');if(el){el.textContent=t;el.classList.remove('hidden')}}
function image(p){const url=p.image_url?.trim();return url||('images/'+encodeURIComponent(p.shopee_id)+'.jpg')}
function setImages(){document.querySelectorAll('img[data-fallback]').forEach(im=>im.addEventListener('error',()=>{if(im.src!==fallback)im.src=fallback},{once:true}))}
function card(p){return `<article class="card product"><a href="product.html?id=${encodeURIComponent(p.shopee_id)}"><img data-fallback src="${esc(image(p))}" alt="${esc(p.name)}" loading="lazy"><h3>${esc(p.name)}</h3></a><div class="price">${money(p.price)}</div><p class="muted">${esc(p.shop_name)}</p><div class="row"><a class="btn" href="${esc(safeLink(p.affiliate_url))}" data-affiliate-click="${esc(p.shopee_id)}" target="_blank" rel="noopener noreferrer sponsored nofollow">ซื้อที่ Shopee</a><button class="btn secondary" data-cart="${esc(p.shopee_id)}">+ สนใจ</button></div></article>`}
function safeLink(v){try{const u=new URL(v);return u.protocol==='https:'?'https://'+u.host+u.pathname+u.search+u.hash:'#'}catch{return '#'}}
function cart(){try{return JSON.parse(localStorage.getItem('shop-cart')||'[]')}catch{return []}}
function addCart(id){const c=cart();if(!c.includes(id))c.push(id);localStorage.setItem('shop-cart',JSON.stringify(c));alert('เพิ่มในรายการที่สนใจแล้ว')}
// Best-effort click event: native link navigation is never delayed by analytics.
// Supabase RPC is public but only inserts a validated active product ID; no PII is sent.
function trackAffiliateClick(shopeeId){
  if(!ready||!shopeeId)return;
  const key=String(shopeeId);
  // Prevent accidental repeated double-clicks in one tab (not fraud prevention).
  const k='shop-click-'+key, now=Date.now();
  try{if(now-Number(sessionStorage.getItem(k)||0)<1500)return;sessionStorage.setItem(k,String(now))}catch{}
  const endpoint=C.supabaseUrl.replace(/\/$/,'')+'/rest/v1/rpc/record_affiliate_click';
  fetch(endpoint,{method:'POST',keepalive:true,headers:{'Content-Type':'application/json','apikey':C.supabaseAnonKey,'Authorization':'Bearer '+C.supabaseAnonKey},body:JSON.stringify({p_shopee_id:key})}).catch(()=>{});
}
document.addEventListener('click',e=>{
  const a=e.target.closest('a[data-affiliate-click]');
  if(a&&safeLink(a.href)!=='#')trackAffiliateClick(a.dataset.affiliateClick);
});
document.addEventListener('click',e=>{const b=e.target.closest('[data-cart]');if(b)addCart(b.dataset.cart)});
async function list(table,filter){if(!db)throw Error('กรุณาตั้งค่า Supabase ใน assets/config.js ก่อน');let q=db.from(table).select('*');if(filter)q=filter(q);const {data,error}=await q;if(error)throw error;return data||[]}
async function getProducts(){return list('products',q=>q.eq('is_active',true).order('created_at',{ascending:false}).limit(500))}
async function renderStore(){const page=document.body.dataset.page;try{if(page==='home'){const [products,promos]=await Promise.all([getProducts(),list('promotions',q=>q.order('created_at',{ascending:false}))]);$('#products').innerHTML=(products.filter(p=>p.is_featured).length?products.filter(p=>p.is_featured):products).slice(0,12).map(card).join('')||'ยังไม่มีสินค้า';$('#promos').innerHTML=promos.map(p=>`<div class="card"><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p>${p.link_url?`<a class="btn" href="${esc(safeLink(p.link_url))}" target="_blank" rel="noopener noreferrer sponsored">ดูโปรโมชั่น</a>`:''}</div>`).join('')||'ยังไม่มีโปรโมชั่น'}
if(page==='categories'){const [cats,products]=await Promise.all([list('categories',q=>q.order('sort_order')),getProducts()]);$('#categories').innerHTML=cats.map(c=>`<a class="card" href="products.html?category=${encodeURIComponent(c.slug)}"><h3>${esc(c.name)}</h3><p class="muted">${products.filter(p=>p.category_slug===c.slug).length} สินค้า</p></a>`).join('')}
if(page==='products'){const [cats,products]=await Promise.all([list('categories',q=>q.order('sort_order')),getProducts()]);const sel=$('#category');sel.innerHTML='<option value="">ทุกหมวดหมู่</option>'+cats.map(c=>`<option value="${esc(c.slug)}">${esc(c.name)}</option>`).join('');sel.value=qs.get('category')||'';const run=()=>{const term=$('#search').value.trim().toLowerCase(),cat=sel.value;$('#products').innerHTML=products.filter(p=>(!cat||p.category_slug===cat)&&(!term||p.name.toLowerCase().includes(term)||p.shopee_id.includes(term))).map(card).join('')||'<p>ไม่พบสินค้า</p>';setImages()};$('#search').value=qs.get('q')||'';$('#search').oninput=run;sel.onchange=run;run()}
if(page==='product'){const id=qs.get('id');const products=await getProducts(),p=products.find(x=>x.shopee_id===id);if(!p){notice('ไม่พบสินค้านี้');return}$('#detail').innerHTML=`<img data-fallback src="${esc(image(p))}" alt="${esc(p.name)}"><div><span class="pill">${esc(p.category_slug||'สินค้า')}</span><h1>${esc(p.name)}</h1><p class="price">${money(p.price)}</p><p>${esc(p.description)}</p><p class="muted">ร้านค้า: ${esc(p.shop_name)} | ยอดขาย: ${esc(p.sold_text)}</p><a class="btn" href="${esc(safeLink(p.affiliate_url))}" data-affiliate-click="${esc(p.shopee_id)}" target="_blank" rel="noopener noreferrer sponsored nofollow">ไปซื้อที่ Shopee</a> <button class="btn secondary" data-cart="${esc(p.shopee_id)}">เพิ่มในรายการที่สนใจ</button></div>`}
if(page==='cart'){const products=await getProducts();const run=()=>{$('#cart').innerHTML=cart().map(id=>{const p=products.find(x=>x.shopee_id===id);return p?`<div class="card row" style="justify-content:space-between"><a href="product.html?id=${encodeURIComponent(id)}">${esc(p.name)}</a><strong>${money(p.price)}</strong><a class="btn" href="${esc(safeLink(p.affiliate_url))}" data-affiliate-click="${esc(p.shopee_id)}" target="_blank" rel="noopener noreferrer sponsored">Shopee</a><button class="btn danger" data-remove="${esc(id)}">ลบ</button></div>`:''}).join('')||'ยังไม่มีสินค้าที่สนใจ'};$('#cart').addEventListener('click',e=>{const b=e.target.closest('[data-remove]');if(b){localStorage.setItem('shop-cart',JSON.stringify(cart().filter(x=>x!==b.dataset.remove)));run()}});run()}
setImages()}catch(e){notice(e.message)}}
let adminUser=null;
async function requireAdmin(){if(!db){notice('ตั้งค่า assets/config.js ก่อน');return false}const {data:{user}}=await db.auth.getUser();if(!user){$('#login').classList.remove('hidden');$('#dashboard').classList.add('hidden');return false}const {data,error}=await db.from('admin_users').select('user_id').eq('user_id',user.id).maybeSingle();if(error||!data){notice('บัญชีนี้ยังไม่ได้รับสิทธิ์แอดมิน');await db.auth.signOut();$('#login').classList.remove('hidden');return false}adminUser=user;$('#login').classList.add('hidden');$('#dashboard').classList.remove('hidden');return true}
async function initAdmin(){if(!db){notice('ตั้งค่า assets/config.js ก่อน');return}$('#loginForm').onsubmit=async e=>{e.preventDefault();const {error}=await db.auth.signInWithPassword({email:$('#email').value,password:$('#password').value});if(error)return notice(error.message);if(await requireAdmin())await loadAdmin()};$('#logout').onclick=async()=>{await db.auth.signOut();location.reload()};if(await requireAdmin())await loadAdmin()}
let adminProducts=[],adminCategories=[],adminPromos=[];
async function loadAdmin(){try{[adminProducts,adminCategories,adminPromos]=await Promise.all([list('products',q=>q.order('created_at',{ascending:false}).limit(1000)),list('categories',q=>q.order('sort_order')),list('promotions',q=>q.order('created_at',{ascending:false}))]);$('#stats').textContent=`สินค้า ${adminProducts.length} รายการ | หมวดหมู่ ${adminCategories.length} | โปรโมชั่น ${adminPromos.length}`;$('#pCategory').innerHTML='<option value="">ไม่ระบุ</option>'+adminCategories.map(c=>`<option value="${esc(c.slug)}">${esc(c.name)}</option>`).join('');renderAdminTables();await loadClickDashboard();await loadPromotionRecommendations()}catch(e){notice(e.message)}}
function renderAdminTables(){$('#productRows').innerHTML=adminProducts.map(p=>`<tr><td>${esc(p.shopee_id)}</td><td>${esc(p.name).slice(0,110)}</td><td>${money(p.price)}</td><td>${p.is_active?'แสดง':'ซ่อน'}</td><td><button class="btn secondary" data-edit="${esc(p.id)}">แก้ไข</button> <button class="btn danger" data-delete="${esc(p.id)}">ลบ</button></td></tr>`).join('');$('#categoryRows').innerHTML=adminCategories.map(c=>`<tr><td>${esc(c.slug)}</td><td>${esc(c.name)}</td><td><button class="btn secondary" data-cat-edit="${esc(c.id)}">แก้ไข</button> <button class="btn danger" data-cat-delete="${esc(c.id)}">ลบ</button></td></tr>`).join('');$('#promoRows').innerHTML=adminPromos.map(p=>`<tr><td>${esc(p.title)}</td><td>${p.is_active?'แสดง':'ซ่อน'}</td><td><button class="btn secondary" data-promo-edit="${esc(p.id)}">แก้ไข</button> <button class="btn danger" data-promo-delete="${esc(p.id)}">ลบ</button></td></tr>`).join('')}
async function write(table,record,id){const q=id?db.from(table).update(record).eq('id',id):db.from(table).insert(record);const {error}=await q;if(error)throw error}
async function del(table,id){if(!confirm('ยืนยันการลบรายการนี้?'))return;const {error}=await db.from(table).delete().eq('id',id);if(error)throw error;await loadAdmin()}
function fillForm(form,data){for(const el of form.elements){if(!el.name)continue;if(el.type==='checkbox')el.checked=!!data[el.name];else el.value=data[el.name]??''}}
async function upload(file,id){if(!file)return null;if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024)throw Error('รองรับ JPG/PNG/WebP ไม่เกิน 5MB');const ext=({ 'image/jpeg':'jpg','image/png':'png','image/webp':'webp'})[file.type];const path=`${String(id).replace(/[^a-zA-Z0-9_-]/g,'_')}-${crypto.randomUUID()}.${ext}`;const {error}=await db.storage.from('product-images').upload(path,file,{contentType:file.type,upsert:false});if(error)throw error;return db.storage.from('product-images').getPublicUrl(path).data.publicUrl}
function formData(f){const o=Object.fromEntries(new FormData(f).entries());for(const el of f.querySelectorAll('input[type=checkbox]'))o[el.name]=el.checked;delete o.photo;delete o.promo_photo;delete o.id;return o}
document.addEventListener('click',async e=>{if(!adminUser)return;try{const edit=e.target.closest('[data-edit]'),remove=e.target.closest('[data-delete]'),ce=e.target.closest('[data-cat-edit]'),cd=e.target.closest('[data-cat-delete]'),pe=e.target.closest('[data-promo-edit]'),pd=e.target.closest('[data-promo-delete]');if(edit){fillForm($('#productForm'),adminProducts.find(p=>p.id===edit.dataset.edit));$('#productId').value=edit.dataset.edit;$('#productForm').scrollIntoView()}if(remove)await del('products',remove.dataset.delete);if(ce){fillForm($('#categoryForm'),adminCategories.find(c=>c.id===ce.dataset.catEdit));$('#categoryId').value=ce.dataset.catEdit}if(cd)await del('categories',cd.dataset.catDelete);if(pe){fillForm($('#promoForm'),adminPromos.find(p=>p.id===pe.dataset.promoEdit));$('#promoId').value=pe.dataset.promoEdit}if(pd)await del('promotions',pd.dataset.promoDelete)}catch(err){notice(err.message)}});
function initForms(){for(const [formId,table,idField] of [['productForm','products','productId'],['categoryForm','categories','categoryId'],['promoForm','promotions','promoId']]){$('#'+formId).onsubmit=async e=>{e.preventDefault();try{const f=e.target,id=$('#'+idField).value||null,data=formData(f);if(table==='products'){data.price=Number(data.price||0);data.old_price=data.old_price?Number(data.old_price):null;data.category_slug=data.category_slug||null;const file=f.querySelector('[name=photo]').files[0];if(file)data.image_url=await upload(file,data.shopee_id)}if(table==='promotions'){const file=f.querySelector('[name=promo_photo]')?.files[0];if(file)data.image_url=await upload(file,'promo-'+(id||crypto.randomUUID()))}if(table==='categories'){data.slug=String(data.slug||'').trim().toLowerCase();if(!/^[a-z0-9-]+$/.test(data.slug))throw Error('Slug ต้องเป็นภาษาอังกฤษตัวพิมพ์เล็ก ตัวเลข หรือเครื่องหมาย - เท่านั้น เช่น kitchen หรือ home-appliances');data.sort_order=Number(data.sort_order||0);}if(table==='promotions'){data.starts_at=data.starts_at?new Date(data.starts_at).toISOString():null;data.ends_at=data.ends_at?new Date(data.ends_at).toISOString():null}await write(table,data,id);f.reset();$('#'+idField).value='';notice('บันทึกสำเร็จ');await loadAdmin()}catch(err){notice(err.message)}}}
$('#resetProduct').onclick=()=>{$('#productForm').reset();$('#productId').value=''};$('#resetCategory').onclick=()=>{$('#categoryForm').reset();$('#categoryId').value=''};$('#resetPromo').onclick=()=>{$('#promoForm').reset();$('#promoId').value=''};$('#importForm').onsubmit=importCsv;$('#previewCsv').onclick=previewCsv}
function parseCSV(text){const lines=[];let row=[],cell='',quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++}else quoted=!quoted}else if(c===','&&!quoted){row.push(cell);cell=''}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(x=>x.trim()))lines.push(row);row=[];cell=''}else cell+=c}row.push(cell);if(row.some(x=>x.trim()))lines.push(row);const heads=(lines.shift()||[]).map(s=>s.replace(/^\ufeff/,'').trim());return lines.map(vals=>Object.fromEntries(heads.map((h,i)=>[h,(vals[i]||'').trim()])))}

async function previewCsv(){
  const out=$('#csvPreview');
  try{
    const f=$('#csvFile').files[0];if(!f)throw Error('กรุณาเลือกไฟล์ CSV ก่อน');
    const rows=parseCSV(await f.text());if(!rows.length)throw Error('ไม่พบข้อมูลสินค้าใน CSV');
    const errors=[];const valid=[];const known=new Set(adminCategories.map(c=>c.slug));
    rows.forEach((r,i)=>{
      const id=String(r.shopee_id||r['รหัสสินค้า']||'').trim();
      const name=String(r.name||r['ชื่อสินค้า']||'').trim();
      const link=r.affiliate_url||r['ลิงก์ข้อเสนอ']||r['ลิงก์สินค้า']||'';
      const cat=r.category_slug||adminProducts.find(p=>p.shopee_id===id)?.category_slug||'';
      const priceRaw=String(r.price||r['ราคา']||'0').replace(/[,฿]/g,'');
      let reason=!id?'ไม่มีรหัสสินค้า':!name?'ไม่มีชื่อสินค้า':!safeLink(link).startsWith('https://')?'ลิงก์ไม่ถูกต้อง':cat&&!known.has(cat)?'ไม่พบหมวดหมู่ '+cat:!Number.isFinite(Number(priceRaw))?'ราคาไม่ถูกต้อง':'';
      if(reason)errors.push('แถว '+(i+2)+': '+reason);else valid.push({id,name});
    });
    const unique=new Set(valid.map(x=>x.id));
    out.textContent='ไฟล์: '+f.name+'\nทั้งหมด '+rows.length+' แถว | ผ่านเบื้องต้น '+valid.length+' แถว ('+unique.size+' รหัสไม่ซ้ำ) | ไม่ผ่าน '+errors.length+' แถว\n\nตัวอย่างสินค้าที่ผ่าน:\n'+valid.slice(0,5).map(x=>'• '+x.id+' — '+x.name).join('\n')+(errors.length?'\n\nรายการผิดพลาด (สูงสุด 20):\n'+errors.slice(0,20).join('\n'):'')+'\n\nนี่เป็นการตรวจสอบเบื้องต้น ยังไม่ได้บันทึกข้อมูล';
    out.classList.remove('hidden');
  }catch(e){out.textContent=e.message;out.classList.remove('hidden')}
}

async function importCsv(e){e.preventDefault();try{const f=$('#csvFile').files[0];if(!f)throw Error('เลือกไฟล์ CSV ก่อน');const rows=parseCSV(await f.text());const records=new Map(),invalid=[];let rowNumber=1;for(const r of rows){rowNumber++;const id=r.shopee_id||r['รหัสสินค้า'];const name=r.name||r['ชื่อสินค้า'];const url=r.affiliate_url||r['ลิงก์ข้อเสนอ']||r['ลิงก์สินค้า'];if(!id||!name||!safeLink(url).startsWith('https://')){invalid.push({row:rowNumber,reason:!id?'ไม่มีรหัสสินค้า':!name?'ไม่มีชื่อสินค้า':'ลิงก์ Affiliate ไม่ถูกต้อง'});continue;}const price=Number(String(r.price||r['ราคา']||0).replace(/[,฿]/g,''));const old=adminProducts.find(p=>p.shopee_id===id);const category=r.category_slug||old?.category_slug||null;if(category&&!adminCategories.some(c=>c.slug===category)){invalid.push({row:rowNumber,reason:'ไม่พบหมวดหมู่ '+category});continue;}records.set(id,{shopee_id:id,name,price:Number.isFinite(price)?price:0,sold_text:r.sold_text||r['ขาย']||'',shop_name:r.shop_name||r['ชื่อร้านค้า']||'',affiliate_url:url,product_url:r.product_url||r['ลิงก์สินค้า']||'',category_slug:category,image_url:r.image_url||old?.image_url||'',is_featured:old?.is_featured||false,is_active:old?.is_active??true})}const values=[...records.values()];if(!values.length)throw Error('ไม่พบแถวสินค้าที่ถูกต้อง');const errors=invalid.slice(0,15).map(x=>`แถว ${x.row}: ${x.reason}`).join('\n');const summary=`พร้อมนำเข้า/อัปเดต ${values.length} รายการ\nข้าม ${invalid.length} แถว${errors?'\n'+errors:''}${invalid.length>15?'\n...และรายการอื่น':''}\n\nข้อมูลรหัสซ้ำจะอัปเดตข้อมูลเดิม ยืนยันหรือไม่?`;if(!confirm(summary))return;let count=0;for(let i=0;i<values.length;i+=100){const {error}=await db.from('products').upsert(values.slice(i,i+100),{onConflict:'shopee_id'});if(error)throw error;count+=values.slice(i,i+100).length}notice(`นำเข้าสำเร็จ ${count} รายการ; ข้าม ${invalid.length} แถว (กรุณาตรวจสอบหมวดหมู่และภาพ)`);await loadAdmin()}catch(err){notice(err.message)}}
if(document.body.dataset.page==='admin'){initForms();initAdmin()}else renderStore();

// Aggregate reporting is restricted server-side to users in admin_users.
async function loadClickDashboard(){
  const status=$('#clickStatus'), summary=$('#clickSummary'), body=$('#clickRows');
  if(!status||!summary||!body)return;
  status.textContent='กำลังโหลดข้อมูลคลิก…';
  try{
    const {data,error}=await db.rpc('affiliate_click_dashboard');
    if(error)throw error;
    const stats=data||{};
    summary.textContent=`วันนี้ ${Number(stats.today||0).toLocaleString('th-TH')} คลิก | 7 วัน ${Number(stats.last7||0).toLocaleString('th-TH')} คลิก | 30 วัน ${Number(stats.last30||0).toLocaleString('th-TH')} คลิก`;
    body.innerHTML=(stats.top||[]).map((p,i)=>`<tr><td>${i+1}</td><td>${esc(p.name)}</td><td>${esc(p.shopee_id)}</td><td>${Number(p.clicks||0).toLocaleString('th-TH')}</td><td><a href="product.html?id=${encodeURIComponent(p.shopee_id)}" target="_blank" rel="noopener">ดูสินค้า</a></td></tr>`).join('')||'<tr><td colspan="5">ยังไม่มีข้อมูลคลิกในช่วง 30 วัน</td></tr>';
    status.textContent='สถิติคลิกในช่วง 30 วันล่าสุด (เวลาไทย)';
  }catch(e){status.textContent='ไม่สามารถโหลดสถิติได้: '+e.message;summary.textContent='';body.innerHTML='';}
}

// Patch04: recommendations are read-only and visible only after admin authorization.
async function loadPromotionRecommendations(){
  const status=$('#recommendStatus'),body=$('#recommendRows');
  if(!status||!body||!adminUser)return;
  status.textContent='กำลังประเมินคลิก...';
  try{
    const {data,error}=await db.rpc('affiliate_promotion_recommendations');
    if(error)throw error;
    const rows=Array.isArray(data)?data:[];
    const labels={promote:'แนะนำให้ทำคลิป',review:'พักตรวจสอบคลิกผิดปกติ',collect:'รอข้อมูลเพิ่ม'};
    body.innerHTML=rows.map(p=>`<tr><td><a href="product.html?id=${encodeURIComponent(p.shopee_id)}" target="_blank" rel="noopener">${esc(p.name)}</a></td><td>${Number(p.clicks30||0)}</td><td>${Number(p.clicks7||0)}</td><td>${Number(p.adjusted30||0)}</td><td>${Number(p.peak_per_minute||0)}</td><td>${Number(p.score||0)}</td><td>${labels[p.status]||'รอข้อมูลเพิ่ม'}</td></tr>`).join('')||'<tr><td colspan="7">ยังไม่มีข้อมูลคลิก</td></tr>';
    status.textContent=`ประเมิน ${rows.length} สินค้า | แนะนำ ${rows.filter(p=>p.status==='promote').length} | พักตรวจสอบ ${rows.filter(p=>p.status==='review').length}`;
  }catch(err){status.textContent='โหลดคำแนะนำไม่สำเร็จ: '+err.message;}
}
if(document.body.dataset.page==='admin'){
  $('#refreshRecommendations')?.addEventListener('click',loadPromotionRecommendations);
}
