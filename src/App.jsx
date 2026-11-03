import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from './components/pages/SignupPage'
import LoginFunction from './components/pages/LoginPage'
import Homepage from "./components/pages/HomePage";
import GetProductVarientDetail from "./components/AxiosRequest/ProductVarientDetails";
import ProductDetailPage from "./components/ReusableUI/ProductDetailPage";
import ScrollToTop from "./components/ReusableUI/ScrollToTop";
import Layout from "./components/ReusableUI/Layout";
import AuthLayout from "./components/ReusableUI/AuthLayout";
import { CartProvider } from "./components/cart/cartContext";
import CartPage from "./components/pages/CartPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./components/auth/AuthContext";
import CheckoutPage from './components/pages/CheckoutPage';
import OrdersPage from './components/pages/OrdersPage';
import OrderDetailPage from './components/pages/OrderDetailPage';
import ProfilePage from './components/pages/ProfilePage';
import SearchResultsPage from './components/pages/SearchResultsPage';

function App() {


  return (
    <>
    <AuthProvider >
    <CartProvider>
      <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route element={<Layout />} >
              <Route path="/productVarient" element={<GetProductVarientDetail/>} />
              <Route path= "/" element={<Homepage/>} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/search" element={<SearchResultsPage />} />
            </Route>

            <Route element={<AuthLayout />} >
              <Route path ="/login"  element = {<LoginFunction />} />
              <Route path="/register" element={<Register />} />
              <Route path="/Cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/:id" element={<OrderDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={1000}
            newestOnTop
            closeOnClick
            theme="light"
          />
      </BrowserRouter>
    </CartProvider>
    </AuthProvider>
    </>
  )
}

export default App
