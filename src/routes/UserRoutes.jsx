import { Route } from "react-router-dom";
import UserLayout from "../layouts/UserLayout";
import Home from "../pages/user/Home";
import Tc from "../pages/user/Trangchu";

export default function UserRoutes() {
  return (
    <Route element={<UserLayout />}>
      <Route path="/" element={<Tc />} />
      <Route path="/users" element={<Home />} />
    </Route>
  );
}