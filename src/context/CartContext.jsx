import { createContext, useContext, useState, useEffect } from "react";
import cartApi from "@/api/cartApi";
import { useAuthContext } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuthContext();
  const [cart, setCart] = useState([]); // Chứa danh sách items
  const [cartCount, setCartCount] = useState(0); // Tổng số lượng để hiện Badge

  // Hàm này để gọi API lấy dữ liệu mới nhất từ Server
const refreshCart = async () => {
  if (!user) {
    setCart([]);
    setCartCount(0);
    return;
  }

  try {
    const res = await cartApi.getCart();
    const items = res.items || [];
    setCart(items);
    const count = items.reduce((total, item) => total + item.quantity, 0);
    setCartCount(count);
  } catch (error) {
    // Nếu vẫn lỗi 401 (do token hết hạn chẳng hạn)
    if (error.response?.status === 401) {
       setCart([]);
       setCartCount(0);
    }
    console.error("Lỗi giỏ hàng:", error);
  }
};

useEffect(() => {
    if (window.location.pathname.startsWith("/admin")) return;

    if (user) {
      refreshCart();
    } else {
      setCart([]);
      // Sửa chỗ này nè! Nếu state của bạn là cartCount thì phải là setCartCount
      setCartCount(0); 
    }
  }, [user]);

  return (
    <CartContext.Provider value={{ cart, cartCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);