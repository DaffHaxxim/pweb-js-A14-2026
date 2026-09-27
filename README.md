# Mini Shopee - Login & Katalog Produk

Aplikasi e-commerce sederhana dua halaman yang dibuat murni menggunakan HTML, CSS, dan JavaScript native (tanpa framework, library, atau template apa pun). Proyek ini merupakan pengerjaan Praktikum Modul 2 mata kuliah Pemrograman Website.

Varian ini (`pweb-js-p01-2026-proto-v1-noTheme`) menggunakan tampilan terang (latar putih) saja, tanpa tombol pergantian tema gelap/terang.

## Fitur

### Halaman Login (`login.html`)
- Form login dengan input username dan password.
- Autentikasi kredensial ke API `https://dummyjson.com/users` menggunakan `fetch()`.
- Indikator loading (spinner) saat proses verifikasi berlangsung.
- Penanganan error informatif: pesan berbeda untuk kredensial salah dan gangguan koneksi (`try...catch`).
- Menyimpan `firstName` pengguna ke Local Storage setelah login berhasil.
- Redirect otomatis ke halaman katalog setelah login sukses.
- Tombol tampilkan/sembunyikan password.

### Halaman Katalog Produk (`index.html`)
- Proteksi halaman (auth guard): halaman tidak dapat diakses jika belum login, otomatis diarahkan kembali ke `login.html`.
- Navbar berisi sapaan nama pengguna (dari Local Storage) dan tombol Logout.
- Render produk dinamis dari API `https://dummyjson.com/products` dalam bentuk grid kartu (gambar, nama, harga, rating, diskon, kategori).
- Pencarian real-time berdasarkan nama atau kategori dengan teknik debounce (closure).
- Filter berdasarkan kategori melalui dropdown `<select>`.
- Pengurutan produk berdasarkan harga (termurah/termahal) atau rating tertinggi.
- Keranjang belanja dengan penyimpanan Local Storage (tambah, ubah jumlah, hapus, kosongkan), lengkap dengan badge jumlah dan total harga.
- Tombol Load More (pagination dengan teknik array slicing).
- Modal detail produk (stok, brand, deskripsi) dengan teknik event delegation.
- Penanganan error global saat pengambilan data produk gagal, disertai tombol coba lagi.

## Teknologi

- HTML5
- CSS3 (custom properties, Flexbox, Grid, native `<dialog>`)
- JavaScript ES6+ (native, tanpa dependensi)
- Data diambil dari [DummyJSON](https://dummyjson.com/) API

Seluruh kode JavaScript dipisah ke file eksternal dan dihubungkan menggunakan atribut `defer`.

## Struktur Folder

```
pweb-js-p01-2026-proto-v1-noTheme/
├── login.html          # Halaman login
├── index.html          # Halaman katalog produk (terproteksi)
├── css/
│   ├── base.css        # Token tema, reset, tombol, dan komponen form (dipakai kedua halaman)
│   ├── login.css       # Tata letak khusus halaman login
│   └── catalog.css     # Tata letak navbar, toolbar, grid, modal, dan keranjang
└── js/
    ├── login.js        # Logika autentikasi dan sesi login
    └── catalog.js      # Logika katalog: fetch, render, search, filter, sort, keranjang, modal
```

## Cara Menjalankan

Disarankan menjalankan lewat server statis (bukan membuka file langsung via `file://`) agar `fetch()` dan navigasi berjalan normal.

1. Buka terminal pada folder ini.
2. Jalankan salah satu server statis berikut:

   ```bash
   # Menggunakan Python 3
   python3 -m http.server 8080
   ```

   ```bash
   # Alternatif: menggunakan Node.js
   npx serve
   ```

3. Buka browser ke `http://localhost:8080/login.html`.

## API yang Digunakan

| Keperluan | Endpoint |
|-----------|----------|
| Autentikasi login | `https://dummyjson.com/users` |
| Data katalog produk | `https://dummyjson.com/products` |

Tidak diperlukan API key. Seluruh data dipanggil secara dinamis menggunakan `fetch()`.

## Akun Demo

| Username | Password |
|----------|----------|
| `emilys` | `emilyspass` |

Daftar akun lain dapat dilihat pada `https://dummyjson.com/users`.

## Catatan

- Dibuat native from scratch tanpa framework atau library apa pun (React, Vue, jQuery, Bootstrap, Tailwind, dan sejenisnya) sesuai ketentuan praktikum.
- Autentikasi dilakukan di sisi klien karena API DummyJSON mengembalikan password pada data pengguna. Pendekatan ini hanya untuk keperluan praktikum dan tidak aman untuk aplikasi nyata.
- Data sesi (`firstName`) dan keranjang (`pweb.cart`) disimpan di Local Storage browser, sehingga bertahan setelah halaman dimuat ulang. Logout hanya menghapus data sesi, tidak menghapus keranjang.
