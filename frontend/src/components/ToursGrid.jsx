import React, { useEffect, useRef } from "react";
import TourCard from "./TourCard";

// Imports do Vanta
import * as THREE from "three";
import FOG from "vanta/dist/vanta.fog.min";

const ToursGrid = ({ tours, loading, error }) => {
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  // Configurar Vanta effect quando o componente monta
  useEffect(() => {
    if (!vantaEffect.current && vantaRef.current) {
      vantaEffect.current = FOG({
        el: vantaRef.current,
        THREE: THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        highlightColor: 0xd8eafa,
        midtoneColor: 0xd5deff,
        lowlightColor: 0xb9ceeb,
        baseColor: 0xcacaca,
        blurFactor: 0.86,
        speed: 0.9,
      });
    }

    // Cleanup quando o componente desmonta
    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

  if (loading) {
    return (
      <>
        {/* Vanta Background - atrás do Navbar */}
        <div ref={vantaRef} className="fixed inset-0 w-full h-full z-[-1]" />

        {/* Conteúdo original por cima - SEM filtros */}
        <div className="relative z-10 flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-600"></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        {/* Vanta Background - atrás do Navbar */}
        <div ref={vantaRef} className="fixed inset-0 w-full h-full z-[-1]" />

        {/* Conteúdo original por cima - SEM filtros */}
        <div className="relative z-10 flex justify-center items-center h-96">
          <div className="text-red-500 text-center">
            <p className="text-2xl font-bold">Error: {error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Vanta Background - atrás do Navbar */}
      <div ref={vantaRef} className="fixed inset-0 w-full h-full z-[-1]" />

      {/* Conteúdo NORMAL - sem filtros glass */}
      <div className="relative z-10 min-h-screen">
        <div className="pt-24 pb-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
              Discover Amazing Tours
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore breathtaking destinations with our curated collection of
              unforgettable adventures
            </p>
          </div>

          {/* Grid responsivo */}
          <div className="px-8">
            <div
              className="grid gap-8 
              grid-cols-1 
              sm:grid-cols-2 
              lg:grid-cols-3 
              xl:grid-cols-4 
              2xl:grid-cols-5 
              place-items-center
              max-w-[calc(100vw-4rem)] 
              mx-auto"
            >
              {tours.map((tour) => (
                <TourCard key={tour._id} tour={tour} />
              ))}
            </div>
          </div>

          {/* Stats footer - também normal */}
          <div className="mt-20 text-center">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
              <p className="text-2xl font-bold text-gray-800 mb-2">
                {tours.length} Amazing Tours
              </p>
              <p className="text-gray-600">
                Hover over cards to see full details
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ToursGrid;
