// lib/prisma.js
// Singleton Prisma Client untuk Next.js
//
// Masalah: Di Next.js development mode, hot-reload membuat modul di-load ulang.
// Jika kita langsung "new PrismaClient()" di setiap file, akan ada ratusan
// koneksi database yang terbuka. Solusinya: simpan instance di global object.
//
// Di production: "global.prisma" tidak dipakai karena hot-reload tidak terjadi.

import { PrismaClient } from "@prisma/client";

// PrismaClient disimpan di global agar tidak terbuat ulang saat hot-reload (development)
const globalForPrisma = global;

// Gunakan instance yang sudah ada, atau buat baru jika belum ada
const prisma = globalForPrisma.prisma ?? new PrismaClient();

// Di development, simpan di global supaya hot-reload tidak membuat instance baru
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
