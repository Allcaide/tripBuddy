import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home/Home';
import CategoryPage from './pages/Category/Category';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ForgotPassword from './pages/Auth/ForgotPassword';

function App() {
  return (
    <AuthProvider>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:categorySlug" element={<CategoryPage />} />
          <Route path="/category/:categorySlug/:subcategorySlug" element={<CategoryPage />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </main>
      <Footer />
    </AuthProvider>
  );
}

export default App;
