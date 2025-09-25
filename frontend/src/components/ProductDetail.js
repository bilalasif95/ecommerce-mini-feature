import React, { useEffect, useState } from "react";
import { fetchProduct } from "../api";
import { useParams, Link } from "react-router-dom";
import { useCart } from "../CartContext";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { add, maxQuantityPerItem } = useCart();

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProduct(id);
      setProduct(data);
    } catch (error) {
      console.error("Failed to load product:", error);
      setError(error.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product && quantity > 0) {
      add(product, quantity);
      setQuantity(1); // Reset quantity after adding
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= 1 && value <= maxQuantityPerItem) {
      setQuantity(value);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <div>Loading product details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <div style={{ color: "red", marginBottom: "10px" }}>Error: {error}</div>
        <button onClick={loadProduct}>Retry</button>
        <div style={{ marginTop: "20px" }}>
          <Link to="/" style={{ color: "#3498db", textDecoration: "none" }}>
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <div>Product not found</div>
        <div style={{ marginTop: "20px" }}>
          <Link to="/" style={{ color: "#3498db", textDecoration: "none" }}>
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ marginBottom: "20px" }}>
        <Link
          to="/"
          style={{
            color: "#3498db",
            textDecoration: "none",
            fontSize: "14px",
          }}
        >
          ← Back to Products
        </Link>
      </div>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "30px",
          backgroundColor: "#fff",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h1
          style={{
            margin: "0 0 20px 0",
            fontSize: "28px",
            color: "#2c3e50",
          }}
        >
          {product.name}
        </h1>

        <p
          style={{
            color: "#666",
            margin: "0 0 20px 0",
            fontSize: "16px",
            lineHeight: "1.5",
          }}
        >
          {product.description}
        </p>

        <div
          style={{
            fontSize: "32px",
            fontWeight: "bold",
            color: "#e74c3c",
            marginBottom: "30px",
          }}
        >
          ${product.price.toFixed(2)}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            marginBottom: "20px",
          }}
        >
          <label style={{ fontSize: "16px", fontWeight: "bold" }}>
            Quantity:
          </label>
          <input
            type="number"
            min="1"
            max={maxQuantityPerItem}
            value={quantity}
            onChange={handleQuantityChange}
            style={{
              width: "80px",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "16px",
              textAlign: "center",
            }}
          />
          <span style={{ fontSize: "12px", color: "#666" }}>
            (Max: {maxQuantityPerItem})
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          style={{
            backgroundColor: "#27ae60",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
            width: "100%",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#229954")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#27ae60")}
        >
          Add {quantity} to Cart
        </button>
      </div>
    </div>
  );
}
