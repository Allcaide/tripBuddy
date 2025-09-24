import React from "react";
import { Link } from "react-router";

const AppPresentationCard = () => {
  return (
    <div className="flex items-center justify-center gap-12 max-w-5xl px-8">
      {/* SÍMBOLO À ESQUERDA */}
      <div className="flex-shrink-0">
        <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center shadow-2xl p-4 overflow-hidden">
          <img
            src="/app_symbol/symbol-2.png"
            alt="tripBuddy Symbol"
            className="w-32 h-32 object-contain" // ✅ Muito maior - quase todo o círculo
            onError={(e) => {
              // Fallback para emoji se imagem não carregar
              console.log("Image failed to load:", e.target.src);
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
          <div className="w-32 h-32 hidden items-center justify-center">
            <span className="text-8xl"></span> {/* ✅ Emoji também maior */}
          </div>
        </div>
      </div>

      {/* OVERLAY GLASSY À DIREITA */}
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
          Trip Buddy
        </h1>

        <p className="text-lg md:text-xl text-white/90 mb-6 leading-relaxed">
          Your Ultimate Travel Companion
        </p>

        <p className="text-sm md:text-base text-white/80 mb-8">
          Discover amazing destinations and create unforgettable memories
        </p>

        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/Tours"
            className="bg-blue-600/80 hover:bg-blue-600 backdrop-blur-sm text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105"
          >
            🌍 Explore Tours
          </Link>
          <Link
            to="/CreateTourPage"
            className="border border-white/40 hover:bg-white/10 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105"
          >
            ✨ Create Trip
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AppPresentationCard;
