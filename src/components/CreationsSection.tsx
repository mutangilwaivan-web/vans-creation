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
  MessageSquare
} from 'lucide-react';
import { generateWhatsAppLink, buildCreationOrderMessage } from '../data/initialData';
import { ShareModal } from './ShareModal';

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
  const [hoveredCreationId, setHoveredCreationId] = useState<string | null>(null);
  const [sharingCreation, setSharingCreation] = useState<Creation | null>(null);

  // Curated Universes / Occasions for 1-click filter
  const universeFilters = useMemo(() => {
    return [
      { id: 'all', name: 'Toutes les Pièces' },
      ...occasions.map(occ => ({ id: occ.id, name: occ.name }))
    ];
  }, [occasions]);

  // Active filter ID
  const activeUniverseId = selectedOccasionFilter || 'all';

  // Filtered Creations
  const filteredCreations = useMemo(() => {
    return creations.filter(c => {
      // Filter by universe / occasion
      if (activeUniverseId !== 'all') {
        const matchesOccasionId = c.occasionId === activeUniverseId;
        const matchesOccasionName = c.occasionName.toLowerCase() === activeUniverseId.toLowerCase();
        if (!matchesOccasionId && !matchesOccasionName) return false;
      }

      // Filter by search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = c.title.toLowerCase().includes(q);
        const matchesDesc = (c.description || '').toLowerCase().includes(q);
        const matchesFabric = c.fabrics.some(f => f.toLowerCase().includes(q));
        const matchesOccasion = (c.occasionName || '').toLowerCase().includes(q);
        const matchesSilhouette = (c.silhouette || '').toLowerCase().includes(q);
        
        if (!matchesTitle && !matchesDesc && !matchesFabric && !matchesOccasion && !matchesSilhouette) {
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
  }, [creations, activeUniverseId, searchQuery]);

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
            Les Pièces d'Exception
          </h1>

          <p 
            className="italic text-sm sm:text-lg text-[#6B5F54] max-w-2xl mx-auto"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            « Chaque modèle est patronné et sculpté à vos mesures exactes dans notre atelier d'art. »
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
                  className={`shrink-0 px-5 py-2.5 rounded-full text-[11px] font-bold tracking-[0.16em] uppercase transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-[#181512] text-[#FAF8F5] shadow-md scale-[1.02]'
                      : 'bg-white text-[#6B5F54] hover:bg-[#EFEAE2] border border-[#E0D7CC] hover:text-[#181512]'
                  }`}
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {u.name}
                </button>
              );
            })}
          </div>

          {/* Minimalist Search Bar with 3D Focus */}
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
        {/* EDITORIAL 3:4 CREATION GRID WITH 3D HOVER ELEVATION                      */}
        {/* ========================================================================= */}
        {filteredCreations.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#EAE3DA] p-8 max-w-lg mx-auto shadow-sm">
            <Scissors className="w-10 h-10 text-[#C5A880] mx-auto mb-3 opacity-60" />
            <h3 
              className="text-lg font-bold text-[#181512] mb-1"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
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
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 sm:gap-8 lg:gap-10">
            {filteredCreations.map((creation) => {
              const isHovered = hoveredCreationId === creation.id;
              const mainImage = creation.images[0] || '/images/vanessa-hero.jpg';
              const secondaryImage = creation.images[1] || mainImage;
              const displayImage = isHovered && creation.images.length > 1 ? secondaryImage : mainImage;

              const whatsappUrl = generateWhatsAppLink(
                settings.whatsappNumber,
                buildCreationOrderMessage(settings.studioName, creation.title, creation.priceEstimate, creation.silhouette)
              );

              return (
                <div
                  key={creation.id}
                  onMouseEnter={() => setHoveredCreationId(creation.id)}
                  onMouseLeave={() => setHoveredCreationId(null)}
                  className="group bg-white rounded-[28px] overflow-hidden border border-[#EAE3DA]/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_-10px_rgba(27,67,50,0.18)] hover:border-[#C5A880]/60 transition-all duration-500 flex flex-col justify-between select-none transform hover:-translate-y-1.5"
                >
                  {/* Image Container with 3:4 Editorial Portrait Ratio */}
                  <div 
                    onClick={() => setSelectedCreationForDetail(creation)}
                    className="relative aspect-[3/4] overflow-hidden bg-[#181512] cursor-pointer"
                  >
                    <img
                      src={displayImage}
                      alt={creation.title}
                      className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105 filter contrast-[1.04]"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/10 opacity-70 group-hover:opacity-50 transition-opacity duration-300" />

                    {/* Top Floating Action Badges */}
                    <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10 pointer-events-none">
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
                          toggleLikeCreation(creation.id);
                        }}
                        className={`pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md transition-all duration-300 cursor-pointer shadow-md active:scale-90 ${
                          likedCreationIds.includes(creation.id)
                            ? 'bg-[#6E2333]/90 text-rose-200 border border-rose-400/50'
                            : 'bg-black/50 hover:bg-black/75 text-white/90 border border-white/20'
                        }`}
                        title={likedCreationIds.includes(creation.id) ? 'Retirer des coups de cœur' : 'Ajouter aux coups de cœur'}
                        aria-label="Aimer cette création"
                      >
                        <Heart className={`w-3.5 h-3.5 ${likedCreationIds.includes(creation.id) ? 'fill-rose-400 text-rose-400' : 'text-white'}`} />
                        <span className="text-[11px] font-bold font-mono">{creation.likesCount || 0}</span>
                      </button>
                    </div>

                    {/* Quick View Button on Hover */}
                    <div className="absolute inset-x-4 bottom-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <span 
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/95 backdrop-blur-md text-[#181512] text-[11px] font-bold tracking-[0.16em] uppercase shadow-xl hover:bg-[#1B4332] hover:text-white transition-all duration-300"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Découvrir les détails</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Editorial Info Body */}
                  <div className="p-5 sm:p-6 space-y-3.5">
                    <div className="space-y-1.5">
                      <div 
                        className="flex items-center justify-between text-[10.5px] text-[#8C7A6B] uppercase tracking-[0.16em] font-semibold"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      >
                        <span>{creation.silhouette}</span>
                        {creation.preparationTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#C5A880]" />
                            {creation.preparationTime}
                          </span>
                        )}
                      </div>

                      <h3 
                        onClick={() => setSelectedCreationForDetail(creation)}
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
                          toggleLikeCreation(creation.id);
                        }}
                        className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg transition-all cursor-pointer select-none active:scale-95 ${
                          likedCreationIds.includes(creation.id)
                            ? 'text-rose-700 bg-rose-50 font-bold'
                            : 'text-[#6A5E52] hover:text-[#181512] hover:bg-[#FAF8F5]'
                        }`}
                        title={likedCreationIds.includes(creation.id) ? 'Coup de cœur ajouté' : 'Ajouter aux coups de cœur'}
                      >
                        <Heart className={`w-3.5 h-3.5 ${likedCreationIds.includes(creation.id) ? 'fill-rose-600 text-rose-600' : 'text-[#8C7A6B]'}`} />
                        <span className="font-mono text-[11px]">{creation.likesCount || 0}</span>
                      </button>

                      {/* Comment Action */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCreationForDetail(creation);
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
                          setSharingCreation(creation);
                        }}
                        className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-[#6A5E52] hover:text-[#181512] hover:bg-[#FAF8F5] transition-all cursor-pointer select-none"
                        title="Partager cette création"
                      >
                        <Share2 className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span className="text-[11px] font-medium">Partager</span>
                      </button>
                    </div>

                    {/* Direct WhatsApp Ordering Bar */}
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
