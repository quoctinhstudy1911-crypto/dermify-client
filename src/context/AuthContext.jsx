import { createContext, useContext, useState, useEffect } from "react";
import { userApi,authApi,cartApi } from "@/api";

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

// fetch user info
const fetchMe = async () => {
  if (!isLoggedIn()) {
    setUser(null);
    setLoading(false);
    return;
  }

  try {
    const cachedUser = localStorage.getItem("user");
    if (cachedUser && cachedUser !== "undefined") {
      setUser(JSON.parse(cachedUser));
    }

    const authRes = await authApi.getMe();

    // 🔥 QUAN TRỌNG: chặn admin
    if (authRes.role !== "customer") {
      setUser(null);
      return;
    }

    const profileRes = await userApi.getProfile();

    const fullData = {
      ...profileRes,
      role: authRes.role,
      email: authRes.email
    };

    setUser(fullData);
    localStorage.setItem("user", JSON.stringify(fullData));

  } catch (err) {
    console.error("Lỗi đồng bộ dữ liệu:", err);
  } finally {
    setLoading(false);
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
      if (window.location.pathname.startsWith("/admin")) {
        setLoading(false);
        return;
      }

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