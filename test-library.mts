const store = new Map<string,string>();
(globalThis as any).localStorage = { getItem:(k:string)=>store.has(k)?store.get(k)!:null, setItem:(k:string,v:string)=>void store.set(k,v), removeItem:(k:string)=>void store.delete(k) };
const S=await import("./storage.ts"), B=await import("./backup.ts"), E=await import("./export.ts"), U=await import("./useSettings.ts"), G=await import("./gmail.ts");
let f=0; const ok=(n:string,c:boolean,x?:any)=>{console.log(c?"PASS":"FAIL",n,x??"");if(!c)f++;};
// favorites sanitize
const fav=S.sanitizeFavorites([{email:"ab.cdef@gmail.com",date:"2026-11-15T00:00:00Z",group:"  Kerja\u0007  "},{email:"abc.def@gmail.com"},{email:"abcdef@gmail.com"},{email:"x@evil.com"},{email:"<b>@gmail.com"},null,{email:"ab.cdef@gmail.com"}])!;
ok("fav sanitize: valid kept, dup+invalid dropped", fav.length===3 && fav[0].group==="Kerja", JSON.stringify(fav.map(x=>x.email)));
ok("fav group capped 24", S.cleanGroup("x".repeat(99)).length===24);
ok("fav non-array -> null", S.sanitizeFavorites({})===null);
// stats sanitize
const st=S.sanitizeStats({generated:-5,saved:"x",copied:3.7,exported:1e15,daily:{"2026-11-15":{g:5,c:1,e:0},"bad":{g:9},"2026-11-14":"x"},log:[{t:"2026-11-15T00:00:00Z",k:"copy",n:2},{t:"nope",k:"copy",n:1},{t:"2026-11-15T00:00:00Z",k:"hack",n:1}]})!;
ok("stats sanitize", st.generated===0&&st.saved===0&&st.copied===3&&st.exported===1e12&&Object.keys(st.daily).join()==="2026-11-15"&&st.log.length===1);
ok("statsEmpty", S.statsEmpty(S.emptyStats())&&!S.statsEmpty(st));
// backup full roundtrip with favorites/stats; config-only
const bk=JSON.parse(JSON.stringify(B.buildBackup(U.DEFAULTS,[],fav,st)));
const p=B.parseBackup(JSON.stringify(bk)); ok("full backup roundtrip", p.ok&&p.favorites.length===3&&p.stats!==null);
const cfg=B.parseBackup(JSON.stringify(B.buildConfigBackup(U.DEFAULTS))); ok("config backup: settings only", cfg.ok&&cfg.settings!==null&&cfg.history.length===0&&cfg.favorites.length===0&&cfg.stats===null);
ok("old backup (no favorites) still parses", B.parseBackup(JSON.stringify({app:"jannz-gmail-generator",schema:2,settings:U.DEFAULTS,history:[]})).ok);
ok("mergeFavorites no loss", B.mergeFavorites([fav[0]],[fav[0],fav[1]]).length===2);
// export serializers
const rows=G.generate("abcdef",5); 
for (const k of ["txt","csv","json"] as const) { const t=E.serializeRows(rows,true,k); ok(`serializeRows ${k}`, k==="json"?JSON.parse(t).length===5&&JSON.parse(t)[0].n===1:t.split("\n").length>=5); }
const hj=JSON.parse(E.serializeHistory([{id:"1",original:"abcdef@gmail.com",total:31,limit:5,date:"2026-11-15T00:00:00.000Z"}],"json")); ok("history json", hj[0].original==="abcdef@gmail.com"&&hj[0].totalVariations===31);
const csvF=E.serializeFavorites([{email:"a@gmail.com",group:'=HYPERLINK("x")',date:"2026-11-15T00:00:00.000Z"},{email:"b@gmail.com",group:"a,b",date:"d"}],"csv").split("\n");
ok("csv formula neutralised + quoting", csvF[1].includes("'=HYPERLINK")&&csvF[2].includes('"a,b"'), csvF[1]);
// big json streaming valid + estimate
const base="abcdefghijklmnop", tot=G.totalVariations(base);
for (const numbered of [true,false]) { const b=await E.buildBlob(base,tot,numbered,"json"); const arr=JSON.parse(await b.text());
  ok(`json stream valid n=${numbered}`, arr.length===tot&&arr[0].email===G.variant(base,1)&&arr[tot-1].email===G.variant(base,tot)&&(numbered?arr[5].n===6:arr[5].n===undefined));
  const est=E.estimateBytes(base,tot,numbered,"json"); ok(`json estimate ±10% n=${numbered}`, Math.abs(est-b.size)/b.size<0.1, `${est} vs ${b.size}`); }
const lb=E.listBytes(rows,true,"txt"); const real=new Blob([E.toTxt(rows,true)]).size; ok("listBytes close", Math.abs(lb-real)<=rows.length*2, `${lb} vs ${real}`);
// 0 count json
const z=await E.buildBlob("abcdef",0,false,"json"); ok("empty json is []", JSON.parse(await z.text()).length===0);
console.log(f?`${f} FAILED`:"ALL PASS");
