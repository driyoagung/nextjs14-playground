# Penjelasan: API Routes (Endpoint CRUD)

Next.js App Router menggunakan **Route Handlers** — file `route.js` di dalam
folder `app/api/` yang secara otomatis menjadi endpoint HTTP.

---

## Struktur File

```
app/
  api/
    products/
      route.js          → /api/products     (GET, POST)
      [id]/
        route.js        → /api/products/1   (GET, PUT, DELETE)
```

Folder `[id]` dengan kurung siku = **dynamic segment**.
Next.js akan mencocokkan URL apapun seperti `/api/products/1`, `/api/products/99`, dll.

---

## File 1: `app/api/products/route.js`

### Endpoint GET `/api/products`

**Fungsi:** Mengambil semua produk dari database.

```js
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data produk" }, { status: 500 });
  }
}
```

| Bagian | Penjelasan |
|---|---|
| `export async function GET()` | Nama fungsi = method HTTP. Next.js otomatis menghubungkan GET request ke fungsi ini |
| `prisma.product.findMany()` | Prisma method = `SELECT * FROM products` |
| `orderBy: { createdAt: "desc" }` | Urutkan dari yang terbaru (ORDER BY createdAt DESC) |
| `NextResponse.json(data, { status })` | Kembalikan respons JSON dengan status code HTTP |
| `try/catch` | Tangkap error database agar tidak crash, kirim status 500 |

---

### Endpoint POST `/api/products`

**Fungsi:** Membuat produk baru.

```js
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description, price, stock } = body;

    if (!name || price === undefined) {
      return NextResponse.json({ error: "..." }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "..." }, { status: 500 });
  }
}
```

| Bagian | Penjelasan |
|---|---|
| `export async function POST(request)` | Parameter `request` berisi data kiriman client |
| `await request.json()` | Baca body request sebagai JavaScript object |
| Validasi `!name` | Cek apakah field wajib ada. Kirim 400 jika tidak |
| `prisma.product.create({ data: {...} })` | `INSERT INTO products (...)` |
| `parseFloat(price)` | Konversi string "99.99" ke angka 99.99 |
| `parseInt(stock) \|\| 0` | Konversi ke int, default 0 jika kosong |
| `status: 201` | 201 = "Created" — standar HTTP untuk resource baru |

---

## File 2: `app/api/products/[id]/route.js`

### Mengakses Parameter Dinamis

```js
export async function GET(request, { params }) {
  const id = parseInt(params.id);
  // ...
}
```

- Parameter kedua fungsi adalah objek konteks, yang berisi `params`
- `params.id` berisi nilai dari URL: `/api/products/5` → `params.id = "5"` (string)
- `parseInt()` mengkonversi ke integer karena ID di database bertipe `Int`

---

### Endpoint GET `/api/products/:id`

```js
const product = await prisma.product.findUnique({
  where: { id },
});

if (!product) {
  return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
}
```

- `findUnique({ where: { id } })` = `SELECT * FROM products WHERE id = ?`
- Jika tidak ditemukan (null), kembalikan 404

---

### Endpoint PUT `/api/products/:id`

```js
const product = await prisma.product.update({
  where: { id },
  data: { name, description, price: parseFloat(price), stock: parseInt(stock) || 0 },
});
```

- `prisma.product.update()` = `UPDATE products SET ... WHERE id = ?`
- Jika ID tidak ditemukan, Prisma melempar error dengan kode `P2025`

```js
if (error.code === "P2025") {
  return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
}
```

---

### Endpoint DELETE `/api/products/:id`

```js
await prisma.product.delete({
  where: { id },
});

return NextResponse.json({ message: "Produk berhasil dihapus" }, { status: 200 });
```

- `prisma.product.delete()` = `DELETE FROM products WHERE id = ?`
- Tidak mengembalikan data produk, hanya pesan konfirmasi

---

## Ringkasan Endpoint

| Method | URL | Fungsi | Status Sukses |
|---|---|---|---|
| GET | `/api/products` | Ambil semua produk | 200 |
| POST | `/api/products` | Buat produk baru | 201 |
| GET | `/api/products/:id` | Ambil satu produk | 200 |
| PUT | `/api/products/:id` | Update produk | 200 |
| DELETE | `/api/products/:id` | Hapus produk | 200 |

---

## Prisma Methods yang Digunakan

| Method Prisma | SQL Equivalent |
|---|---|
| `findMany({ orderBy })` | `SELECT * FROM products ORDER BY ...` |
| `findUnique({ where: { id } })` | `SELECT * FROM products WHERE id = ?` |
| `create({ data })` | `INSERT INTO products (...) VALUES (...)` |
| `update({ where, data })` | `UPDATE products SET ... WHERE id = ?` |
| `delete({ where: { id } })` | `DELETE FROM products WHERE id = ?` |
