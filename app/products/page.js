"use client";
// app/products/page.js
// Halaman utama CRUD Products
//
// "use client" wajib karena halaman ini menggunakan:
//   - useState: menyimpan state (data produk, loading, modal, dll)
//   - useEffect: menjalankan fetch saat halaman pertama kali dimuat
//
// Ini adalah SPA (Single Page Application) — semua operasi CRUD
// terjadi di halaman ini tanpa navigasi ke halaman lain.
// Data diambil/dikirim ke API Route via fetch().

import { useState, useEffect, useCallback } from "react";
import "./products.css";

// ─── Konstanta ───────────────────────────────────────────────────────────────

// Nilai awal untuk form (kosong)
const EMPTY_FORM = { name: "", description: "", price: "", stock: "" };

// ─── Komponen Form (di luar ProductsPage!) ────────────────────────────────────
// PENTING: Komponen ini HARUS didefinisikan di luar ProductsPage.
// Jika didefinisikan di dalam, React akan membuat identity komponen baru setiap
// kali ProductsPage re-render (misal saat ketik 1 karakter → setForm dipanggil).
// Akibatnya React unmount + mount ulang form → autoFocus selalu kembali ke field pertama.
// Dengan memindahkannya ke luar, identity komponen stabil antar render.
function ProductForm({ form, formErrors, onSubmit, onChange, onClose, submitting, submitLabel }) {
  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="modal-body">
        {/* Field Nama */}
        <div className="form-group">
          <label htmlFor="field-name" className="form-label">
            Nama Produk <span className="required">*</span>
          </label>
          <input
            id="field-name"
            type="text"
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="Contoh: Sepatu Lari Nike"
            className="form-input"
            autoFocus
          />
          {formErrors.name && <p className="form-error">{formErrors.name}</p>}
        </div>

        {/* Field Deskripsi */}
        <div className="form-group">
          <label htmlFor="field-description" className="form-label">Deskripsi</label>
          <textarea
            id="field-description"
            name="description"
            value={form.description}
            onChange={onChange}
            placeholder="Deskripsi produk (opsional)..."
            className="form-textarea"
            rows={3}
          />
        </div>

        {/* Field Harga dan Stok (2 kolom) */}
        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="field-price" className="form-label">
              Harga (Rp) <span className="required">*</span>
            </label>
            <input
              id="field-price"
              type="number"
              name="price"
              value={form.price}
              onChange={onChange}
              placeholder="0"
              min="0"
              step="0.01"
              className="form-input"
            />
            {formErrors.price && <p className="form-error">{formErrors.price}</p>}
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="field-stock" className="form-label">Stok</label>
            <input
              id="field-stock"
              type="number"
              name="stock"
              value={form.stock}
              onChange={onChange}
              placeholder="0"
              min="0"
              className="form-input"
            />
            {formErrors.stock && <p className="form-error">{formErrors.stock}</p>}
          </div>
        </div>
      </div>

      <div className="modal-footer">
        <button type="button" onClick={onClose} className="btn btn-secondary" disabled={submitting}>
          Batal
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Menyimpan..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

// ─── Komponen Utama ──────────────────────────────────────────────────────────
export default function ProductsPage() {
  // ── State ─────────────────────────────────────────────────────────────────

  // products: array berisi semua produk dari database
  const [products, setProducts] = useState([]);

  // status: "loading" | "error" | "success" — untuk render kondisional
  const [status, setStatus] = useState("loading");

  // modal: null | "create" | "edit" | "delete" — modal mana yang terbuka
  const [modal, setModal] = useState(null);

  // selectedProduct: produk yang sedang diedit/dihapus
  const [selectedProduct, setSelectedProduct] = useState(null);

  // form: nilai field input di modal create/edit
  const [form, setForm] = useState(EMPTY_FORM);

  // formErrors: pesan error validasi per field
  const [formErrors, setFormErrors] = useState({});

  // submitting: true saat request sedang berjalan (untuk disable tombol)
  const [submitting, setSubmitting] = useState(false);

  // toast: { message, type } untuk notifikasi popup sementara
  const [toast, setToast] = useState(null);

  // ── Fungsi Helper ─────────────────────────────────────────────────────────

  // showToast: tampilkan notifikasi selama 3 detik lalu hilang
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // closeModal: tutup semua modal dan reset state terkait
  const closeModal = () => {
    setModal(null);
    setSelectedProduct(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
  };

  // ── Fetch Data ────────────────────────────────────────────────────────────

  // fetchProducts: ambil semua produk dari API
  // useCallback agar fungsi tidak dibuat ulang setiap render
  const fetchProducts = useCallback(async () => {
    setStatus("loading");
    try {
      // fetch() memanggil API Route GET /api/products
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Gagal mengambil data");
      const data = await res.json();
      setProducts(data);
      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }, []);

  // useEffect: jalankan fetchProducts saat komponen pertama kali mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ── Validasi Form ──────────────────────────────────────────────────────────

  const validateForm = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Nama produk wajib diisi";
    if (!form.price) {
      errors.price = "Harga wajib diisi";
    } else if (isNaN(parseFloat(form.price)) || parseFloat(form.price) < 0) {
      errors.price = "Harga harus berupa angka positif";
    }
    if (form.stock && (isNaN(parseInt(form.stock)) || parseInt(form.stock) < 0)) {
      errors.stock = "Stok harus berupa angka positif";
    }
    setFormErrors(errors);
    // Return true jika tidak ada error
    return Object.keys(errors).length === 0;
  };

  // ── Handler Perubahan Form ─────────────────────────────────────────────────

  // handleFormChange: update state form saat user mengetik
  // Menggunakan computed property name: [e.target.name] agar satu handler
  // bisa dipakai untuk semua input
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Hapus error field ini saat user mulai mengetik
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // ── CRUD Handlers ─────────────────────────────────────────────────────────

  // handleCreate: kirim POST ke /api/products
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form), // Kirim form sebagai JSON
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Gagal membuat produk");

      // Refresh daftar produk setelah berhasil
      await fetchProducts();
      closeModal();
      showToast("Produk berhasil ditambahkan!");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // handleEdit: buka modal edit dan isi form dengan data produk
  const handleEdit = (product) => {
    setSelectedProduct(product);
    // Isi form dengan data produk yang dipilih
    setForm({
      name:        product.name,
      description: product.description || "",
      price:       String(product.price),
      stock:       String(product.stock),
    });
    setModal("edit");
  };

  // handleUpdate: kirim PUT ke /api/products/:id
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${selectedProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Gagal mengupdate produk");

      await fetchProducts();
      closeModal();
      showToast("Produk berhasil diperbarui!");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // handleDeleteConfirm: buka modal konfirmasi hapus
  const handleDeleteConfirm = (product) => {
    setSelectedProduct(product);
    setModal("delete");
  };

  // handleDelete: kirim DELETE ke /api/products/:id
  const handleDelete = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${selectedProduct.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Gagal menghapus produk");

      await fetchProducts();
      closeModal();
      showToast("Produk berhasil dihapus!");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Derived Data ───────────────────────────────────────────────────────────

  // Hitung statistik ringkas
  const totalProducts = products.length;
  const totalStock    = products.reduce((sum, p) => sum + p.stock, 0);
  const totalValue    = products.reduce((sum, p) => sum + p.price * p.stock, 0);

  // ── Format Harga ke Rupiah ─────────────────────────────────────────────────
  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);

  // ── Tentukan class badge stok ──────────────────────────────────────────────
  const stockBadgeClass = (stock) => {
    if (stock === 0)  return "stock-badge stock-empty";
    if (stock <= 5)   return "stock-badge stock-low";
    return "stock-badge stock-ok";
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="products-page">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="page-header">
        <div className="page-header-inner">
          <h1 className="page-title">
            Manajemen <span>Produk</span>
          </h1>
          <button
            id="btn-add-product"
            onClick={() => setModal("create")}
            className="btn btn-primary"
          >
            + Tambah Produk
          </button>
        </div>
      </header>

      {/* ── Konten Utama ───────────────────────────────────────────── */}
      <main className="page-content">
        {/* Kartu Statistik — hanya tampil jika ada produk */}
        {status === "success" && products.length > 0 && (
          <div className="stats-row" aria-label="Ringkasan statistik produk">
            <div className="stat-card">
              <p className="stat-label">Total Produk</p>
              <p className="stat-value">{totalProducts}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Total Stok</p>
              <p className="stat-value">{totalStock.toLocaleString("id-ID")}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Nilai Inventaris</p>
              <p className="stat-value green">{formatRupiah(totalValue)}</p>
            </div>
          </div>
        )}

        {/* ── Tabel Produk ─────────────────────────────────────────── */}
        <div className="table-wrapper">
          <div className="table-header">
            <span className="table-title">
              {status === "success" ? `${totalProducts} produk terdaftar` : "Daftar Produk"}
            </span>
          </div>

          {/* State: Loading */}
          {status === "loading" && (
            <div className="state-container" aria-live="polite">
              <div className="spinner" role="status" aria-label="Memuat data..." />
              <p className="state-title">Memuat data produk...</p>
            </div>
          )}

          {/* State: Error */}
          {status === "error" && (
            <div className="state-container" role="alert">
              <p className="state-icon">⚠️</p>
              <p className="state-title">Gagal memuat data</p>
              <p className="state-desc">
                Pastikan database MySQL berjalan dan koneksi dikonfigurasi dengan benar.
              </p>
              <button onClick={fetchProducts} className="btn btn-primary btn-sm">
                Coba Lagi
              </button>
            </div>
          )}

          {/* State: Empty */}
          {status === "success" && products.length === 0 && (
            <div className="state-container">
              <p className="state-icon">📦</p>
              <p className="state-title">Belum ada produk</p>
              <p className="state-desc">Mulai dengan menambahkan produk pertama Anda.</p>
              <button onClick={() => setModal("create")} className="btn btn-primary btn-sm">
                Tambah Produk Pertama
              </button>
            </div>
          )}

          {/* State: Data Ada */}
          {status === "success" && products.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table className="product-table" aria-label="Tabel produk">
                <thead>
                  <tr>
                    <th>Produk</th>
                    <th>Deskripsi</th>
                    <th>Harga</th>
                    <th>Tgl Dibuat</th>
                    <th>Stok</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      {/* Kolom Nama */}
                      <td>
                        <p className="product-name">{product.name}</p>
                        <p className="product-desc">ID: {product.id}</p>
                      </td>

                      {/* Kolom Deskripsi */}
                      <td>
                        <span style={{ color: "var(--color-muted)", fontSize: "0.85rem" }}>
                          {product.description || "—"}
                        </span>
                      </td>

                      {/* Kolom Harga */}
                      <td>
                        <span className="product-price">{formatRupiah(product.price)}</span>
                      </td>

                      {/* Kolom Tanggal */}
                      <td style={{ color: "var(--color-muted)", fontSize: "0.82rem" }}>
                        {new Date(product.createdAt).toLocaleDateString("id-ID", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </td>

                      {/* Kolom Stok */}
                      <td>
                        <span className={stockBadgeClass(product.stock)}>
                          {product.stock === 0 ? "Habis" : product.stock}
                        </span>
                      </td>

                      {/* Kolom Aksi */}
                      <td>
                        <div className="actions-cell">
                          <button
                            id={`btn-edit-${product.id}`}
                            onClick={() => handleEdit(product)}
                            className="btn btn-edit"
                            aria-label={`Edit produk ${product.name}`}
                          >
                            Edit
                          </button>
                          <button
                            id={`btn-delete-${product.id}`}
                            onClick={() => handleDeleteConfirm(product)}
                            className="btn btn-danger"
                            aria-label={`Hapus produk ${product.name}`}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ── Modal: Tambah Produk ─────────────────────────────────── */}
      {modal === "create" && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-create-title"
          onClick={(e) => e.target === e.currentTarget && closeModal()} // Klik backdrop = tutup
          onKeyDown={(e) => e.key === "Escape" && closeModal()}         // Escape = tutup
        >
          <div className="modal">
            <div className="modal-header">
              <h2 id="modal-create-title" className="modal-title">Tambah Produk Baru</h2>
              <button onClick={closeModal} className="modal-close" aria-label="Tutup modal">×</button>
            </div>
            <ProductForm
              onSubmit={handleCreate}
              submitLabel="Tambah Produk"
              form={form}
              formErrors={formErrors}
              onChange={handleFormChange}
              onClose={closeModal}
              submitting={submitting}
            />
          </div>
        </div>
      )}

      {/* ── Modal: Edit Produk ──────────────────────────────────── */}
      {modal === "edit" && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-edit-title"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
          onKeyDown={(e) => e.key === "Escape" && closeModal()}
        >
          <div className="modal">
            <div className="modal-header">
              <h2 id="modal-edit-title" className="modal-title">Edit Produk</h2>
              <button onClick={closeModal} className="modal-close" aria-label="Tutup modal">×</button>
            </div>
            <ProductForm
              onSubmit={handleUpdate}
              submitLabel="Simpan Perubahan"
              form={form}
              formErrors={formErrors}
              onChange={handleFormChange}
              onClose={closeModal}
              submitting={submitting}
            />
          </div>
        </div>
      )}

      {/* ── Modal: Konfirmasi Hapus ─────────────────────────────── */}
      {modal === "delete" && selectedProduct && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-delete-title"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
          onKeyDown={(e) => e.key === "Escape" && closeModal()}
        >
          <div className="modal">
            <div className="modal-header">
              <h2 id="modal-delete-title" className="modal-title">Hapus Produk</h2>
              <button onClick={closeModal} className="modal-close" aria-label="Tutup modal">×</button>
            </div>
            <div className="modal-body">
              <p className="confirm-text">
                Anda akan menghapus produk{" "}
                <span className="confirm-name">&ldquo;{selectedProduct.name}&rdquo;</span>.
                Tindakan ini tidak bisa dibatalkan.
              </p>
            </div>
            <div className="modal-footer">
              <button onClick={closeModal} className="btn btn-secondary" disabled={submitting}>
                Batal
              </button>
              <button
                id="btn-confirm-delete"
                onClick={handleDelete}
                className="btn btn-primary"
                style={{ backgroundColor: "var(--color-danger)" }}
                disabled={submitting}
              >
                {submitting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notifikasi ─────────────────────────────────────── */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`toast toast-${toast.type}`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
