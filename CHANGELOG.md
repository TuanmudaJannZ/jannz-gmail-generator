# Changelog

## V13.0 — Phase B: Stabilitas & Keamanan data
- `storage.ts`: skema berversi (v2), `loadValidated`, migrasi `migrate()` (v1→v2), `save()` melaporkan gagal/kuota, JSON rusak diamankan ke `jannz.recovery.*` (tidak dihapus diam-diam).
- Validasi dan sanitasi: `sanitizeSettings` (per field) dan `sanitizeHistory` (alamat harus Gmail valid, id unik, tanggal valid, maks 50).
- `backup.ts` + Pengaturan → "Data & cadangan": unduh cadangan JSON, pulihkan dengan konfirmasi; riwayat digabung (tidak ada yang dihapus), file maks 2 MB, versi lebih baru ditolak.
- `ErrorBoundary.tsx`: layar pemulihan (muat ulang, reset pengaturan saja, unduh data mentah) menggantikan layar kosong.
- Toast error bila penyimpanan penuh/diblokir.
- Tidak diubah: algoritma generator (`gmail.ts`) dan semua fitur lama.

## Phase C — Performa
- Ekspor semua variasi: potongan 25.000 baris langsung menjadi Blob kecil (string dilepas GC), progress bar, tombol Batalkan (AbortSignal), perkiraan ukuran file (galat <1% pada uji), konfirmasi bila >50 MB, penanganan error. URL unduhan dicabut setelah 60 dtk (sebelumnya 1 dtk).
- Animasi latar: loop partikel berhenti total saat tab tidak aktif; animasi CSS (nebula, bintang, skeleton, spinner) dijeda.
- Google Fonts dimuat non-blocking (`media=print` + onload); font stack sistem sebagai fallback sudah ada. Font lokal butuh file font dari Anda.

## Phase D — Liquid Glass 2.0
Sistem kaca yang ada (permukaan berlapis, kilau spekular, tepi terarah, spotlight kartu, ripple, token gerak) dipertahankan; yang ditambah adalah lapisan konsistensi dan keterbacaan:
- **Kontras tombol utama (bug):** teks putih di atas aksen default hanya ±3:1 (gradien ke ungu ±2,7:1) dan hampir tak terbaca pada aksen cyan/mint. Kini `color.ts` memilih shade gelap tipis + teks putih (default tetap putih, ±4,7:1) atau teks gelap untuk aksen terang; teruji ≥4,5:1 pada 216 warna aksen.
- Fokus terlihat seragam (toggle, checkbox, swatch, select, range); select selaras dengan field.
- Target sentuh ≥44 px di layar sentuh tanpa mengubah tampilan.
- `prefers-reduced-transparency` kini mengganti seluruh permukaan kaca menjadi solid; `prefers-contrast: more` mempertegas tepi dan teks sekunder.
- Kartu "Pratinjau" di Pengaturan (tombol utama, kaca, chip, teks sekunder) mengikuti tema/aksen/blur secara langsung.

## Phase E — Fitur lanjutan
- **Favorit & grup** (bintang di hasil; kelola di Pusat Data): cari, filter grup, urutkan, pilih, salin, hapus terpilih/semua (konfirmasi), pindah ke grup (maks 24 huruf), paginasi dengan lompat halaman. Tersimpan di `jannz.favorites` (maks 5.000, tervalidasi).
- **Deteksi duplikat:** favorit tidak digandakan; menyimpan riwayat untuk alamat yang sama memperbarui entri lama (sebelumnya menambah entri ganda).
- **Hasil Generator:** ukuran halaman 20/50/100, lompat ke halaman, filter Favorit, ekspor JSON, "Favoritkan terpilih".
- **Pusat Ekspor:** 5 sumber × 3 format (TXT/CSV/JSON), perkiraan ukuran, progress, batal, peringatan >50 MB. JSON besar dialirkan per potongan. CSV menetralkan awalan rumus (`=`, `+`, `-`, `@`).
- **Analitik:** total dibuat/disimpan/disalin/diekspor, grafik 7 hari, 20 aktivitas terakhir. Hanya data nyata; kosong → empty state. Disimpan di `jannz.stats`.
- **Data Center:** perkiraan pemakaian penyimpanan, data pulihan (unduh/hapus), backup lengkap & ekspor konfigurasi saja, restore (menggabung), reset data pengguna dengan konfirmasi dan opsi cadangan dulu.
- **PWA:** `sw.js` (cache cangkang, jaringan dulu untuk navigasi, stale-while-revalidate untuk aset sendiri, lintas-origin dan non-GET tidak disentuh), `pwa.ts` (notifikasi pembaruan, tanpa muat ulang paksa), manifest `id`/`lang`. Hanya aktif di build produksi.
- Navigasi 5 item; Command Palette: "Buka Pusat Data", "Ekspor JSON". 135 string i18n baru (ID/EN), semua kunci diverifikasi ada.

### Hasil pengujian (dijalankan)
- `bash run-tests.sh`: 5 suite lolos (generator, storage/migrasi/backup, ekspor streaming TXT/CSV/JSON + estimasi + batal, kontras 216 warna, favorit/statistik/CSV injection).
- Pemeriksaan tipe `tsc --strict` terhadap seluruh source dengan stub tipe React/lucide/framer-motion: tidak ada error tipe pada kode proyek. Ini **bukan** pengganti `npm run build` sungguhan.

### Belum diuji (butuh lingkungan Anda)
`npm install`, `vite build`, tampilan visual semua halaman (360/390/768/1280/1920 px), perilaku service worker dan instalasi PWA di browser, unduhan file besar di Android, Lighthouse.

Belum dijalankan di lingkungan pengembangan: `npm install`, `tsc`, `vite build` (registry npm tidak terjangkau). Jalankan `npm install && npm run build` di perangkat Anda.
