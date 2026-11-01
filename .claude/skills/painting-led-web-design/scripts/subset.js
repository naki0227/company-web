// ページで実際に使っている文字を、字体ごとに集める
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();
 await p.goto('file://'+process.cwd()+'/'+process.argv[2]); await p.waitForTimeout(500);
 const r=await p.evaluate(()=>{const sets={};
  const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  while(w.nextNode()){const t=w.currentNode;const el=t.parentElement;if(!el)continue;
   const ff=getComputedStyle(el).fontFamily.split(',')[0].replace(/"/g,'').trim();
   (sets[ff]=sets[ff]||new Set()); for(const ch of t.data) sets[ff].add(ch);}
  // details の中（閉じていても）も含める
  return Object.fromEntries(Object.entries(sets).map(([k,v])=>[k,[...v].join('')]));});
 console.log(JSON.stringify(r)); await b.close();})();
