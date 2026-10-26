// app/api/products/route.js
// API Route untuk:
//   GET  /api/products  -> Ambil semua produk
//   POST /api/products  -> Buat produk baru

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ─── GET: Ambil semua produk ────────────────────────────────────────────────
// Dipanggil ketika browser melakukan GET ke /api/products
export async function GET() {
  try {
    // prisma.product.findMany() = SELECT * FROM products ORDER BY createdAt DESC
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" }, // Urutkan dari yang terbaru
    });

    // Kembalikan data dalam format JSON dengan status 200
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data produk" },
      { status: 500 }
    );
  }
}

// ─── POST: Buat produk baru ─────────────────────────────────────────────────
// Dipanggil ketika browser melakukan POST ke /api/products
// Body request harus berisi: { name, description, price, stock }
export async function POST(request) {
  try {
    // request.json() membaca body request sebagai JSON
    const body = await request.json();
    const { name, description, price, stock } = body;

    // Validasi: field wajib
    if (!name || price === undefined) {
      return NextResponse.json(
        { error: "Field 'name' dan 'price' wajib diisi" },
        { status: 400 }
      );
    }

    // prisma.product.create() = INSERT INTO products (name, description, price, stock) VALUES (...)
    const product = await prisma.product.create({
      data: {
        name,
        description: description || null, // Jika kosong, simpan null
        price: parseFloat(price),         // Pastikan tipe data Float
        stock: parseInt(stock) || 0,      // Pastikan tipe data Integer
      },
    });

    // Kembalikan produk yang baru dibuat dengan status 201 (Created)
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      { error: "Gagal membuat produk baru" },
      { status: 500 }
    );
  }
}
