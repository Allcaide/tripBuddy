import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import AuthModal from "./AuthModal";
import { authService } from "../../utils/authService";

const Navbar = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Verificar se user está logado quando componente monta
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleAuthSuccess = (response) => {
    console.log("Auth success response:", response); // Para debug
    // O response já vem processado do authService
    setUser(response.data.user);
  };

  const handleLogout = async () => {
    try {
      console.log("🚀 Logging out...");

      //  CHAMADA ASYNC para logout completo
      await authService.logout();

      //  Atualizar estado local
      setUser(null);

      console.log("✅ Logout completed successfully");

       //Redirect para home
      window.location.href = '/';
    } catch (error) {
      console.error("🚨 Logout error:", error);

      //  FALLBACK: Se logout falhar, pelo menos limpa estado local
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  };

  const getFirstName = (fullName) => {
    return fullName ? fullName.split(" ")[0] : "";
  };

  const getAvatarUrl = (userName) => {
    // Placeholder avatar baseado no nome
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      userName,
    )}&background=3b82f6&color=fff&size=40&rounded=true`;
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/30 backdrop-blur-xl border-b border-white/10">
        <div className="pl-8 pr-4 sm:pr-6 lg:pr-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link
                to="/"
                className="flex items-center space-x-2 text-white font-bold text-xl"
              >
                <span>Trip Buddy</span>
              </Link>
            </div>

            {/* Menu Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className="text-white/90 hover:text-white transition-colors font-medium"
              >
                HOME
              </Link>
              <Link
                to="/Tours"
                className="text-white/90 hover:text-white transition-colors font-medium"
              >
                TOURS
              </Link>
              <Link
                to="/about"
                className="text-white/90 hover:text-white transition-colors font-medium"
              >
                ABOUT
              </Link>
              <Link
                to="/contact"
                className="text-white/90 hover:text-white transition-colors font-medium"
              >
                CONTACT
              </Link>

              {/* Login/User Section */}
              {user ? (
                <div className="flex items-center space-x-4">
                  {/* User Info */}
                  <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                    <img
                      src={getAvatarUrl(user.name)}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-white font-medium">
                      {getFirstName(user.name)}
                    </span>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="text-white/70 hover:text-white transition-colors"
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
                  className="bg-blue-600/80 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all font-medium backdrop-blur-sm"
                >
                  LOGIN
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button className="text-white/90 hover:text-white">
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

      {/* Auth Modal - AGORA COM A FUNÇÃO CORRETA */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess} // ✅ AGORA PASSA A FUNÇÃO
      />
    </>
  );
};

export default Navbar;
