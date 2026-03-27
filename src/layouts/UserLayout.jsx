import { Outlet } from "react-router-dom";
import MyNavbar from "@/Components/user/Navbar";

export default function UserLayout() {
  
  return (
<div className="user-layout min-vh-100 d-flex flex-column">      
   <MyNavbar />
      <main>
        <Outlet />
      </main>

    </div>
  );
}