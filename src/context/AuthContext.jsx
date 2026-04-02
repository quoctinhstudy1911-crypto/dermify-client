import { createContext, useContext, useState, useEffect } from "react";
import { cartApi } from "@/api";
import authApi from "@/api/authApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored || stored === "undefined") return null;
      return JSON.parse(stored);
    } catch {
      return null;
    }
  });

  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // ======================
  // CHECK LOGIN
  // ======================
  const isLoggedIn = () => {
    return !!localStorage.getItem("accessToken");
  };

  // ======================
  // GET USER (QUAN TRỌNG)
  // ======================
  const fetchMe = async () => {
    if (!isLoggedIn()) {
      setUser(null);
      return;
    }

    try {
      // ưu tiên cache
      const cachedUser = localStorage.getItem("user");

      if (cachedUser && cachedUser !== "undefined") {
        const parsed = JSON.parse(cachedUser);
        setUser(parsed);
        return;
      }

      // gọi API đúng
      const res = await authApi.getMe();

      setUser(res);
      localStorage.setItem("user", JSON.stringify(res));
    } catch (err) {
      console.log("AUTH ERROR:", err);

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      setUser(null);
    }
  };

  // ======================
  // GET CART
  // ======================
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

  // ======================
  // INIT APP
  // ======================
  useEffect(() => {
    const init = async () => {
      await fetchMe();
      await fetchCart();
      setLoading(false);
    };

    init();
  }, []);

  // ======================
  // AFTER LOGIN
  // ======================
  const loginSuccess = async () => {
    await fetchMe();
    await fetchCart();
  };

  // ======================
  // LOGOUT
  // ======================
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

// ======================
// HOOK
// ======================
export const useAuthContext = () => useContext(AuthContext);