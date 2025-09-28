import React, { useState } from "react";
import { Link } from "react-router";
import AuthModal from "./AuthModal";

const Navbar = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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

              {/* Login/Signup Button */}
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-blue-600/80 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all font-medium backdrop-blur-sm"
              >
                LOGIN
              </button>
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

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
