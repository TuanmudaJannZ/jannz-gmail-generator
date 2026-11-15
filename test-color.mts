import { onPrimary, contrast, luminance, SECONDARY } from "./color.ts";
let f=0; const ok=(n:string,c:boolean,x?:any)=>{console.log(c?"PASS":"FAIL",n,x??"");if(!c)f++;};
for (const a of ["#6C8CFF","#A78BFA","#67E8F9","#6EE7B7"]) { const r=onPrimary(a); ok(`accent ${a} -> ${r.text} shade ${r.shade}`, r.ratio>=4.5, `ratio ${r.ratio.toFixed(2)}`); }
ok("default keeps white text", onPrimary("#6C8CFF").text==="#FFFFFF");
ok("cyan/mint switch to dark text", onPrimary("#67E8F9").text!=="#FFFFFF" && onPrimary("#6EE7B7").text!=="#FFFFFF");
const hex=(h:string)=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
console.log("before fix white vs default accent:", contrast(1,luminance(hex("#6C8CFF"))).toFixed(2), "vs secondary:", contrast(1,luminance(hex(SECONDARY))).toFixed(2));
// custom arbitrary accents never fall below 4.5 (sweep)
let worst=99; for(let r=0;r<256;r+=51)for(let g=0;g<256;g+=51)for(let b=0;b<256;b+=51){const h="#"+[r,g,b].map(v=>v.toString(16).padStart(2,"0")).join("");worst=Math.min(worst,onPrimary(h).ratio);}
ok("sweep 216 accents min ratio >=4.5", worst>=4.5, worst.toFixed(2));
console.log(f?`${f} FAILED`:"ALL PASS");
