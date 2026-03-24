import { Route } from "react-router-dom";
import UserLayout from "../layouts/UserLayout";
import Tc from "../pages/user/Trangchu";
import Dangki from "../pages/user/Dangki";

export default function UserRoutes() {
  return (
    <Route element={<UserLayout />}>
      <Route path="/" element={<Tc />} />
      <Route path="/" element={<Dangki />} />
    </Route>
  );
}