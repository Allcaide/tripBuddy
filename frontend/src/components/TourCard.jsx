import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { parseLocationFromAddressWithCache } from "../../utils/locationUtils";

const TourCard = ({ tour }) => {
  const [location, setLocation] = useState(null);

  // Buscar localização quando o componente monta
  useEffect(() => {
    if (tour.startLocation && tour.startLocation.address) {
      const parsedLocation = parseLocationFromAddressWithCache(
        tour.startLocation.address,
      );
      setLocation(parsedLocation);
    } else {
      console.log(`❌ Sem address para o tour: ${tour.name}`);
      console.log(`🔍 startLocation disponível:`, tour.startLocation);
    }
  }, [tour.startLocation]);

  // Função para gerar o nome correto da imagem baseado no template
  const getImageSrc = () => {
    // Se tour tem imageCover, usa essa
    if (tour.imageCover) {
      return `http://localhost:3000/img/tours/${tour.imageCover}`;
    }

    // Senão, gera baseado no padrão tour-X-cover.jpg
    const tourNumber = tour.tourNumber || extractTourNumber(tour._id) || 1;
    return `http://localhost:3000/img/tours/tour-${tourNumber}-cover.jpg`;
  };

  // Função auxiliar para extrair número do tour do ID
  const extractTourNumber = (id) => {
    if (!id) return 1;
    const num = (parseInt(id.slice(-1), 16) % 6) + 1;
    return num;
  };

  return (
    <div className="group relative w-full max-w-sm h-[32rem]">
      {/* ✅ LINK COMO OVERLAY INVISÍVEL POR CIMA DE TUDO */}
      <Link
        to={`/Tours/${tour.slug}`}
        className="absolute inset-0 z-50 cursor-pointer"
        aria-label={`View details for ${tour.name}`}
      />

      <div className="relative w-full h-full transform transition-all duration-500 ease-out group-hover:scale-105">
        {/* Imagem de fundo */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden">
          <img
            src={getImageSrc()}
            alt={tour.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const currentSrc = e.target.src;
              console.log("❌ Falhou:", currentSrc);

              if (currentSrc.includes("cover.jpg")) {
                // Tenta tour-X-1.jpg
                const baseName = currentSrc.replace("-cover.jpg", "-1.jpg");
                console.log("🔄 Tentando -1.jpg:", baseName);
                e.target.src = baseName;
              } else if (currentSrc.includes("-1.jpg")) {
                e.target.src = currentSrc.replace("-1.jpg", "-2.jpg");
              } else if (currentSrc.includes("-2.jpg")) {
                e.target.src = currentSrc.replace("-2.jpg", "-3.jpg");
              } else {
                // Último recurso: esconde imagem e mostra fallback
                console.log("🎨 Usando fallback gradiente");
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }
            }}
          />
          {/* Fallback div */}
          <div
            className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold"
            style={{ display: "none" }}
          >
            {tour.name}
          </div>

          {/* Gradiente que fica mais escuro no hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-all duration-500 group-hover:from-black/85"></div>
        </div>

        {/* Conteúdo - sobe no hover */}
        <div className="absolute inset-0 p-8 flex flex-col justify-between transition-all duration-500 ease-out group-hover:-translate-y-6">
          {/* Espaço vazio no topo - removidos os pontinhos amarelos */}
          <div></div>

          <div className="text-white">
            <h3 className="text-3xl font-bold mb-3">{tour.name}</h3>
            <p className="text-base opacity-90 mb-2">
              ${tour.price} per person
            </p>

            {/* Detalhes extra que aparecem no hover */}
            <div className="opacity-0 transform translate-y-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0 mb-4">
              <p className="text-sm opacity-80 mb-2">{tour.summary}</p>
              <div className="flex items-center space-x-4 text-sm">
                <span>👥 {tour.maxGroupSize} people</span>
                <span className="capitalize bg-white/20 px-2 py-1 rounded text-xs">
                  {tour.difficulty}
                </span>
              </div>
            </div>

            {/* Rating, Duração e Localização */}
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center space-x-6 text-base">
                <span>📅 {tour.duration} days</span>
                <div className="flex items-center">
                  <span className="text-yellow-400 mr-1 text-lg">★</span>
                  <span>{tour.ratingsAverage}</span>
                </div>
              </div>

              {/* Localização ao lado direito */}
              {location && location.city !== "Unknown City" && (
                <div className="flex items-center text-white/90 text-sm">
                  <span className="mr-1">📍</span>
                  <span className="truncate max-w-[140px]">
                    {location.fullLocation}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourCard;
