import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'
import { AuthProvider } from "@/context/AuthContext";
import App from './App.jsx'
import { CartProvider } from './context/CartContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
       <AdminAuthProvider> 
     <CartProvider>
        <App />
      </CartProvider>
      </AdminAuthProvider>
    </AuthProvider>
  </StrictMode>
);
