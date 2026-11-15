const store = new Map<string,string>(); let quota = false;
(globalThis as any).localStorage = { getItem:(k:string)=>store.has(k)?store.get(k)!:null, setItem:(k:string,v:string)=>{ if(quota) throw new Error("quota"); store.set(k,v); }, removeItem:(k:string)=>void store.delete(k), get length(){return store.size}, key:(i:number)=>[...store.keys()][i] };
const S = await import("./storage.ts"); const B = await import("./backup.ts"); const U = await import("./useSettings.ts");
let fails=0; const ok=(n:string,c:boolean)=>{ console.log(c?"PASS":"FAIL",n); if(!c) fails++; };
// 1 corrupt JSON -> recovery, fallback
store.set("jannz.history","{bad json");
ok("corrupt json -> []", JSON.stringify(S.loadValidated("jannz.history",[],S.sanitizeHistory))==="[]");
ok("corrupt raw preserved in recovery", store.get("jannz.recovery.jannz.history")==="{bad json");
// 2 wrong structure
store.set("jannz.settings", JSON.stringify([1,2]));
ok("settings array -> defaults", S.loadValidated("jannz.settings",U.DEFAULTS,U.sanitizeSettings)===U.DEFAULTS);
// 3 partial/invalid fields
const s = U.sanitizeSettings({theme:"neon",blur:999,accent:"red",font:"techno",sound:"yes",intensity:1.6})!;
ok("sanitize fields", s.theme==="dark"&&s.blur===40&&s.accent===U.DEFAULTS.accent&&s.font==="techno"&&s.sound===false&&s.intensity===2);
// 4 history sanitize keeps good drops bad
const good={id:"1",original:"abcdef@gmail.com",total:31,limit:31,date:"2026-11-15T00:00:00.000Z"};
const h=S.sanitizeHistory([good,{...good,id:"2",original:"<script>@gmail.com"},{...good,id:"1"},{id:"3"},null,{...good,id:"4",date:"nope"}])!;
ok("history drops invalid+dup", h.length===1&&h[0].id==="1");
// 5 migration v1 -> v2 keeps valid data, sets schema
store.clear(); store.set("jannz.history",JSON.stringify([good,{id:"x"}]));
S.migrate(); ok("migrate sets schema 2", store.get("jannz.schema")==="2"); ok("migrate keeps good item", JSON.parse(store.get("jannz.history")!).length===1);
// 6 newer schema untouched
store.set("jannz.schema","9"); store.set("jannz.history","[{\"future\":1}]"); S.migrate();
ok("newer schema untouched", store.get("jannz.history")==="[{\"future\":1}]"&&store.get("jannz.schema")==="9");
// 7 backup roundtrip + merge
const bk=JSON.stringify(B.buildBackup(U.DEFAULTS,[good])); const p=B.parseBackup(bk);
ok("backup roundtrip", p.ok&&p.history.length===1&&p.settings!==null);
const newer={...good,id:"2",date:"2026-11-16T00:00:00.000Z"};
ok("merge no loss, newest first", B.mergeHistory([good],[newer,good]).map(x=>x.id).join()==="2,1");
// 8 bad backups
ok("not json", (B.parseBackup("nope") as any).reason==="json");
ok("wrong app", (B.parseBackup('{"app":"x","schema":1}') as any).reason==="format");
ok("newer version", (B.parseBackup('{"app":"jannz-gmail-generator","schema":99}') as any).reason==="version");
ok("too big", (B.parseBackup("x".repeat(B.BACKUP_MAX_BYTES+1)) as any).reason==="size");
ok("malicious history dropped", (B.parseBackup(JSON.stringify({app:"jannz-gmail-generator",schema:2,history:[{...good,original:"a@evil.com"}]})) as any).dropped===1);
// 9 quota
quota=true; ok("save returns false on quota", S.save("k",1)===false);
console.log(fails?`${fails} FAILED`:"ALL PASS");
