# Dokumentasi CRUD Products - Next.js + Prisma + MySQL

Proyek ini adalah aplikasi **CRUD (Create, Read, Update, Delete)** sederhana
untuk mengelola data produk, dibangun dengan:

- **Next.js 14** (App Router)
- **Prisma ORM** (Object Relational Mapper)
- **MySQL** (Database)
- **Vanilla CSS** (Styling)

---

## Daftar File dan Fungsinya

| File / Folder | Fungsi |
|---|---|
| `prisma/schema.prisma` | Definisi model data dan konfigurasi database |
| `.env` | Konfigurasi environment (koneksi database) |
| `lib/prisma.js` | Singleton Prisma Client |
| `app/api/products/route.js` | API Route: GET (list) dan POST (create) |
| `app/api/products/[id]/route.js` | API Route: GET, PUT, DELETE satu produk |
| `app/products/page.js` | Halaman SPA utama (UI CRUD) |
| `app/products/products.css` | Stylesheet halaman products |
| `docs/` | Folder dokumentasi ini |

---

## Cara Setup dan Menjalankan

Lihat: [setup.md](./setup.md)

## Penjelasan File Satu Per Satu

- [prisma-schema.md](./prisma-schema.md) — Schema Prisma & model Product
- [env-config.md](./env-config.md) — Konfigurasi .env
- [lib-prisma.md](./lib-prisma.md) — Singleton Prisma Client
- [api-routes.md](./api-routes.md) — Semua API Route (endpoint)
- [frontend-page.md](./frontend-page.md) — Halaman UI dan logika React

---

## Alur Data (Data Flow)

```
Browser (UI)
    |
    | fetch("/api/products")
    v
Next.js App Router (API Route)
    |
    | prisma.product.findMany()
    v
Prisma Client (ORM)
    |
    | SQL: SELECT * FROM products
    v
MySQL Database
```

Setiap operasi CRUD mengikuti alur ini dari atas ke bawah (request)
dan dari bawah ke atas (response/data).
