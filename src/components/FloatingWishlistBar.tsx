import React, { useState } from 'react';
import { useStudio } from '../context/StudioContext';
import { Heart, MessageCircle, Sparkles, X, ChevronRight } from 'lucide-react';
import { generateWhatsAppLink, buildWishlistShareMessage } from '../data/initialData';

export const FloatingWishlistBar: React.FC = () => {
  const { 
    creations, 
    likedCreationIds, 
    settings, 
    activeTab, 
    setActiveTab, 
    setSelectedOccasionFilter,
    selectedCreationForDetail 
  } = useStudio();

  const [isDismissed, setIsDismissed] = useState(false);

  // If no liked items, or if inside product sheet detail modal, or dismissed
  if (likedCreationIds.length === 0 || selectedCreationForDetail || isDismissed) {
    return null;
  }

  // Get liked creations
  const likedCreations = creations.filter(c => likedCreationIds.includes(c.id));
  if (likedCreations.length === 0) return null;

  const count = likedCreations.length;

  const handleViewWishlist = () => {
    setSelectedOccasionFilter('favorites');
    setActiveTab('creations');
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const directWishlistWaUrl = generateWhatsAppLink(
    settings.whatsappNumber,
    buildWishlistShareMessage(likedCreations, settings.studioName)
  );

  return (
    <div 
      id="floating-wishlist-magic-bar"
      className="fixed bottom-5 sm:bottom-6 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-40 max-w-xl w-full mx-auto select-none font-sans animate-in slide-in-from-bottom-6 duration-300"
    >
      <div className="bg-[#181512]/95 backdrop-blur-xl border border-[#C5A880]/60 p-3 sm:p-3.5 rounded-full shadow-[0_15px_40px_rgba(0,0,0,0.4)] flex items-center justify-between gap-2.5 sm:gap-4 text-white">
        
        {/* Left: Heart & Count */}
        <button
          type="button"
          onClick={handleViewWishlist}
          className="flex items-center gap-2 pl-2 sm:pl-3 hover:opacity-90 transition-opacity cursor-pointer group text-left shrink-0"
        >
          <div className="w-8 h-8 rounded-full bg-[#6E2333] border border-rose-400/50 flex items-center justify-center text-rose-200 group-hover:scale-110 transition-transform">
            <Heart className="w-4 h-4 fill-rose-400 text-rose-400" />
          </div>
          <div className="hidden xs:block">
            <div className="text-[11px] font-bold tracking-wider text-[#FAF8F5]">
              {count} Coup{count > 1 ? 's' : ''} de Cœur
            </div>
            <div className="text-[9px] text-[#C5A880] tracking-widest uppercase">
              Sélection VIP
            </div>
          </div>
        </button>

        {/* Center/Right: Magic Button « Envoyer ma sélection à Vanessa sur WhatsApp » */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-1 justify-end">
          <a
            id="magic-wishlist-whatsapp-btn"
            href={directWishlistWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-shimmer flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#1B4332] hover:bg-[#143528] text-white text-[10.5px] sm:text-[11.5px] font-bold tracking-[0.14em] uppercase border border-[#C5A880]/60 shadow-md hover:shadow-xl transition-all cursor-pointer active:scale-95 text-center truncate"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            title="Envoyer ma sélection de robes à Vanessa sur WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current text-[#25D366] shrink-0" />
            <span className="truncate">Envoyer ma sélection ({count})</span>
          </a>

          {/* Quick View Button */}
          <button
            type="button"
            onClick={handleViewWishlist}
            className="hidden sm:inline-flex p-2 rounded-full text-[#C5A880] hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            title="Voir mes coups de cœur dans le catalogue"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Close/Dismiss */}
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            aria-label="Masquer la barre"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
