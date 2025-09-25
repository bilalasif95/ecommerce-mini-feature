import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import ProductList from "./components/ProductList";
import ProductDetail from "./components/ProductDetail";
import Cart from "./components/Cart";
import Login from "./components/Login";
import { useAuth } from "./AuthContext";

export default function App() {
  const { token, logout } = useAuth();
  return (
    <div style={{ padding: 20 }}>
      <header>
        <nav>
          <Link to="/">Products</Link> | <Link to="/cart">Cart</Link> |{" "}
          {token ? (
            <button onClick={logout}>Logout</button>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </div>
  );
}
