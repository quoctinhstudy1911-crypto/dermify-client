import { createContext, useContext, useState, useEffect } from "react";
import cartApi from "@/api/cartApi";
import { useAuthContext } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuthContext();
  
  // Giữ cả cart data và tổng số lượng để hiển thị trên Navbar
  const [cart, setCart] = useState({ items: [] }); 
  const [cartCount, setCartCount] = useState(0);

  const refreshCart = async () => {
    // Nếu chưa đăng nhập hoặc là trang admin thì reset giỏ hàng
    if (!user || window.location.pathname.startsWith("/admin")) {
      setCart({ items: [] });
      setCartCount(0);
      return;
    }

    try {

      const res = await cartApi.getCart();
      
      // Kiểm tra cấu trúc trả về để đảm bảo luôn có thuộc tính items
      const cartData = res?.items ? res : { items: res || [] };
      
      setCart(cartData);

      const count = (cartData.items || []).reduce((total, item) => total + item.quantity, 0);
      setCartCount(count);
      
    } catch (error) {
      if (error.status === 401) {
         setCart({ items: [] });
         setCartCount(0);
      }
      console.error("Lỗi giỏ hàng:", error.message);
    }
  };

  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      setCart({ items: [] });
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