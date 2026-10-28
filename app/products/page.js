
"use client";

import { useEffect, useState } from "react";

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const response = await fetch("/api/products");
                const data = await response.json();

                setProducts(data);
            } catch (error) {
                console.error("Gagal mengambil produk:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, []);

    if (loading) {
        return <p>Memuat produk...</p>;
    }

    return (
        <main style={{ padding: "24px" }}>
            <h1>Daftar Produk</h1>

            {products.map((product) => (
                <div
                    key={product.id}
                    style={{
                        border: "1px solid #ddd",
                        padding: "16px",
                        marginBottom: "12px",
                        borderRadius: "8px",
                    }}
                >
                    <h2>{product.name}</h2>

                    <p>
                        Harga: Rp{product.price.toLocaleString("id-ID")}
                    </p>
                </div>
            ))}
        </main>
    );
}
