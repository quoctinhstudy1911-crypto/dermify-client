import { Route } from "react-router-dom";
import UserLayout from "../layouts/UserLayout";
import Tc from "../pages/user/Trangchu";
import Dangki from "../pages/user/Dangki";
import Dangnhap from "../pages/user/Dangnhap";
import Profile from "../pages/user/Profile";

export default function UserRoutes() {
  return (
    <Route element={<UserLayout />}>
      <Route path="/" element={<Tc />} />
      <Route path="/dangki" element={<Dangki />} />
      <Route path="/dangnhap" element={<Dangnhap />} />
      <Route path="/profile" element={<Profile />} />
    </Route>
  );
}