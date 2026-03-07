import { BrowserRouter, Routes } from "react-router-dom";
import UserRoutes from "./UserRoutes";
import AdminRoutes from "./AdminRoutes";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {UserRoutes()}
        {AdminRoutes()}
      </Routes>
    </BrowserRouter>
  );
}