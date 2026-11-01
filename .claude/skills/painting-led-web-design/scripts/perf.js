// 外部の字体を一度だけ取得してキャッシュし、毎回同じ遅延で返す（ネットワークのばらつきを除く）
const { chromium } = require('playwright');
const N = +(process.env.N || 12), DELAY = +(process.env.DELAY || 150);
(async()=>{const b=await chromium.launch(); const cache=new Map(); const out={};
 const route = async (r) => { const u=r.request().url();
   if (!cache.has(u)) { const res=await r.fetch(); cache.set(u,{status:res.status(),headers:res.headers(),body:await res.body()}); }
   await new Promise(z=>setTimeout(z,DELAY)); const c=cache.get(u); await r.fulfill({status:c.status,headers:c.headers,body:c.body}); };
 // ウォームアップ（キャッシュを作る）
 for (const f of process.argv.slice(2)) { const ctx=await b.newContext(); const p=await ctx.newPage(); await p.route(/fonts\.(googleapis|gstatic)\.com/, route); await p.goto('file://'+process.cwd()+'/'+f); await p.waitForTimeout(2500); await ctx.close(); }
 for (let k=0;k<N;k++) for (const f of process.argv.slice(2)) { out[f]=out[f]||[];
  const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();
  await p.route(/fonts\.(googleapis|gstatic)\.com/, route);
  const cdp=await ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  await p.addInitScript(()=>{window.__lt=[];new PerformanceObserver(l=>{for(const e of l.getEntries())window.__lt.push(e.duration)}).observe({type:'longtask',buffered:true});});
  await p.goto('file://'+process.cwd()+'/'+f,{waitUntil:'load'});await p.waitForTimeout(3000);
  out[f].push(Math.round(await p.evaluate(()=>__lt.reduce((s,d)=>s+Math.max(0,d-50),0)))); await ctx.close(); }
 console.log(JSON.stringify(out)); await b.close();})();
