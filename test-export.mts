import { buildBlob, estimateBytes, fmtBytes, BIG_EXPORT_BYTES } from "./export.ts";
import { totalVariations, variant } from "./gmail.ts";
let fails=0; const ok=(n:string,c:boolean,x?:any)=>{ console.log(c?"PASS":"FAIL",n,x??""); if(!c) fails++; };
const base="abcdefghijklmnop"; // 16 chars -> 32767 variasi
const total=totalVariations(base);
for (const kind of ["txt","csv"] as const) for (const numbered of [true,false]) {
  const prog:number[]=[]; const blob=await buildBlob(base,total,numbered,kind,p=>prog.push(p));
  const text=await blob.text(); const lines=text.split("\n");
  const body=kind==="csv"?lines.slice(1):lines;
  const emails=body.map(l=>numbered?(kind==="csv"?l.split(",")[1]:l.split(". ")[1]):l);
  ok(`${kind}/${numbered} rows+unique`, body.length===total && new Set(emails).size===total && !text.endsWith("\n"));
  ok(`${kind}/${numbered} match variant()`, emails[0]===variant(base,1)&&emails[total-1]===variant(base,total)&&emails[12344]===variant(base,12345));
  ok(`${kind}/${numbered} progress monotonic ends 1`, prog.length===2 && prog[prog.length-1]===1 && prog.every((p,i)=>i===0||p>=prog[i-1]));
  const est=estimateBytes(base,total,numbered,kind); const err=Math.abs(est-blob.size)/blob.size;
  ok(`${kind}/${numbered} estimate within 10%`, err<0.10, `est=${est} real=${blob.size} err=${(err*100).toFixed(1)}%`);
}
// subset estimate (count<total, 25-char base, 100k rows)
const b25="a".repeat(25); const blob=await buildBlob(b25,100000,true,"txt"); const est=estimateBytes(b25,100000,true,"txt");
ok("subset estimate within 10%", Math.abs(est-blob.size)/blob.size<0.10, `est=${est} real=${blob.size}`);
// abort
const ac=new AbortController(); let name=""; 
try { await buildBlob(b25,200000,false,"txt",p=>{ if(p>=0.25) ac.abort(); },ac.signal); } catch(e:any){ name=e.name; }
ok("abort -> AbortError", name==="AbortError");
ac.abort(); name=""; try { await buildBlob(base,10,false,"txt",undefined,ac.signal); } catch(e:any){ name=e.name; }
ok("pre-aborted -> AbortError", name==="AbortError");
ok("fmtBytes", fmtBytes(500)==="1 KB"&&fmtBytes(5*1024*1024)==="5.0 MB"&&fmtBytes(60*1024*1024)==="60 MB");
// besar: 1.000.000 baris, 30 char
const t0=Date.now(); const big=await buildBlob("a".repeat(30),1000000,true,"csv"); const est2=estimateBytes("a".repeat(30),1000000,true,"csv");
ok("1M rows built", big.size>BIG_EXPORT_BYTES/2 && Math.abs(est2-big.size)/big.size<0.10, `size=${fmtBytes(big.size)} est=${fmtBytes(est2)} ${Date.now()-t0}ms rss=${Math.round(process.memoryUsage().rss/1048576)}MB`);
console.log(fails?`${fails} FAILED`:"ALL PASS");
