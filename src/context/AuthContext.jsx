import { createContext, useContext, useState, useEffect } from "react";
import { userApi, cartApi } from "@/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true); // 🔥 thêm loading

  // ✅ CHECK LOGIN
  const isLoggedIn = () => {
    return !!localStorage.getItem("accessToken");
  };

  // ✅ GET USER
  const fetchMe = async () => {
    if (!isLoggedIn()) {
      setUser(null);
      return;
    }

    try {
      const res = await userApi.getProfile();
      setUser(res);
    } catch (err) {
      // 🔥 token sai / hết hạn
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
    }
  };

  // ✅ GET CART (FIX 401)
  const fetchCart = async () => {
    if (!isLoggedIn()) {
      setCartCount(0);
      return;
    }

    try {
      const res = await cartApi.getCart();
      setCartCount(res.items?.length || 0);
    } catch {
      setCartCount(0);
    }
  };

  // ✅ LOAD LẦN ĐẦU
  useEffect(() => {
    const init = async () => {
      await fetchMe();
      await fetchCart();
      setLoading(false);
    };

    init();
  }, []);

  // ✅ SAU LOGIN
  const loginSuccess = async () => {
    await fetchMe();
    await fetchCart();
  };

  // ✅ LOGOUT
  const logout = () => {
    localStorage.clear();
    setUser(null);
    setCartCount(0);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        cartCount,
        loading,
        loginSuccess,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ✅ HOOK
export const useAuthContext = () => useContext(AuthContext);