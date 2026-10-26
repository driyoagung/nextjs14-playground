# Penjelasan: prisma/schema.prisma

File ini adalah **jantung dari Prisma**. Di sini kita mendefinisikan:
1. Cara generate Prisma Client (generator)
2. Koneksi ke database (datasource)
3. Struktur tabel (model)

---

## Isi File Lengkap

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model Product {
  id          Int      @id @default(autoincrement())
  name        String   @db.VarChar(255)
  description String?  @db.Text
  price       Float
  stock       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("products")
}
```

---

## Penjelasan Per Blok

### `generator client`

```prisma
generator client {
  provider = "prisma-client-js"
}
```

- Memberitahu Prisma untuk generate **JavaScript client**
- Client ini yang kita `import` di kode (`import prisma from "@/lib/prisma"`)
- Setelah `npx prisma generate`, file client muncul di `node_modules/@prisma/client`

---

### `datasource db`

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

- `provider = "mysql"` — database yang dipakai adalah MySQL
- `url = env("DATABASE_URL")` — baca connection string dari file `.env`
- `env()` adalah fungsi Prisma untuk membaca environment variable

---

### `model Product`

Model ini merepresentasikan **tabel `products`** di MySQL.

```prisma
model Product {
```
Nama model = `Product` (singular, kapital). Prisma convention.

---

#### Field `id`

```prisma
id Int @id @default(autoincrement())
```

| Syntax | Arti |
|---|---|
| `id` | Nama kolom |
| `Int` | Tipe data Integer |
| `@id` | Primary Key |
| `@default(autoincrement())` | Nilai otomatis naik (1, 2, 3, ...) |

SQL yang dihasilkan: `id INT NOT NULL AUTO_INCREMENT PRIMARY KEY`

---

#### Field `name`

```prisma
name String @db.VarChar(255)
```

| Syntax | Arti |
|---|---|
| `String` | Tipe string di Prisma |
| `@db.VarChar(255)` | Di MySQL: `VARCHAR(255)` — max 255 karakter |

---

#### Field `description`

```prisma
description String? @db.Text
```

| Syntax | Arti |
|---|---|
| `String?` | Tanda `?` = **nullable** (boleh NULL) |
| `@db.Text` | Di MySQL: tipe `TEXT` — untuk teks panjang |

---

#### Field `price`

```prisma
price Float
```

- `Float` di Prisma = `DOUBLE` di MySQL
- Untuk harga yang butuh desimal (misalnya 99.99)

---

#### Field `stock`

```prisma
stock Int @default(0)
```

- `@default(0)` — jika tidak diisi, stok otomatis 0

---

#### Field `createdAt` dan `updatedAt`

```prisma
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
```

| Syntax | Arti |
|---|---|
| `DateTime` | Tipe tanggal + waktu |
| `@default(now())` | Otomatis diisi waktu saat INSERT |
| `@updatedAt` | Otomatis diperbarui saat UPDATE |

---

#### `@@map("products")`

```prisma
@@map("products")
```

- `@@` (double at) = **table-level attribute**
- `@@map` = mapping nama model ke nama tabel di database
- Tanpa ini, Prisma akan mencari tabel bernama `Product` (singular)
- Dengan ini, nama tabel di MySQL adalah `products` (plural, lowercase)

---

## Hasil di MySQL

Setelah `npx prisma migrate dev`, tabel yang dibuat:

```sql
CREATE TABLE `products` (
  `id`          INT          NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(255) NOT NULL,
  `description` TEXT,
  `price`       DOUBLE       NOT NULL,
  `stock`       INT          NOT NULL DEFAULT 0,
  `createdAt`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`   DATETIME(3)  NOT NULL,
  PRIMARY KEY (`id`)
);
```
