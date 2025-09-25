import React from "react";
import { useCart } from "../CartContext";

export default function Cart() {
  const { items, remove, total, clear } = useCart();
  return (
    <div>
      <h2>Cart</h2>
      {items.length === 0 ? (
        <div>Cart is empty</div>
      ) : (
        <div>
          <ul>
            {items.map((i) => (
              <li key={i.id}>
                {i.name} x {i.qty} — ${(i.price * i.qty).toFixed(2)}
                <button onClick={() => remove(i.id)} style={{ marginLeft: 8 }}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <div>
            <strong>Total: ${total.toFixed(2)}</strong>
          </div>
          <button onClick={clear}>Clear cart</button>
        </div>
      )}
    </div>
  );
}
