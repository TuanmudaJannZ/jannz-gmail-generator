# JannZ Gmail Generator

*Generate. Organize. Simplify.* — Generator variasi titik Gmail (Gmail Dot Variation) dengan antarmuka Premium Liquid Glass.
Semua proses berjalan **100% lokal di browser**; tidak ada backend dan tidak ada email yang dikirim.

> **Penting:** variasi titik Gmail **bukan akun baru** dan **bukan inbox independen**. Semuanya mengarah ke inbox yang sama dengan alamat aslinya.
> Aplikasi ini tidak membuat akun, tidak melewati CAPTCHA/verifikasi Google, dan tidak mengotomatiskan pendaftaran.

## Menjalankan
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # cek TypeScript + build produksi
```
Butuh Node.js 18+.

## Fitur
- Generator: validasi @gmail.com (username 6–30 karakter), titik tidak di awal/akhir/berurutan, tanpa duplikat, urutan karakter terjaga.
- Lazy generation: hanya `N` hasil pertama yang dibuat (100/500/1000/5000), total teoretis 2^(n−1) − 1 ditampilkan. Browser tidak freeze.
- Hasil: cari (debounce), filter, sort, pagination, checkbox, copy individual/selected/all, export TXT & CSV (opsi nomor urut).
- Statistik dengan animated counter (semua angka dari data nyata), skeleton loading.
- History (localStorage, hanya jika Anda menekan "Simpan ke History"), Settings (tema, intensitas animasi, reduce motion, sound, partikel, kursor, blur, aksen, compact, reset).
- Command Palette: `Ctrl/⌘ + K`. Floating glass nav dengan indikator `layoutId`.
- Hormati `prefers-reduced-motion`; fallback bila `backdrop-filter` tidak didukung.

## Struktur
`src/lib` (algoritma, export, storage, sound) · `src/hooks` (state, settings) · `src/components` · `src/pages` · `src/styles`
