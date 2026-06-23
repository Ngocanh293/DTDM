import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isLoggedIn, user, updateUserInfo } = useAuth();
  const [cartItems, setCartItems] = useState([]);

  // Fetch cart when logged in
  useEffect(() => {
    if (isLoggedIn) {
      apiClient.get('/cart')
        .then(res => {
          setCartItems(res.data || []);
        })
        .catch(console.error);
    } else {
      // Clear cart or load from local storage if needed when logged out
      setCartItems([]);
    }
  }, [isLoggedIn]);

  const addToCart = async (product) => {
    if (!isLoggedIn) {
        alert("Vui lòng đăng nhập để thêm vào giỏ hàng");
        return;
    }
    
    // Optistic UI Update
    setCartItems(prev => {
      const existing = prev.find(i => i.productId === product.productId);
      if (existing) {
        return prev.map(i =>
          i.productId === product.productId
            ? { ...i, quantity: i.quantity + (product.quantity || 1) }
            : i
        );
      }
      return [...prev, { ...product, quantity: product.quantity || 1 }];
    });

    try {
      await apiClient.post('/cart/add', {
        productId: product.productId,
        quantity: product.quantity || 1
      });
    } catch (err) {
      console.error(err);
      // Re-fetch to sync if error
      apiClient.get('/cart').then(res => setCartItems(res.data)).catch(console.error);
    }
  };

  const removeFromCart = async (productId) => {
    if (!isLoggedIn) return;
    
    setCartItems(prev => prev.filter(i => i.productId !== productId));
    
    try {
      await apiClient.delete(`/cart/remove/${productId}`);
    } catch (err) {
      console.error(err);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!isLoggedIn) return;
    
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prev =>
      prev.map(i => i.productId === productId ? { ...i, quantity } : i)
    );
    
    try {
      await apiClient.put('/cart/update', { productId, quantity });
    } catch (err) {
      console.error(err);
    }
  };

  const clearCart = async () => {
    if (!isLoggedIn) return;
    
    setCartItems([]);
    try {
      await apiClient.delete('/cart/clear');
    } catch (err) {
      console.error(err);
    }
  };

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
