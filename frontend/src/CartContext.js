import React, { createContext, useContext, useReducer, useEffect } from "react";

const CartContext = createContext();

// Configuration - easily adjustable
const MAX_QUANTITY_PER_ITEM = 999; // Increase this if you want higher limits
const MAX_TOTAL_ITEMS = 1000; // Maximum total items in cart

// Enhanced cart reducer with configurable limits
function cartReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const existing = state.items.find((i) => i.id === action.item.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === action.item.id
              ? {
                  ...i,
                  qty: Math.min(i.qty + action.qty, MAX_QUANTITY_PER_ITEM),
                }
              : i
          ),
        };
      }
      return {
        ...state,
        items: [
          ...state.items,
          { ...action.item, qty: Math.min(action.qty, MAX_QUANTITY_PER_ITEM) },
        ],
      };
    }
    case "REMOVE":
      return {
        ...state,
        items: state.items.filter((i) => i.id !== action.id),
      };
    case "UPDATE_QTY": {
      const { id, qty } = action;
      if (qty <= 0) {
        return {
          ...state,
          items: state.items.filter((i) => i.id !== id),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === id ? { ...i, qty: Math.min(qty, MAX_QUANTITY_PER_ITEM) } : i
        ),
      };
    }
    case "CLEAR":
      return { ...state, items: [] };
    case "LOAD_CART":
      return { ...state, items: action.items || [] };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        dispatch({ type: "LOAD_CART", items: cartData });
      } catch (error) {
        console.error("Failed to load cart from localStorage:", error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(state.items));
  }, [state.items]);

  const add = (item, qty = 1) => {
    if (!item || !item.id) {
      console.error("Invalid item provided to cart");
      return;
    }

    // Check total cart limit
    const currentTotalItems = state.items.reduce(
      (sum, item) => sum + item.qty,
      0
    );
    if (currentTotalItems + qty > MAX_TOTAL_ITEMS) {
      console.warn(
        `Cart limit reached. Maximum ${MAX_TOTAL_ITEMS} items allowed.`
      );
      return;
    }

    dispatch({ type: "ADD", item, qty });
  };

  const remove = (id) => {
    dispatch({ type: "REMOVE", id });
  };

  const updateQuantity = (id, qty) => {
    dispatch({ type: "UPDATE_QTY", id, qty });
  };

  const clear = () => {
    dispatch({ type: "CLEAR" });
  };

  const total = state.items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const itemCount = state.items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        add,
        remove,
        updateQuantity,
        clear,
        total,
        itemCount,
        maxQuantityPerItem: MAX_QUANTITY_PER_ITEM,
        maxTotalItems: MAX_TOTAL_ITEMS,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
