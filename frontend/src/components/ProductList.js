import React, { useEffect, useState } from "react";
import { fetchProducts } from "../api";
import { Link } from "react-router-dom";
import { useCart } from "../CartContext";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const { add } = useCart();

  useEffect(() => {
    loadProducts();
  }, [page]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProducts(page, 6); // 6 products per page
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Failed to load products:", error);
      setError(error.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    add(product, 1);
  };

  if (loading && products.length === 0) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <div>Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <div style={{ color: "red", marginBottom: "10px" }}>Error: {error}</div>
        <button onClick={loadProducts}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Products</h2>

      {loading && (
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          Loading more products...
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "15px",
              backgroundColor: "#fff",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ margin: "0 0 10px 0", fontSize: "18px" }}>
              <Link
                to={`/product/${product.id}`}
                style={{ textDecoration: "none", color: "#333" }}
              >
                {product.name}
              </Link>
            </h3>
            <p style={{ color: "#666", margin: "0 0 10px 0" }}>
              {product.description}
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#2c3e50",
                }}
              >
                ${product.price.toFixed(2)}
              </span>
              <button
                onClick={() => handleAddToCart(product)}
                style={{
                  backgroundColor: "#3498db",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#2980b9")
                }
                onMouseOut={(e) => (e.target.style.backgroundColor = "#3498db")}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {pagination && pagination.pages > 1 && (
        <div style={{ textAlign: "center" }}>
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            style={{
              margin: "0 5px",
              padding: "8px 16px",
              backgroundColor: page === 1 ? "#bdc3c7" : "#3498db",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: page === 1 ? "not-allowed" : "pointer",
            }}
          >
            Previous
          </button>

          <span style={{ margin: "0 15px" }}>
            Page {page} of {pagination.pages}
          </span>

          <button
            onClick={() => setPage(page + 1)}
            disabled={page === pagination.pages}
            style={{
              margin: "0 5px",
              padding: "8px 16px",
              backgroundColor:
                page === pagination.pages ? "#bdc3c7" : "#3498db",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: page === pagination.pages ? "not-allowed" : "pointer",
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
