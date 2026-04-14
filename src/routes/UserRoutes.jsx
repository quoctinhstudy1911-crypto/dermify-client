import { Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthContext } from "@/context/AuthContext";

// Layouts
import UserLayout from "../layouts/UserLayout";

// Pages
import Tc from "../pages/user/Trangchu";
import Dangki from "../pages/user/Dangki";
import Dangnhap from "../pages/user/Dangnhap";
import Profile from "../pages/user/Profile";
import VerifyEmail from "../pages/user/VerifyEmail";
import ForgotPassword from "../pages/user/ForgotPassword";
import ResetPassword from "../pages/user/ResetPassword";
import ProductList from "../pages/user/ProductList";
import ProductDetail from "@/pages/user/ProductDetail";
import Cart from "@/pages/user/Cart";
import Checkout from "@/pages/user/Checkout";
import OrderSuccess from "@/pages/user/OrderSuccess";
import MyOrdersPage from "@/pages/user/MyOrdersPage";
import OrderDetailPage from "@/pages/user/OrderDetailPage";
// Kiểm tra nếu đã đăng nhập và có role là "customer" thì mới cho truy cập vào các route con của UserLayout
const RequireUser = () => {
  const { user, loading } = useAuthContext();
  const location = useLocation();

  // ĐANG LOAD THÌ ĐỨNG YÊN, ĐỪNG CHUYỂN TRANG
  if (loading) {
    return <div className="text-center mt-5">Đang xác thực...</div>;
  }

  // CHƯA ĐĂNG NHẬP THÌ CHUYỂN VỀ TRANG ĐĂNG NHẬP
  if (!user) {
    return <Navigate to="/dangnhap" state={{ from: location }} replace />;
  }

  // 3. Không phải customer → đá về trang chủ
  if (!user.role || user.role.toLowerCase() !== "customer") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

//
// ROUTES
//
export default function UserRoutes() {
  return (
    <>
      {/* ================= PUBLIC ROUTES ================= */}
      <Route element={<UserLayout />}>
        <Route path="/" element={<Tc />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/category/:slug" element={<ProductList />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
      </Route>

      {/* không cần layout */}
      <Route path="/dangki" element={<Dangki />} />
      <Route path="/dangnhap" element={<Dangnhap />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* ================= PRIVATE ROUTES ================= */}
      <Route element={<RequireUser />}>
        <Route element={<UserLayout />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/orders" element={<MyOrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
        </Route>
      </Route>
    </>
  );
}
