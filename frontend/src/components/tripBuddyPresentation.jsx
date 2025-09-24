import React, { useState, useEffect, useRef } from "react";
import tripBuddyPresentationData from "../data/tripBuddyPresentationData.json";
import AppPresentationCard from "./AppPresentationCard"; // ✅ Importa o componente

const TripBuddyPresentation = () => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const videoRef = useRef(null);

  const videos = tripBuddyPresentationData?.videos || [];

  // Se não há vídeos, mostra mensagem
  if (videos.length === 0) {
    return (
      <section className="relative min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl mb-4">Videos not found</h2>
          <p>Check if tripBuddyPresentationData.json exists and has videos</p>
        </div>
      </section>
    );
  }

  // Effect que escuta quando o vídeo acaba
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVideoEnd = () => {
      console.log("Video ended, starting smooth transition");

      // Inicia fade out suave
      setFadeOut(true);

      // Após 300ms de fade, inicia transição
      setTimeout(() => {
        setIsTransitioning(true);
        setIsVideoLoaded(false);

        // Após mais 300ms, muda vídeo e começa fade in
        setTimeout(() => {
          setCurrentVideoIndex((prevIndex) => {
            const next = (prevIndex + 1) % videos.length;
            console.log("Changing from video", prevIndex, "to", next);
            return next;
          });
          setFadeOut(false);
          setIsTransitioning(false);
        }, 300);
      }, 300);
    };

    const handleCanPlay = () => {
      console.log("Video can play - setting loaded to true");
      setIsVideoLoaded(true);
    };

    const handleVideoError = (e) => {
      console.error("Video loading error:", e);
      console.error("Video source:", video.src);
      setIsVideoLoaded(false);
    };

    const handlePlay = () => {
      console.log("Video started playing");
      setIsVideoLoaded(true);
    };

    video.addEventListener("ended", handleVideoEnd);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("play", handlePlay);
    video.addEventListener("error", handleVideoError);

    return () => {
      video.removeEventListener("ended", handleVideoEnd);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("error", handleVideoError);
    };
  }, [videos.length, currentVideoIndex]);

  // Effect que carrega novo vídeo quando índice muda
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isTransitioning) return;

    console.log("Loading video:", videos[currentVideoIndex]?.src);
    setIsVideoLoaded(false);

    video.pause();
    video.currentTime = 0;

    const currentSrc = videos[currentVideoIndex]?.src;
    if (video.src !== currentSrc) {
      video.src = currentSrc;
    }
    video.load();

    const playVideo = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 200));
        await video.play();
        console.log("Video playing successfully");
        setIsVideoLoaded(true);
      } catch (error) {
        console.error("Error playing video:", error);
        setTimeout(async () => {
          try {
            await video.play();
            setIsVideoLoaded(true);
          } catch (e) {
            console.error("Second attempt failed:", e);
          }
        }, 500);
      }
    };

    playVideo();
  }, [currentVideoIndex, isTransitioning]);

  const currentVideo = videos[currentVideoIndex];

  return (
    <section className="relative min-h-screen bg-black overflow-hidden">
      {/* VÍDEOS DE FUNDO COM EFEITOS */}
      <div className="absolute inset-0">
        {isTransitioning ? (
          // ✅ Transição limpa sem texto de loading
          <div className="w-full h-full bg-black relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20 animate-pulse"></div>
          </div>
        ) : (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              className={`w-full h-full object-cover transition-all duration-300 ease-in-out ${
                fadeOut
                  ? "opacity-0 scale-110 blur-sm" // Fade out com scale e blur
                  : isVideoLoaded
                  ? "opacity-100 scale-100 blur-0" // Fade in suave
                  : "opacity-0 scale-95 blur-sm" // Estado inicial
              }`}
              muted
              playsInline
              preload="auto"
              onError={(e) => {
                console.error("Video error in JSX:", e);
                console.error("Current video source:", currentVideo?.src);
                setIsVideoLoaded(false);
              }}
              onLoadStart={() => {
                console.log("Video load started");
                setIsVideoLoaded(false);
              }}
              onCanPlay={() => {
                console.log("Video can play (onCanPlay)");
                setIsVideoLoaded(true);
              }}
            >
              <source src={currentVideo?.src} type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* ✅ Removido overlay de loading - agora é invisível */}
          </div>
        )}

        {/* Overlay com transição suave */}
        <div
          className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${
            isVideoLoaded && !fadeOut ? "opacity-100" : "opacity-0"
          }`}
        ></div>
      </div>

      {/* CAMPO ABERTO PARA CONTEÚDO COM FADE */}
      <div
        className={`relative z-10 min-h-screen flex items-center justify-center transition-all duration-500 ${
          isTransitioning || fadeOut
            ? "opacity-50 scale-95"
            : "opacity-100 scale-100"
        }`}
      >
        <AppPresentationCard /> {/* ✅ Usa o componente aqui */}
      </div>

      {/* ✅ REMOVIDOS TODOS OS CONTROLOS E INDICADORES */}
    </section>
  );
};

export default TripBuddyPresentation;
