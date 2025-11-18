// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Login from "./pages/Login";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
// ... other imports

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      
      {/* ← THIS SINGLE DIV FIXES THE OVERLAP FOREVER */}
      <div style={{ paddingTop: "100px" }}>   {/* Adjust 100px if needed */}
        <Routes>
           <Route path="/" element={<Login />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
          {/* ... other routes */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

 