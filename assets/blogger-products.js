/* Shopthai2026 Blogger public catalog. No privileged credentials. */
(() => {
  'use strict';
  const cfg = window.SHOPTHAI_BLOGGER || {};
  const root = document.getElementById('st-catalog');
  if (!root) return;
  const status = document.getElementById('st-status');
  const grid = document.getElementById('st-products');
  const select = document.getElementById('st-category');
  const search = document.getElementById('st-search');
  const endpoint = String(cfg.supabaseUrl || '').replace(/\/$/, '');
  const key = String(cfg.publishableKey || '');
  const allowed = /^(?:sb_publishable_[A-Za-z0-9_-]+|eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/;
  const validConfig = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(endpoint) && allowed.test(key);
  const setStatus = (s) => { status.textContent = s; };
  const link = (raw) => {
    try {
      const u = new URL(raw);
      if (u.protocol !== 'https:' || !/(^|\.)(shopee\.co\.th|shopee\.com|s\.shopee\.co\.th)$/.test(u.hostname.toLowerCase())) return null;
      return u.href;
    } catch { return null; }
  };
  const image = (raw) => {
    try { const u = new URL(raw); return u.protocol === 'https:' ? u.href : null; } catch { return null; }
  };
  const text = (tag, value, cls) => { const e = document.createElement(tag); e.textContent = String(value ?? ''); if(cls) e.className=cls; return e; };
  const price = (v) => '฿' + Number(v || 0).toLocaleString('th-TH', {maximumFractionDigits: 2});
  const headers = { apikey: key, Accept: 'application/json' };
  // RLS must restrict anon SELECT to public, active records. The query alone is not authorization.
  const get = async (table, query) => {
    const res = await fetch(`${endpoint}/rest/v1/${table}?${query}`, { headers, mode: 'cors', cache: 'no-store' });
    if (!res.ok) throw Error(`Supabase ${table}: HTTP ${res.status}`);
    return res.json();
  };
  let products = [];
  function render() {
    const q = search.value.trim().toLocaleLowerCase('th');
    const cat = select.value;
    const matches = products.filter(p => (!cat || p.category_slug === cat) && (!q || `${p.name || ''} ${p.shop_name || ''}`.toLocaleLowerCase('th').includes(q)));
    grid.replaceChildren();
    const fragment = document.createDocumentFragment();
    matches.forEach(p => {
      const card = document.createElement('article'); card.className = 'st-card';
      const img = image(p.image_url);
      if (img) { const el = document.createElement('img'); el.src = img; el.alt = String(p.name || 'สินค้า'); el.loading = 'lazy'; el.referrerPolicy='no-referrer'; card.append(el); }
      card.append(text('h3', p.name || 'สินค้า'));
      card.append(text('p', price(p.price), 'st-price'));
      if (p.shop_name) card.append(text('p', p.shop_name, 'st-muted'));
      const url = link(p.affiliate_url);
      if (url) {
        const a = text('a', 'ซื้อที่ Shopee', 'st-buy');
        a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer sponsored nofollow';
        // Only count clicks if the installed server-side endpoint is configured.
        a.addEventListener('click', () => {
          if (!cfg.clickEndpoint) return;
          try {
            const target = new URL(cfg.clickEndpoint);
            if (target.protocol !== 'https:' || target.origin !== endpoint) return;
            fetch(target.href, {method:'POST', headers:{...headers,'Content-Type':'application/json'}, body:JSON.stringify({shopee_id:String(p.shopee_id)}), keepalive:true}).catch(()=>{});
          } catch { /* outbound purchase link must never be blocked */ }
        });
        card.append(a);
      } else card.append(text('p', 'ยังไม่มีลิงก์ซื้อที่ตรวจสอบได้', 'st-muted'));
      fragment.append(card);
    });
    grid.append(fragment);
    setStatus(matches.length ? `แสดง ${matches.length} สินค้า` : 'ไม่พบสินค้าที่ตรงกับการค้นหา');
  }
  async function start() {
    if (!validConfig) { setStatus('กรุณาตั้งค่า Supabase URL และ Publishable/anon key ในธีมก่อน'); return; }
    try {
      const [rows, categories] = await Promise.all([
        get('products', 'select=shopee_id,name,price,image_url,affiliate_url,category_slug,shop_name,is_featured&is_active=eq.true&order=created_at.desc&limit=100'),
        get('categories', 'select=slug,name&order=sort_order.asc&limit=100')
      ]);
      products = rows.sort((a,b)=>Number(!!b.is_featured)-Number(!!a.is_featured));
      categories.forEach(c => {const opt = document.createElement('option');opt.value=String(c.slug);opt.textContent=String(c.name);select.append(opt);});
      select.addEventListener('change', render);
      search.addEventListener('input', render);
      render();
    } catch(e) { console.error('Shopthai catalog:',e);setStatus('โหลดสินค้าไม่ได้ กรุณาตรวจสอบ RLS, สิทธิ์ SELECT และการตั้งค่า Supabase'); }
  }
  start();
})();
