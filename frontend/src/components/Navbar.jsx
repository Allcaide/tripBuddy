import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import AuthModal from "./AuthModal";
import { authService } from "../../utils/authService";
 
const Navbar = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  // ✅ PRIMEIRO useEffect - Verificar se user está logado quando componente monta
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  // ✅ SEGUNDO useEffect - Listener para abrir modal
  useEffect(() => {
    const handleOpenLoginModal = () => {
      setIsAuthModalOpen(true);
    };

    window.addEventListener("openLoginModal", handleOpenLoginModal);

    return () => {
      window.removeEventListener("openLoginModal", handleOpenLoginModal);
    };
  }, []);

  // ATUALIZAR handleAuthSuccess para refresh
  const handleAuthSuccess = (response) => {
    setUser(response.data.user);

    // REFRESH DA PÁGINA APÓS LOGIN BEM SUCEDIDO
    setTimeout(() => {
      window.location.reload();
    }, 1000); // Pequeno delay para mostrar sucesso
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      
      window.location.href = "/";
    } catch (error) {
      console.error("🚨 Logout error:", error);
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  };

  const getFirstName = (fullName) => {
    return fullName ? fullName.split(" ")[0] : "";
  };

  const getAvatarUrl = (userName) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      userName,
    )}&background=007AFF&color=fff&size=40&rounded=true`;
  };

  return (
    <>
      {/*  NAVBAR FLOATING ESTILO APPLE */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[95%] max-w-6xl">
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg shadow-black/5 px-6 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link
                to="/"
                className="flex items-center space-x-2 text-gray-900 font-bold text-xl"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">TB</span>
                </div>
                <span>Trip Buddy</span>
              </Link>
            </div>

            {/* Menu Links */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/"
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-100/60 transition-all font-medium px-4 py-2 rounded-xl"
              >
                HOME
              </Link>
              <Link
                to="/Tours"
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-100/60 transition-all font-medium px-4 py-2 rounded-xl"
              >
                TOURS
              </Link>
              <Link
                to="/about"
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-100/60 transition-all font-medium px-4 py-2 rounded-xl"
              >
                ABOUT
              </Link>
              <Link
                to="/contact"
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-100/60 transition-all font-medium px-4 py-2 rounded-xl"
              >
                CONTACT
              </Link>

              {/* Login/User Section */}
              {user ? (
                <div className="flex items-center space-x-3 ml-4">
                  {/* User Info */}
                  <Link
                    to="/Me"
                    className="flex items-center space-x-3 bg-gray-100/60 backdrop-blur-sm rounded-xl px-4 py-2"
                  >
                    <img
                      src={getAvatarUrl(user.name)}
                      alt={user.name}
                      className="w-7 h-7 rounded-full ring-2 ring-blue-500/20"
                    />
                    <span className="text-gray-900 font-medium text-sm">
                      {getFirstName(user.name)}
                    </span>
                  </Link>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-100/60 transition-all p-2 rounded-xl"
                    title="Logout"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md ml-4"
                >
                  LOGIN
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button className="text-gray-600 hover:text-gray-900 hover:bg-gray-100/60 transition-all p-2 rounded-xl">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default Navbar;
