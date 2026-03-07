import { Route } from "react-router-dom";
import UserLayout from "../layouts/UserLayout";
import Home from "../pages/user/Home";

export default function UserRoutes() {
  return (
    <Route element={<UserLayout />}>
      <Route path="/" element={<Home />} />
    </Route>
  );
}