// src/pages/Projects.jsx
import React, { useState, Suspense } from "react";
import ProjectCard from "../components/ProjectCard";
import CryptoPreview from "../components/crypto/CryptoPreview";

// lazy components (heavy)
const SnakeGame = React.lazy(() => import("../components/games/SnakeGame"));
const CryptoDashboard = React.lazy(() => import("../components/crypto/CryptoDashboard"));
const ParticleAnimation = React.lazy(() => import("../components/animations/ParticleAnimation"));

const ModalWrapper = ({ open, onClose, title, children, themeClasses, theme }) => {
  // lock body scroll
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-5xl max-h-[90vh] overflow-auto rounded-lg p-4 ${themeClasses?.[theme] || "bg-gray-900"}`}
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "scaleIn 240ms cubic-bezier(.2,.8,.2,1)" }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-white text-xl">✕</button>
        <h3 className="text-white text-2xl mb-3">{title}</h3>
        {children}
      </div>

      <style>{`
        @keyframes scaleIn { from { transform: scale(.96); opacity: 0 } to { transform: scale(1); opacity: 1 } }
      `}</style>
    </div>
  );
};

export default function Projects({ theme = "default", themeClasses = {} }) {
  const [openModal, setOpenModal] = useState(null); // "snake" | "crypto" | "particles" | null

  return (
    <div className="px-6 py-12 max-w-7xl mx-auto">
      <h2 className="text-4xl font-bold text-white mb-8">My Projects</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ProjectCard
          title="Snake Game"
          techs={["React", "Canvas", "Game"]}
          preview={<div className="text-gray-300">▶ Play mini game</div>}
          github="https://github.com/yourusername/snake-game"
          onOpen={() => setOpenModal("snake")}
          theme={theme}
          themeClasses={themeClasses}
        />

        <ProjectCard
          title="Crypto Dashboard"
          techs={["React", "Chart.js", "API", "UX"]}
          preview={<CryptoPreview />}
          github="https://github.com/yourusername/crypto-dashboard"
          onOpen={() => setOpenModal("crypto")}
          theme={theme}
          themeClasses={themeClasses}
        />

        <ProjectCard
          title="Particle Animation"
          techs={["React", "Canvas", "Animation"]}
          preview={<div className="text-gray-300">Interactive particles</div>}
          github="https://github.com/yourusername/particle-animation"
          onOpen={() => setOpenModal("particles")}
          theme={theme}
          themeClasses={themeClasses}
        />
      </div>

      {/* Modals: mount heavy components only when open */}
      <ModalWrapper
        open={openModal === "snake"}
        onClose={() => setOpenModal(null)}
        title="Snake Game"
        theme={theme}
        themeClasses={themeClasses}
      >
        <Suspense fallback={<div className="text-gray-300 p-8">Loading game...</div>}>
          <SnakeGame />
        </Suspense>
      </ModalWrapper>

      <ModalWrapper
        open={openModal === "crypto"}
        onClose={() => setOpenModal(null)}
        title="Crypto Dashboard"
        theme={theme}
        themeClasses={themeClasses}
      >
        <Suspense fallback={<div className="text-gray-300 p-8">Loading dashboard...</div>}>
          <CryptoDashboard perPage={40} />
        </Suspense>
      </ModalWrapper>

      <ModalWrapper
        open={openModal === "particles"}
        onClose={() => setOpenModal(null)}
        title="Particle Animation"
        theme={theme}
        themeClasses={themeClasses}
      >
        <Suspense fallback={<div className="text-gray-300 p-8">Loading animation...</div>}>
          <ParticleAnimation />
        </Suspense>
      </ModalWrapper>
    </div>
  );
}
