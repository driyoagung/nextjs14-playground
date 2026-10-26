// app/api/products/[id]/route.js
// API Route untuk operasi pada produk tertentu berdasarkan ID:
//   GET    /api/products/:id  -> Ambil satu produk
//   PUT    /api/products/:id  -> Update produk
//   DELETE /api/products/:id  -> Hapus produk
//
// [id] adalah dynamic segment — Next.js otomatis mengisi nilai dari URL

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ─── GET: Ambil satu produk berdasarkan ID ───────────────────────────────────
export async function GET(request, { params }) {
  try {
    const id = parseInt(params.id); // Ambil :id dari URL, konversi ke integer

    // prisma.product.findUnique() = SELECT * FROM products WHERE id = ?
    const product = await prisma.product.findUnique({
      where: { id },
    });

    // Jika produk tidak ditemukan, kembalikan 404
    if (!product) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error(`GET /api/products/${params.id} error:`, error);
    return NextResponse.json(
      { error: "Gagal mengambil data produk" },
      { status: 500 }
    );
  }
}

// ─── PUT: Update produk ──────────────────────────────────────────────────────
export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { name, description, price, stock } = body;

    // Validasi: field wajib
    if (!name || price === undefined) {
      return NextResponse.json(
        { error: "Field 'name' dan 'price' wajib diisi" },
        { status: 400 }
      );
    }

    // prisma.product.update() = UPDATE products SET ... WHERE id = ?
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description: description || null,
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
      },
    });

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    // Kode P2025 = record tidak ditemukan di Prisma
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }
    console.error(`PUT /api/products/${params.id} error:`, error);
    return NextResponse.json(
      { error: "Gagal mengupdate produk" },
      { status: 500 }
    );
  }
}

// ─── DELETE: Hapus produk ────────────────────────────────────────────────────
export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id);

    // prisma.product.delete() = DELETE FROM products WHERE id = ?
    await prisma.product.delete({
      where: { id },
    });

    // Status 200 dengan pesan konfirmasi
    return NextResponse.json(
      { message: "Produk berhasil dihapus" },
      { status: 200 }
    );
  } catch (error) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }
    console.error(`DELETE /api/products/${params.id} error:`, error);
    return NextResponse.json(
      { error: "Gagal menghapus produk" },
      { status: 500 }
    );
  }
}
