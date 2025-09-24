import React from "react";
import { Link } from "react-router";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800 h-screen pt-20 flex flex-col">
      {/* Newsletter Section - Movido mais para baixo */}
      <div className="border-b border-gray-800 py-16 flex-shrink-0">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center">
            <h3 className="text-sm font-light tracking-widest uppercase mb-3 text-gray-400">
              Join Our Travel Community
            </h3>
            <p className="text-xs text-gray-500 mb-4 max-w-md mx-auto">
              Subscribe to discover exclusive destinations and get travel
              inspiration directly to your inbox
            </p>
            <div className="flex max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-2.5 text-sm border border-gray-700 focus:border-blue-500 focus:outline-none bg-gray-800 text-gray-300 placeholder-gray-500"
              />
              <button className="px-5 py-2.5 bg-blue-600 text-white text-xs font-light tracking-wide uppercase hover:bg-blue-700 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content - Flex grow para ocupar espaço disponível */}
      <div className="flex-grow flex items-center py-8">
        <div className="max-w-6xl mx-auto px-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 justify-items-center">
            {/* Company */}
            <div className="text-center">
              <h4 className="text-sm font-medium tracking-wide uppercase mb-6 text-white">
                Company
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/about"
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy"
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    to="/cookies"
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div className="text-center">
              <h4 className="text-sm font-medium tracking-wide uppercase mb-6 text-white">
                Services
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/tours"
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    Browse Tours
                  </Link>
                </li>
                <li>
                  <Link
                    to="/create"
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    Create Trip
                  </Link>
                </li>
                <li>
                  <Link
                    to="/guide"
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    Travel Guide
                  </Link>
                </li>
                <li>
                  <Link
                    to="/concierge"
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    Travel Concierge
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="text-center">
              <h4 className="text-sm font-medium tracking-wide uppercase mb-6 text-white">
                Support
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/contact"
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/faq"
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    to="/help"
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    to="/booking"
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    Booking Support
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Developer Section - Movido mais para cima */}
      <div className="border-t border-gray-800 py-6 bg-gray-950 flex-shrink-0">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-3 uppercase tracking-wide">
              Developed by
            </p>
            <div className="flex items-center justify-center space-x-6">
              <span className="text-base text-gray-300 font-light">
                Luís Alcaide
              </span>
              <div className="flex items-center space-x-4">
                <a
                  href="https://github.com/Allcaide"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  title="GitHub"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/allcaide/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Instagram"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.40z" />
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/in/lu%C3%ADs-alcaide/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  title="LinkedIn"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.026-3.063-1.867-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.838-1.563 3.036 0 3.598 2.001 3.598 4.601v5.595z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-gray-800 py-3 bg-black flex-shrink-0">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              © 2024 tripBuddy. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
