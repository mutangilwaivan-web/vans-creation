import React, { useState, useMemo } from 'react';
import { useStudio } from '../context/StudioContext';
import { Creation } from '../types';
import { 
  Search, 
  Sparkles, 
  MessageCircle, 
  Eye, 
  Scissors, 
  Clock, 
  RotateCcw, 
  Share2, 
  Heart, 
  MessageSquare,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  generateWhatsAppLink, 
  buildCreationOrderMessage, 
  buildWishlistShareMessage 
} from '../data/initialData';
import { ShareModal } from './ShareModal';

const CARD_ANGLE_LABELS = ['Vue de Face', 'Vue de Profil', 'Vue de Dos', 'Détail Étoffe'];

interface CreationCardProps {
  creation: Creation;
  isLiked: boolean;
  onToggleLike: (id: string) => void;
  onSelectDetail: (creation: Creation) => void;
  onShare: (creation: Creation) => void;
  whatsappNumber: string;
  studioName: string;
}

const CreationCard: React.FC<CreationCardProps> = ({
  creation,
  isLiked,
  onToggleLike,
  onSelectDetail,
  onShare,
  whatsappNumber,
  studioName,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const images = creation.images && creation.images.length > 0
    ? creation.images
    : ['/images/vanessa-hero.jpg'];

  const currentDisplayImage = images[activeImageIndex] || images[0];
  const angleLabel = CARD_ANGLE_LABELS[activeImageIndex] || `Vue ${activeImageIndex + 1}`;

  // Touch Swipe Gesture Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 35;
    if (distance > minSwipeDistance) {
      // Swipe Left -> Next Image
      setActiveImageIndex((prev) => (prev + 1) % images.length);
    } else if (distance < -minSwipeDistance) {
      // Swipe Right -> Previous Image
      setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const whatsappUrl = generateWhatsAppLink(
    whatsappNumber,
    buildCreationOrderMessage(studioName, creation.title, creation.priceEstimate, creation.silhouette)
  );

  return (
    <div className="group bg-white rounded-[28px] overflow-hidden border border-[#EAE3DA]/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_-10px_rgba(27,67,50,0.18)] hover:border-[#C5A880]/60 transition-all duration-500 flex flex-col justify-between select-none transform hover:-translate-y-1.5">
      
      {/* Image Container with 3:4 Editorial Ratio & Touch Swipe */}
      <div 
        onClick={() => onSelectDetail(creation)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative aspect-[3/4] overflow-hidden bg-[#181512] cursor-pointer touch-pan-y"
      >
        <img
          src={currentDisplayImage}
          alt={`${creation.title} - ${angleLabel}`}
          className="w-full h-full object-cover object-top transition-all duration-500 ease-out group-hover:scale-105 filter contrast-[1.04]"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20 opacity-80 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none" />

        {/* Top Floating Action Badges */}
        <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between z-10 pointer-events-none">
          {/* Signature or Category Tag */}
          {(creation.isFeatured || creation.misEnAvant) ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181512]/85 backdrop-blur-md text-[#C5A880] text-[9px] font-bold tracking-[0.20em] uppercase border border-[#C5A880]/50 shadow-md pointer-events-auto">
              <Sparkles className="w-3 h-3 text-[#C5A880]" />
              <span>Signature</span>
            </div>
          ) : (
            <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[9px] font-bold tracking-wider uppercase shadow-xs pointer-events-auto">
              {creation.occasionName || creation.categories[0]}
            </div>
          )}

          {/* Interactive Heart (Like) Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleLike(creation.id);
            }}
            className={`pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md transition-all duration-300 cursor-pointer shadow-md active:scale-90 ${
              isLiked
                ? 'bg-[#6E2333]/90 text-rose-200 border border-rose-400/50'
                : 'bg-black/50 hover:bg-black/75 text-white/90 border border-white/20'
            }`}
            title={isLiked ? 'Retirer des coups de cœur' : 'Ajouter aux coups de cœur'}
            aria-label="Aimer cette création"
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-400 text-rose-400' : 'text-white'}`} />
            <span className="text-[11px] font-bold font-mono">{creation.likesCount || 0}</span>
          </button>
        </div>

        {/* Direct Swipe Angle Switcher Arrows on the Card */}
        {images.length > 1 && (
          <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none z-10">
            <button
              type="button"
              onClick={handlePrevImage}
              className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/85 text-white flex items-center justify-center backdrop-blur-sm pointer-events-auto transition-all cursor-pointer active:scale-90 border border-white/20 shadow-md sm:opacity-0 sm:group-hover:opacity-100"
              title="Vue précédente"
              aria-label="Vue précédente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleNextImage}
              className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/85 text-white flex items-center justify-center backdrop-blur-sm pointer-events-auto transition-all cursor-pointer active:scale-90 border border-white/20 shadow-md sm:opacity-0 sm:group-hover:opacity-100"
              title="Vue suivante"
              aria-label="Vue suivante"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Bottom Angle Name & Dots Indicator */}
        <div className="absolute bottom-3 inset-x-3 flex flex-col items-center gap-1.5 z-10 pointer-events-none">
          <span className="text-[9.5px] font-bold text-white/95 bg-black/75 px-3 py-0.5 rounded-full backdrop-blur-md tracking-wider border border-white/15">
            {angleLabel}
          </span>

          {/* Dots Pagination */}
          {images.length > 1 && (
            <div className="flex items-center gap-1.5 pointer-events-auto">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex(idx);
                  }}
                  className={`transition-all rounded-full cursor-pointer ${
                    activeImageIndex === idx
                      ? 'w-4 h-1.5 bg-[#C5A880] shadow-sm'
                      : 'w-1.5 h-1.5 bg-white/50 hover:bg-white'
                  }`}
                  aria-label={`Aller à la vue ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Card Editorial Info Body */}
      <div className="p-5 sm:p-6 space-y-3.5">
        <div className="space-y-1.5">
          
          {/* Haute Couture Line & Timeline */}
          <div 
            className="flex items-center justify-between text-[10px] uppercase tracking-[0.16em] font-bold text-[#8C7A6B]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <span className="text-[#1B4332] font-semibold">{creation.coutureLine || 'Haute Couture'}</span>
            {creation.preparationTime && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#C5A880]" />
                {creation.preparationTime.split('(')[0].trim()}
              </span>
            )}
          </div>

          <h3 
            onClick={() => onSelectDetail(creation)}
            className="text-base sm:text-lg font-bold text-[#181512] group-hover:text-[#1B4332] transition-colors duration-300 cursor-pointer leading-snug"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            {creation.title}
          </h3>

          <p 
            className="text-[12px] text-[#5C5248] line-clamp-2 leading-relaxed"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {creation.description}
          </p>
        </div>

        {/* Fabrics preview */}
        <div className="pt-0.5 flex flex-wrap gap-1.5">
          {creation.fabrics.slice(0, 2).map((fabric, idx) => (
            <span 
              key={idx}
              className="px-2.5 py-0.5 rounded-md bg-[#F4EFEA] text-[#6B5F54] text-[10.5px] font-medium"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {fabric}
            </span>
          ))}
        </div>

        {/* Interactive Social Engagement Row (Like / Comment / Share) */}
        <div className="pt-2 flex items-center justify-between border-t border-[#F2ECE4] text-xs">
          {/* Like Action */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleLike(creation.id);
            }}
            className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg transition-all cursor-pointer select-none active:scale-95 ${
              isLiked
                ? 'text-rose-700 bg-rose-50 font-bold'
                : 'text-[#6A5E52] hover:text-[#181512] hover:bg-[#FAF8F5]'
            }`}
            title={isLiked ? 'Coup de cœur ajouté' : 'Ajouter aux coups de cœur'}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-600 text-rose-600' : 'text-[#8C7A6B]'}`} />
            <span className="font-mono text-[11px]">{creation.likesCount || 0}</span>
          </button>

          {/* Comment Action */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectDetail(creation);
            }}
            className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-[#6A5E52] hover:text-[#181512] hover:bg-[#FAF8F5] transition-all cursor-pointer select-none"
            title="Consulter et ajouter des avis"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#8C7A6B]" />
            <span className="text-[11px] font-medium">
              {(creation.comments && creation.comments.length > 0) ? `${creation.comments.length} avis` : 'Avis'}
            </span>
          </button>

          {/* Share Action */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onShare(creation);
            }}
            className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-[#6A5E52] hover:text-[#181512] hover:bg-[#FAF8F5] transition-all cursor-pointer select-none"
            title="Partager cette création"
          >
            <Share2 className="w-3.5 h-3.5 text-[#C5A880]" />
            <span className="text-[11px] font-medium">Partager</span>
          </button>
        </div>

        {/* Direct WhatsApp Ordering Bar with Haute Couture Guarantee */}
        <div className="pt-2.5 border-t border-[#EAE3DA] flex items-center justify-between gap-2">
          <div className="text-left">
            <span 
              className="text-[9px] uppercase tracking-wider text-[#8C7A6B] font-semibold block"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Confection
            </span>
            <span 
              className="font-bold text-xs sm:text-sm text-[#181512]"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              Sur-Mesure
            </span>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-shimmer inline-flex items-center gap-1.5 px-4 py-2 sm:py-2.5 rounded-full bg-[#1B4332] hover:bg-[#143528] text-white text-[10.5px] sm:text-[11px] font-bold tracking-[0.14em] uppercase transition-all duration-300 shadow-sm hover:shadow-lg cursor-pointer border border-[#2D6A4F]/40 active:scale-[0.97]"
            title="Commander cette pièce sur WhatsApp"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current text-[#25D366]" />
            <span>Commander</span>
          </a>
        </div>
      </div>

    </div>
  );
};

export const CreationsSection: React.FC = () => {
  const { 
    creations, 
    occasions, 
    settings, 
    selectedOccasionFilter, 
    setSelectedOccasionFilter, 
    setSelectedCreationForDetail,
    likedCreationIds,
    toggleLikeCreation
  } = useStudio();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sharingCreation, setSharingCreation] = useState<Creation | null>(null);

  // Active filter ID
  const activeUniverseId = selectedOccasionFilter || 'all';

  // Curated Universes / Occasions for 1-click filter (includes Wishlist)
  const universeFilters = useMemo(() => {
    return [
      { id: 'all', name: 'Toutes les Pièces' },
      { 
        id: 'favorites', 
        name: `Coups de Cœur (${likedCreationIds.length})`,
        isHeart: true 
      },
      ...occasions.map(occ => ({ id: occ.id, name: occ.name, isHeart: false }))
    ];
  }, [occasions, likedCreationIds.length]);

  // Filtered Creations
  const filteredCreations = useMemo(() => {
    return creations.filter(c => {
      // 1. Wishlist Filter
      if (activeUniverseId === 'favorites') {
        if (!likedCreationIds.includes(c.id)) return false;
      } else if (activeUniverseId !== 'all') {
        // 2. Universe / Occasion filter
        const matchesOccasionId = c.occasionId === activeUniverseId;
        const matchesOccasionName = c.occasionName.toLowerCase() === activeUniverseId.toLowerCase();
        if (!matchesOccasionId && !matchesOccasionName) return false;
      }

      // 3. Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = c.title.toLowerCase().includes(q);
        const matchesDesc = (c.description || '').toLowerCase().includes(q);
        const matchesFabric = c.fabrics.some(f => f.toLowerCase().includes(q));
        const matchesOccasion = (c.occasionName || '').toLowerCase().includes(q);
        const matchesSilhouette = (c.silhouette || '').toLowerCase().includes(q);
        const matchesLine = (c.coutureLine || '').toLowerCase().includes(q);
        
        if (!matchesTitle && !matchesDesc && !matchesFabric && !matchesOccasion && !matchesSilhouette && !matchesLine) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      // Featured pieces first, then newest
      const aFeat = (a.isFeatured || a.misEnAvant) ? 1 : 0;
      const bFeat = (b.isFeatured || b.misEnAvant) ? 1 : 0;
      if (bFeat !== aFeat) return bFeat - aFeat;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [creations, activeUniverseId, likedCreationIds, searchQuery]);

  return (
    <section id="creations-section" className="py-10 sm:py-16 bg-[#FAF8F5] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* ========================================================================= */}
        {/* SECTION HEADER: PURE HAUTE COUTURE                                       */}
        {/* ========================================================================= */}
        <div className="text-center max-w-3xl mx-auto space-y-3.5 mb-10 sm:mb-14">
          <div 
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F0EBE3] border border-[#D8CFC4] text-[#8C7A6B] text-[10px] sm:text-[11px] font-bold tracking-[0.20em] uppercase shadow-sm"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <Scissors className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Catalogue Exclusif Sur-Mesure</span>
          </div>

          <h1 
            className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#181512] leading-tight"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            {activeUniverseId === 'favorites' ? 'Mes Coups de Cœur' : "Les Pièces d'Exception"}
          </h1>

          <p 
            className="italic text-sm sm:text-lg text-[#6B5F54] max-w-2xl mx-auto"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            {activeUniverseId === 'favorites'
              ? '« Votre sélection privée de robes et tenues prêtes pour un échange direct avec l’Atelier. »'
              : '« Chaque modèle est patronné et sculpté à vos mesures exactes dans notre atelier d’art. »'
            }
          </p>
        </div>

        {/* ========================================================================= */}
        {/* STREAMLINED UNIVERSE SELECTOR & MINIMALIST SEARCH                         */}
        {/* ========================================================================= */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-[#EAE3DA]">
          
          {/* 1-Click Universe Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {universeFilters.map((u) => {
              const isActive = activeUniverseId === u.id;
              return (
                <button
                  key={u.id}
                  onClick={() => setSelectedOccasionFilter(u.id === 'all' ? null : u.id)}
                  className={`shrink-0 flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-full text-[11px] font-bold tracking-[0.16em] uppercase transition-all duration-300 cursor-pointer ${
                    isActive
                      ? u.isHeart 
                        ? 'bg-[#6E2333] text-rose-100 shadow-md scale-[1.02] border border-rose-400/40'
                        : 'bg-[#181512] text-[#FAF8F5] shadow-md scale-[1.02]'
                      : u.isHeart
                        ? 'bg-white text-rose-800 hover:bg-rose-50 border border-rose-200'
                        : 'bg-white text-[#6B5F54] hover:bg-[#EFEAE2] border border-[#E0D7CC] hover:text-[#181512]'
                  }`}
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {u.isHeart && (
                    <Heart className={`w-3.5 h-3.5 ${isActive ? 'fill-rose-300 text-rose-300' : 'fill-rose-500 text-rose-500'}`} />
                  )}
                  <span>{u.name}</span>
                </button>
              );
            })}
          </div>

          {/* Minimalist Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#8C7A6B] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une robe, soie..."
              className="w-full pl-10 pr-8 py-2.5 bg-white rounded-full text-xs text-[#181512] border border-[#E0D7CC] focus:outline-none focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/10 transition-all placeholder:text-[#9E9082] shadow-xs"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#8C7A6B] hover:text-[#181512]"
              >
                ✕
              </button>
            )}
          </div>

        </div>

        {/* ========================================================================= */}
        {/* VIP WISHLIST BANNER (Shown when viewing Coups de Cœur with items)        */}
        {/* ========================================================================= */}
        {activeUniverseId === 'favorites' && filteredCreations.length > 0 && (
          <div className="mb-10 p-6 sm:p-7 bg-gradient-to-br from-[#181512] via-[#231E19] to-[#181512] text-white rounded-3xl border border-[#C5A880]/50 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-6 animate-in fade-in duration-300">
            <div className="space-y-2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C5A880]/20 border border-[#C5A880]/40 text-[#C5A880] text-[10px] font-bold tracking-[0.2em] uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sélection Privée • {filteredCreations.length} modèle{filteredCreations.length > 1 ? 's' : ''}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#FAF8F5]" style={{ fontFamily: "'Cinzel', serif" }}>
                Transmettre vos coups de cœur à l'Atelier
              </h3>
              <p className="text-xs sm:text-sm text-[#D5CABE] max-w-xl leading-relaxed">
                Envoyez votre sélection personnalisée directement à Vanessa Kaniki sur WhatsApp pour convenir d'un créneau d'essayage à Kinshasa ou démarrer votre confection à distance.
              </p>
            </div>

            <div className="w-full lg:w-auto shrink-0 flex flex-col sm:flex-row items-center gap-3">
              <a
                href={generateWhatsAppLink(settings.whatsappNumber, buildWishlistShareMessage(filteredCreations, settings.studioName))}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-shimmer w-full sm:w-auto inline-flex items-center justify-center gap-3 px-7 py-4 rounded-full bg-[#1B4332] hover:bg-[#143528] text-white text-xs sm:text-sm font-bold tracking-[0.16em] uppercase border border-[#C5A880]/60 shadow-xl cursor-pointer transition-all active:scale-95"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <MessageCircle className="w-4 h-4 fill-current text-[#25D366]" />
                <span>Envoyer ma sélection sur WhatsApp</span>
              </a>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* EDITORIAL 3:4 CREATION GRID WITH SWIPEABLE CARDS                         */}
        {/* ========================================================================= */}
        {filteredCreations.length === 0 ? (
          <div className="text-center py-16 sm:py-20 bg-white rounded-3xl border border-[#EAE3DA] p-8 max-w-lg mx-auto shadow-sm space-y-4">
            {activeUniverseId === 'favorites' ? (
              <>
                <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
                  <Heart className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#181512]" style={{ fontFamily: "'Cinzel', serif" }}>
                  Votre Sélection est Vide
                </h3>
                <p className="text-xs text-[#6B5F54] max-w-sm mx-auto leading-relaxed">
                  Explorez les créations de la Maison Van's et cliquez sur le bouton cœur ❤️ pour composer votre carnet privé de pièces d'exception.
                </p>
                <button
                  onClick={() => setSelectedOccasionFilter(null)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#181512] hover:bg-[#1B4332] text-white text-xs font-bold tracking-widest uppercase transition-all shadow-md cursor-pointer"
                >
                  <span>Explorer la Collection</span>
                </button>
              </>
            ) : (
              <>
                <Scissors className="w-10 h-10 text-[#C5A880] mx-auto mb-3 opacity-60" />
                <h3 className="text-lg font-bold text-[#181512]" style={{ fontFamily: "'Cinzel', serif" }}>
                  Aucune création trouvée
                </h3>
                <p className="text-xs text-[#6B5F54] mb-4">Essayez d'ajuster votre recherche ou de réinitialiser le filtre.</p>
                <button
                  onClick={() => {
                    setSelectedOccasionFilter(null);
                    setSearchQuery('');
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#181512] text-white text-xs font-bold tracking-wider uppercase cursor-pointer hover:bg-[#1B4332] transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Voir tout le catalogue</span>
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 sm:gap-8 lg:gap-10">
            {filteredCreations.map((creation) => {
              const isLiked = likedCreationIds.includes(creation.id);

              return (
                <CreationCard
                  key={creation.id}
                  creation={creation}
                  isLiked={isLiked}
                  onToggleLike={toggleLikeCreation}
                  onSelectDetail={setSelectedCreationForDetail}
                  onShare={(c) => setSharingCreation(c)}
                  whatsappNumber={settings.whatsappNumber}
                  studioName={settings.studioName}
                />
              );
            })}
          </div>
        )}

      </div>

      {/* 1-Click Viral Creation Share Modal */}
      {sharingCreation && (
        <ShareModal
          item={sharingCreation}
          type="creation"
          isOpen={Boolean(sharingCreation)}
          onClose={() => setSharingCreation(null)}
        />
      )}

    </section>
  );
};
