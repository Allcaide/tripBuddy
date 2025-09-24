import React from "react";
import { Link } from "react-router";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
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
              className="text-white hover:text-blue-300 transition-colors"
            >
              HOME
            </Link>
            <Link
              to="/Tours"
              className="text-white hover:text-blue-300 transition-colors"
            >
              TOURS
            </Link>
            <Link
              to="/about"
              className="text-white hover:text-blue-300 transition-colors"
            >
              ABOUT
            </Link>
            <Link
              to="/contact"
              className="text-white hover:text-blue-300 transition-colors"
            >
              CONTACT
            </Link>
            <Link
              to="/CreateTourPage"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              CREATE TOUR
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-white hover:text-blue-300">
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
  );
};

export default Navbar;
