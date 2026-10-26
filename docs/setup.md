# Setup: Cara Menjalankan Project

## Prasyarat

- Node.js >= 18
- MySQL berjalan di lokal (XAMPP, Laragon, atau MySQL standalone)
- npm

---

## Langkah 1 — Install Dependencies

```bash
npm install
```

---

## Langkah 2 — Konfigurasi Database

Edit file `.env` di root project:

```env
DATABASE_URL="mysql://USERNAME:PASSWORD@HOST:PORT/NAMA_DATABASE"
```

Contoh jika menggunakan XAMPP (tanpa password):

```env
DATABASE_URL="mysql://root:@localhost:3306/products_db"
```

Contoh jika MySQL punya password:

```env
DATABASE_URL="mysql://root:rahasia123@localhost:3306/products_db"
```

> **Catatan:** Database `products_db` tidak perlu dibuat manual.
> Prisma akan membuatnya lewat perintah migrate di bawah.

---

## Langkah 3 — Buat Tabel di Database

Perintah ini akan:
1. Membuat database jika belum ada
2. Membuat tabel `products` sesuai schema Prisma
3. Menghasilkan Prisma Client

```bash
npx prisma migrate dev --name init
```

Jika sukses, akan ada folder `prisma/migrations/` berisi file SQL.

---

## Langkah 4 — Generate Prisma Client

Jika Prisma Client belum ter-generate (biasanya otomatis saat migrate):

```bash
npx prisma generate
```

---

## Langkah 5 — Jalankan Aplikasi

```bash
npm run dev
```

Buka browser: **http://localhost:3000/products**

---

## Perintah Berguna Lainnya

```bash
# Buka Prisma Studio (GUI untuk melihat/edit data database)
npx prisma studio

# Reset database dan jalankan ulang semua migration
npx prisma migrate reset

# Lihat status migration
npx prisma migrate status
```

---

## Troubleshooting

| Masalah | Solusi |
|---|---|
| `Can't connect to MySQL server` | Pastikan MySQL berjalan (cek XAMPP/Laragon) |
| `Access denied for user` | Periksa username dan password di `.env` |
| `Table doesn't exist` | Jalankan `npx prisma migrate dev --name init` |
| `PrismaClientInitializationError` | Jalankan `npx prisma generate` |
