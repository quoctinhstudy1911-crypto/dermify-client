import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserLayout from "../layouts/UserLayout";
import Dangki from "../pages/user/Dangki";
import Tc from "../pages/user/Trangchu";
import Dangnhap from "../pages/user/Dangnhap";
import Profile from "../pages/user/profile";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<UserLayout />}>
          <Route path="/" element={<Tc />} />
          <Route path="/dangki" element={<Dangki />} />
          <Route path="/dangnhap" element={<Dangnhap />} />
          <Route path="/profile" element={<Profile />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}