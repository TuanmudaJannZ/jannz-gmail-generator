# JannZ Gmail Generator

*Generate. Organize. Simplify.*

Generator variasi titik Gmail (Gmail Dot Variation) dengan antarmuka Liquid Glass dan latar galaksi.
Semua proses berjalan **100% lokal di browser**. Tidak ada backend, dan tidak ada alamat email yang dikirim ke server.

> **Penting:** variasi titik Gmail **bukan akun baru** dan **bukan inbox independen**. Semuanya masuk ke inbox yang sama dengan alamat aslinya.
> Aplikasi ini tidak membuat akun, tidak melewati CAPTCHA atau verifikasi Google, dan tidak mengotomatiskan pendaftaran.

## Menjalankan

Butuh Node.js 18 atau lebih baru.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # cek TypeScript + build produksi ke folder dist
npm run preview  # pratinjau hasil build
```

## Deploy dari HP (GitHub + Vercel)

1. Ekstrak ZIP, buat repo di github.com, lalu **Add file → Upload files** dan pilih **semua file** (struktur project ini flat, tanpa folder, jadi bisa dipilih sekaligus).
2. Di vercel.com pilih **Add New → Project**, import repo itu, lalu **Deploy**. Pengaturan Vite terdeteksi otomatis.
3. Update: upload ulang file ke repo yang sama. Vercel akan deploy ulang sendiri.

Kalau build gagal karena pengecekan TypeScript, sementara ubah script `build` di `package.json` menjadi `"vite build"`, lalu laporkan error-nya.

## Yang baru di V13.0

- **Pusat Data** (menu baru): Favorit & grup, Pusat Ekspor (TXT/CSV/JSON dari terpilih, dimuat, semua variasi, favorit, riwayat), Analitik (angka nyata dari penggunaan), dan Data (penyimpanan, backup/restore, reset).
- **Penyimpanan aman:** skema berversi + migrasi, validasi, data rusak diamankan (bukan dihapus), ErrorBoundary, backup/restore dengan konfirmasi.
- **PWA:** bisa dipasang dan membuka cangkang aplikasi secara offline setelah kunjungan pertama. Hanya file aplikasi yang di-cache, **tidak pernah data email**. Notifikasi pembaruan memakai tombol "Muat ulang"; ubah `VERSION` di `sw.js` setiap rilis.
- Ekspor besar per potongan dengan progress, batal, dan peringatan ukuran. Kontras tombol otomatis mengikuti warna aksen.

### Tes logika (tanpa npm)

```bash
bash run-tests.sh   # Node 22.6+; menguji generator, storage, backup, ekspor, kontras, favorit/statistik
```

## Fitur

**Generator**
- Hanya `@gmail.com`; username 6–30 karakter (tanpa titik). Titik yang sudah ada di input diabaikan.
- Titik tidak di awal atau akhir, tidak berurutan, tanpa duplikat, dan urutan karakter asli terjaga.
- Total variasi bertitik: 2^(n−1) − 1. Hasil dibuat **lazy**, jadi tidak pernah membuat seluruh kombinasi sekaligus.
- Ukuran muatan (hasil per muatan): 100, 500, 1.000, 5.000, atau 25.000.
- **Muat lagi:** menyambung variasi berikutnya tanpa duplikat, sampai 200.000 hasil di layar.
- **Ekspor semua variasi** (TXT/CSV): dibuat bertahap tanpa menampilkannya di layar, hingga 1.000.000 baris.

**Hasil**
- Pencarian (debounce), filter terpilih/belum, sort (1→N, N→1, A–Z), pagination 20 baris per halaman.
- Checkbox, pilih semua, batal pilih, salin satu/terpilih/semua.
- Ekspor TXT dan CSV dari hasil yang dimuat atau yang terpilih, dengan opsi nomor urut. File ekspor tidak berisi tombol atau teks antarmuka.
- Statistik dengan counter animasi; semua angka berasal dari data aplikasi.

**Riwayat**
- Tersimpan di `localStorage` perangkat ini, **hanya jika Anda menekan "Simpan ke Riwayat"**.
- Membuka ulang dari Riwayat memuat 5.000 hasil pertama (sisanya bisa dimuat lewat tombol "Muat lagi"). Hapus per item atau semua (dengan konfirmasi).

**Pengaturan** (tersimpan lokal)
- Bahasa (Indonesia/English), tema (gelap/terang), font (Fluid/Techno/Classic).
- Intensitas animasi, kurangi gerakan, efek suara (default mati), partikel, efek kursor, intensitas blur kaca, warna aksen, mode ringkas.
- Hapus riwayat dan reset pengaturan.

**Lainnya**
- Panel navigasi kapsul melayang (pill kaca dengan efek tetes air dan animasi ikon).
- Command Palette: `Ctrl/⌘ + K`.
- Latar galaksi (lengkung cahaya, bintang, nebula). Di perangkat sentuh efek berat dimatikan atau dikurangi secara default.
- Hormati `prefers-reduced-motion`; ada fallback bila `backdrop-filter` tidak didukung.
- Ikon aplikasi, favicon, dan `manifest.webmanifest` (nama dan ikon saat "Tambahkan ke layar utama").

## Sistem animasi (satu bahasa gerak)

- **Token** di `index.css` (`--ease-out`, `--ease-spring`, `--t-fast/base/slow`) dan `motion.ts` (untuk framer-motion) memakai easing & durasi yang sama.
- **Kaca berlapis**: `.glass` = kilau spekular + bias cahaya aksen + pantulan diagonal + tepi terarah (atas terang, bawah redup) + highlight dalam. Satu `backdrop-filter` per permukaan.
- **Ripple**: satu listener global di `ripple.ts` (tombol, icon-btn, item palette, baris tombol). Navigasi punya efek tetesnya sendiri.
- **Modal**: `Modal.tsx` dipakai Command Palette dan konfirmasi hapus: scale-in, scrim blur, Escape, focus trap, kunci scroll, `inert` pada latar, fokus kembali ke pemicu.
- **Toast**: `Toast.tsx`, tipe `success | error | warning | info`, hanya satu toast aktif (pesan baru menggantikan, pesan sama hanya memperpanjang waktu).
- **Transisi halaman**: CSS `.page-in` (opacity + translate pada elemen kaca itu sendiri; opacity tidak dipasang pada pembungkus agar blur tidak berkedip).
- **Skeleton**: shimmer berbasis transform; `Results` memakai skeleton yang meniru kartu asli (tinggi baris = `.row`), jadi tanpa layout shift.
- **Gerak dikurangi**: `prefers-reduced-motion`, pengaturan "Kurangi gerakan", dan "Animasi: Mati" menonaktifkan animasi masuk, ripple, dan efek magnetik/tilt.

## Struktur file (flat)

```
index.html · manifest.webmanifest · package.json · vite.config.ts · tsconfig.json
tailwind.config.js · postcss.config.js · index.css
main.tsx · App.tsx · AppContext.tsx        # entry, shell, state global
gmail.ts · export.ts · storage.ts · sound.ts · i18n.ts    # logika dan utilitas
useSettings.ts · useDebounced.ts           # hooks
HomePage · GeneratorPage · HistoryPage · SettingsPage     # halaman (.tsx)
FloatingNav · CommandPalette · EmailInput · Results · Stats · Disclaimer
GlassCard · Button · Toggle · Counter · Background        # komponen (.tsx)
favicon.svg/.ico · favicon-32.png · apple-touch-icon.png · icon-192/512.png · icon-maskable-512.png
```

Karena tidak ada folder `public`, `vite.config.ts` menyalin file ikon dan manifest ke `dist` saat build.
Untuk menambah teks atau bahasa, edit `i18n.ts` (satu kamus berpasangan Indonesia/English).

## Stack

React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Lucide React, `localStorage`, dan Web API untuk clipboard serta download.

## Batasan yang perlu diketahui

- **Belum ada mode offline** (belum ada service worker). Font dimuat dari Google Fonts; tanpa internet tampilan memakai font bawaan sistem.
- Batas di layar 200.000 hasil dan batas ekspor 1.000.000 baris ada demi menjaga performa HP. Total variasi bisa jauh lebih besar untuk username panjang.
- Hasil muncul berurutan (bukan acak), jadi baris awal polanya mirip.
- Ekspor lewat tautan unduhan bisa berperilaku berbeda di WebView/APK pembungkus; di Chrome Android umumnya berjalan normal.
- Aplikasi ini belum diuji menyeluruh di berbagai perangkat; laporkan bug yang ditemukan.
