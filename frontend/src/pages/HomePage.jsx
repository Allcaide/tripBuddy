import React from "react";
import Navbar from "../components/Navbar";
import HeroCarousel from "../components/HeroCarousel";
import TripBuddyPresentation from "../components/tripBuddyPresentation";
import Footer from "../components/Footer";

const HomePage = () => {
  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory hide-scrollbar">
      {/* Navbar fixa no topo */}
      <Navbar />

      {/* Seção 1: Hero Carousel - Tela completa */}
      <section className="h-screen snap-start snap-always">
        <HeroCarousel />
      </section>

      {/* Seção 2: Trip Buddy Presentation - Tela completa */}
      <section className="h-screen snap-start snap-always">
        <TripBuddyPresentation />
      </section>

      {/* Seção 3: Footer - Tela completa */}
      <section className="h-screen snap-start snap-always">
        <Footer />
      </section>
    </div>
  );
};

export default HomePage;
