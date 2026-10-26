# Penjelasan: .env (Environment Configuration)

File `.env` menyimpan konfigurasi yang **sensitif** dan **berbeda per environment**
(development, staging, production). File ini TIDAK boleh di-commit ke Git.

---

## Isi File

```env
DATABASE_URL="mysql://root:@localhost:3306/products_db"
```

---

## Anatomi Connection String MySQL

```
mysql://USERNAME:PASSWORD@HOST:PORT/NAMA_DATABASE
  |         |        |      |     |       |
  |         |        |      |     |       └── Nama database
  |         |        |      |     └────────── Port MySQL (default: 3306)
  |         |        |      └──────────────── Host/IP server
  |         |        └─────────────────────── Password (kosong jika tidak ada)
  |         └──────────────────────────────── Username
  └────────────────────────────────────────── Protocol
```

### Contoh Konfigurasi

**XAMPP / Laragon (tanpa password):**
```env
DATABASE_URL="mysql://root:@localhost:3306/products_db"
```

**MySQL dengan password:**
```env
DATABASE_URL="mysql://root:password123@localhost:3306/products_db"
```

**Database di server lain:**
```env
DATABASE_URL="mysql://admin:secret@192.168.1.100:3306/products_db"
```

---

## Cara Next.js Membaca `.env`

Next.js secara otomatis membaca file `.env` di root project.
Variabel yang ditulis di sana bisa diakses via `process.env.NAMA_VARIABEL`.

Di Prisma, kita menggunakan:
```prisma
url = env("DATABASE_URL")
```

Fungsi `env()` Prisma membaca `process.env.DATABASE_URL`.

---

## Keamanan

File `.env` sudah ada di `.gitignore` (dibuat otomatis oleh Next.js):

```gitignore
# local env files
.env*.local
.env
```

> **PENTING:** Jangan pernah menyimpan password atau API key langsung di kode.
> Selalu gunakan environment variable.

---

## Untuk Production / Deploy

Saat deploy ke Vercel, Railway, atau hosting lain, masukkan nilai `DATABASE_URL`
di panel environment variables hosting tersebut — jangan upload file `.env` ke server.
