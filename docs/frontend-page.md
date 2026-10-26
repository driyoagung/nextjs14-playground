# Penjelasan: app/products/page.js (Halaman UI)

File ini adalah **frontend** dari aplikasi CRUD. Ini adalah React Client Component
yang menangani semua interaksi user: menampilkan data, membuka modal, validasi form,
dan mengirim request ke API.

---

## Mengapa `"use client"`?

```js
"use client";
```

Di Next.js App Router, semua komponen secara default adalah **Server Component**
(dirender di server, tidak bisa pakai hooks React).

Kita menambahkan `"use client"` di baris pertama karena halaman ini menggunakan:
- `useState` — untuk menyimpan state (data produk, status modal, dll)
- `useEffect` — untuk menjalankan kode saat komponen pertama mount
- Event handler (onClick, onChange) — hanya bisa di client

---

## State yang Digunakan

```js
const [products, setProducts]           = useState([]);
const [status, setStatus]               = useState("loading");
const [modal, setModal]                 = useState(null);
const [selectedProduct, setSelectedProduct] = useState(null);
const [form, setForm]                   = useState(EMPTY_FORM);
const [formErrors, setFormErrors]       = useState({});
const [submitting, setSubmitting]       = useState(false);
const [toast, setToast]                 = useState(null);
```

| State | Tipe | Fungsi |
|---|---|---|
| `products` | Array | Menyimpan semua data produk dari database |
| `status` | String | `"loading"`, `"success"`, atau `"error"` — menentukan tampilan |
| `modal` | String/null | `"create"`, `"edit"`, `"delete"`, atau `null` (tutup) |
| `selectedProduct` | Object/null | Produk yang sedang diedit atau dihapus |
| `form` | Object | Nilai semua input field di form |
| `formErrors` | Object | Pesan error validasi per field |
| `submitting` | Boolean | `true` saat request sedang berlangsung |
| `toast` | Object/null | Data notifikasi popup sementara |

---

## `useCallback` dan `useEffect`

```js
const fetchProducts = useCallback(async () => {
  setStatus("loading");
  try {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
    setStatus("success");
  } catch (err) {
    setStatus("error");
  }
}, []);

useEffect(() => {
  fetchProducts();
}, [fetchProducts]);
```

### `useCallback`
- Membungkus `fetchProducts` agar fungsi ini tidak dibuat ulang setiap render
- Tanpa `useCallback`, fungsi baru dibuat setiap render → `useEffect` terus terpanggil ulang
- Array dependensi `[]` kosong = fungsi tidak pernah berubah

### `useEffect`
- Dijalankan **setelah** komponen pertama kali muncul di layar
- Array dependensi `[fetchProducts]` = jalankan ulang jika `fetchProducts` berubah
  (tapi karena `useCallback` dengan `[]`, ini hanya jalan sekali)
- Ini yang memuat data produk saat halaman dibuka

---

## Computed Property Name pada `handleFormChange`

```js
const handleFormChange = (e) => {
  const { name, value } = e.target;
  setForm((prev) => ({ ...prev, [name]: value }));
};
```

- `[name]` adalah **computed property name** di JavaScript
- Karena semua input punya atribut `name` (misal `name="price"`),
  satu handler bisa mengupdate semua field
- Tanpa ini, kita butuh handler terpisah untuk setiap input:
  `handleNameChange`, `handlePriceChange`, dst.

---

## Spread Operator pada Update State

```js
setForm((prev) => ({ ...prev, [name]: value }));
```

- `prev` = nilai state form sebelumnya (object)
- `...prev` = salin semua property lama
- `[name]: value` = timpa property yang namanya sesuai input yang diubah
- Hasilnya: object baru dengan semua field yang sama, kecuali field yang baru saja diubah

Contoh: form = `{ name: "Sepatu", price: "100", stock: "5" }`
User mengubah price → `{ name: "Sepatu", price: "200", stock: "5" }`

---

## Fetch CRUD ke API

### Create (POST)
```js
const res = await fetch("/api/products", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(form),
});
```

### Update (PUT)
```js
const res = await fetch(`/api/products/${selectedProduct.id}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(form),
});
```

### Delete (DELETE)
```js
const res = await fetch(`/api/products/${selectedProduct.id}`, {
  method: "DELETE",
});
```

Pola yang sama di setiap operasi:
1. `fetch(url, options)` — kirim request ke API Route
2. `await res.json()` — baca respons sebagai JSON
3. Cek `res.ok` — true jika status 200-299, false jika error
4. Panggil `fetchProducts()` untuk refresh data

---

## Tiga State UI

```jsx
{/* Loading */}
{status === "loading" && <Spinner />}

{/* Error */}
{status === "error" && <ErrorMessage />}

{/* Empty */}
{status === "success" && products.length === 0 && <EmptyState />}

{/* Data ada */}
{status === "success" && products.length > 0 && <Table />}
```

Ini disebut **conditional rendering** — menampilkan elemen berbeda berdasarkan kondisi.
Setiap kondisi dijaga dengan operator `&&` (short-circuit evaluation):
jika kondisi kiri `false`, React tidak akan merender apapun.

---

## Modal sebagai State

```js
const [modal, setModal] = useState(null);

// Buka modal create:
setModal("create");

// Buka modal edit:
setModal("edit");

// Tutup:
setModal(null);
```

Modal tidak dibuat sebagai komponen terpisah dengan show/hide, melainkan
dikontrol lewat satu state string. Ini adalah pola umum React yang sederhana.

```jsx
{modal === "create" && <ModalCreate />}
{modal === "edit"   && <ModalEdit />}
{modal === "delete" && <ModalDelete />}
```

---

## Accessibility pada Modal

```jsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-create-title"
  onClick={(e) => e.target === e.currentTarget && closeModal()}
  onKeyDown={(e) => e.key === "Escape" && closeModal()}
>
```

| Atribut | Fungsi |
|---|---|
| `role="dialog"` | Memberitahu screen reader bahwa ini adalah dialog |
| `aria-modal="true"` | Memberi tahu screen reader fokus ada di modal |
| `aria-labelledby` | Menghubungkan modal dengan judulnya untuk screen reader |
| `e.target === e.currentTarget` | Klik backdrop (bukan isi modal) = tutup |
| `e.key === "Escape"` | Tekan Escape = tutup modal |

---

## `Intl.NumberFormat` untuk Format Rupiah

```js
const formatRupiah = (num) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num);
```

- `Intl.NumberFormat` adalah API bawaan browser untuk format angka sesuai locale
- `"id-ID"` = format Indonesia (titik sebagai pemisah ribuan)
- `style: "currency"` = tambahkan simbol mata uang
- `currency: "IDR"` = Rupiah Indonesia
- `minimumFractionDigits: 0` = tidak tampilkan koma desimal (99.000 bukan 99.000,00)

Hasil: `150000` → `"Rp 150.000"`
