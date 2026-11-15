import { parseGmail, totalVariations, variant, generate } from "./gmail.ts";
let f = 0; const ok = (n: string, c: boolean) => { console.log(c ? "PASS" : "FAIL", n); if (!c) f++; };
const b = "abcdef", tot = totalVariations(b), all = generate(b, 1000);
ok("total=2^(n-1)-1", tot === 31); ok("unique", new Set(all.map((r) => r.email)).size === all.length && all.length === 31);
ok("no edge/double dots", all.every((r) => !/(^\.|\.\.|\.@)/.test(r.email))); ok("chars preserved", all.every((r) => r.email.replace("@gmail.com", "").replace(/\./g, "") === b));
ok("offset", generate(b, 5, 3)[0].n === 4 && generate(b, 5, tot - 2).length === 2);
ok("min length", !parseGmail("abc@gmail.com").ok); ok("plus alias rejected", !parseGmail("x+y@gmail.com").ok);
const n30 = "a".repeat(30); ok("30 chars safe integer", Number.isSafeInteger(totalVariations(n30)) && variant(n30, totalVariations(n30)).length === 69);
console.log(f ? `${f} FAILED` : "ALL PASS"); if (f) process.exit(1);
