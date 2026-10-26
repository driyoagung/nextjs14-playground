# Penjelasan: lib/prisma.js

File ini membuat satu instance Prisma Client yang dipakai oleh seluruh aplikasi.

---

## Masalah yang Dipecahkan

Di **Next.js development mode**, setiap kali kita menyimpan file, Next.js melakukan
**hot-reload** (modul JavaScript di-load ulang).

Jika kita langsung melakukan ini di setiap API Route:

```js
// BURUK — jangan lakukan ini
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient(); // Ini akan membuat koneksi baru setiap hot-reload!
```

Hasilnya: setelah beberapa kali hot-reload, ada **ratusan koneksi database** yang terbuka
sekaligus. MySQL punya batas koneksi (biasanya 151), dan ini akan menyebabkan error.

---

## Solusi: Singleton Pattern dengan Global Object

```js
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global;

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

---

## Penjelasan Baris per Baris

### `const globalForPrisma = global`

```js
const globalForPrisma = global;
```

- `global` adalah objek global Node.js (seperti `window` di browser)
- Isinya tidak terhapus saat hot-reload karena berada di luar module scope
- Kita simpan referensinya ke variabel agar TypeScript-friendly (untuk proyek TS)

---

### Nullish Coalescing: `??`

```js
const prisma = globalForPrisma.prisma ?? new PrismaClient();
```

Operator `??` (nullish coalescing) artinya:
- Jika `globalForPrisma.prisma` sudah ada (tidak null/undefined), **gunakan yang sudah ada**
- Jika belum ada, **buat yang baru** dengan `new PrismaClient()`

Saat pertama kali: `globalForPrisma.prisma` = undefined, jadi dibuat baru.
Saat hot-reload: `globalForPrisma.prisma` sudah ada, jadi dipakai yang lama.

---

### Simpan ke Global (hanya development)

```js
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

- Di **development**: simpan instance ke `global` supaya hot-reload tidak buat baru
- Di **production**: tidak perlu, karena tidak ada hot-reload

---

### Export Default

```js
export default prisma;
```

Instance ini di-import di semua API Route:

```js
import prisma from "@/lib/prisma";
// "@/" adalah alias untuk root folder project (dikonfigurasi di jsconfig.json)
```

---

## Ringkasan Alur

```
Hot-reload pertama:
  global.prisma = undefined
  → new PrismaClient() dibuat
  → disimpan ke global.prisma

Hot-reload kedua:
  global.prisma = [instance yang sudah ada]
  → tidak dibuat yang baru
  → pakai instance lama
```
