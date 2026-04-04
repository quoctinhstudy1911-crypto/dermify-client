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

const fetchMe = async () => {
  if (!isLoggedIn()) {
    setUser(null);
    setLoading(false);
    return;
  }

  try {
    // 1. Lấy nhanh từ cache để hiện tên trên Navbar trước
    const cachedUser = localStorage.getItem("user");
    if (cachedUser && cachedUser !== "undefined") {
      setUser(JSON.parse(cachedUser));
    }

    // 2. Chạy SONG SONG cả 2 API để tiết kiệm thời gian
    // Một cái lấy Role (Account), một cái lấy Profile (Customer)
    const [authRes, profileRes] = await Promise.all([
      authApi.getMe(),
      userApi.getProfile()
    ]);

    // 3. GỘP DỮ LIỆU: Ưu tiên dữ liệu từ Profile, nhưng lấy Role từ Auth
    const fullData = {
      ...profileRes,      // Có name, phone, avatar, addresses...
      role: authRes.role, // Lấy đúng cái role "customer" từ account
      email: authRes.email // Lấy luôn email để hiện ở trang Profile
    };

    // 4. Cập nhật State và LocalStorage
    setUser(fullData);
    localStorage.setItem("user", JSON.stringify(fullData));

    console.log("✅ Đã gộp Role và Profile thành công:", fullData);

  } catch (err) {
    console.error("❌ Lỗi đồng bộ dữ liệu:", err);
    // Nếu lỗi 401 thì logout (đã có interceptor lo nhưng viết ở đây cho chắc)
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