#!/usr/bin/env bash
# Menjalankan tes logika murni (tanpa dependensi npm). Butuh Node 22.6+ (strip-types).
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"; TMP="$(mktemp -d)"
mkdir -p "$TMP/node_modules/react"
echo '{"name":"react","type":"module","main":"i.js"}' > "$TMP/node_modules/react/package.json"
echo 'export const useState=()=>{},useEffect=()=>{},useCallback=()=>{},useRef=()=>{},useMemo=()=>{};' > "$TMP/node_modules/react/i.js"
echo '{"type":"module"}' > "$TMP/package.json"
for f in gmail storage backup useSettings export useLibrary color; do sed -E 's#from "\./([a-zA-Z]+)"#from "./\1.ts"#' "$HERE/$f.ts" > "$TMP/$f.ts"; done
for t in generator storage export color library; do
  sed -E 's#from "\./([a-zA-Z]+)"#from "./\1.ts"#' "$HERE/test-$t.mts" > "$TMP/$t.test.ts"
  echo "== $t"; (cd "$TMP" && node --experimental-strip-types "$t.test.ts" 2>&1 | grep -v -i "warning\|trace-warn")
done
echo "Semua suite selesai."
