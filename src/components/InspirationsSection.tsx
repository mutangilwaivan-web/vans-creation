import React, { useState, useMemo } from 'react';
import { useStudio } from '../context/StudioContext';
import { Inspiration } from '../types';
import { 
  Lightbulb, 
  Sparkles, 
  MessageCircle, 
  Share2, 
  Search, 
  RotateCcw
} from 'lucide-react';
import { generateWhatsAppLink, buildInspirationOrderMessage } from '../data/initialData';
import { ShareModal } from './ShareModal';

export const InspirationsSection: React.FC = () => {
  const { 
    inspirations, 
    settings, 
    setSelectedInspirationForDetail 
  } = useStudio();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'original' | 'external'>('all');
  const [selectedStyleTag, setSelectedStyleTag] = useState<string>('all');
  const [selectedOccasion, setSelectedOccasion] = useState<string>('all');
  const [sharingInspiration, setSharingInspiration] = useState<Inspiration | null>(null);

  // Extract unique style tags and occasions
  const allStyleTags = useMemo(() => {
    const set = new Set<string>();
    inspirations.forEach(i => i.styleTags.forEach(tag => set.add(tag)));
    return Array.from(set);
  }, [inspirations]);

  const allOccasions = useMemo(() => {
    const set = new Set<string>();
    inspirations.forEach(i => set.add(i.occasion));
    return Array.from(set);
  }, [inspirations]);

  const filteredInspirations = useMemo(() => {
    return inspirations.filter(item => {
      if (filterType === 'original' && !item.isOriginalCreation) return false;
      if (filterType === 'external' && item.isOriginalCreation) return false;

      if (selectedStyleTag !== 'all' && !item.styleTags.includes(selectedStyleTag)) {
        return false;
      }

      if (selectedOccasion !== 'all' && item.occasion !== selectedOccasion) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesCat = item.category.toLowerCase().includes(q);
        const matchesAuthor = item.sourceAuthor?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCat && !matchesAuthor) return false;
      }

      return true;
    });
  }, [inspirations, filterType, selectedStyleTag, selectedOccasion, searchQuery]);

  const resetFilters = () => {
    setFilterType('all');
    setSelectedStyleTag('all');
    setSelectedOccasion('all');
    setSearchQuery('');
  };

  const hasActiveFilters = filterType !== 'all' || selectedStyleTag !== 'all' || selectedOccasion !== 'all' || searchQuery.trim() !== '';

  return (
    <section id="inspirations-section" className="py-16 sm:py-24 bg-[#FAF8F5] border-b border-[#EAE3DA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div 
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F0EBE3] border border-[#D8CFC4] text-[#8C7A6B] text-[10px] sm:text-[11px] font-bold tracking-[0.20em] uppercase shadow-xs"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <Lightbulb className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Moodboard & Carnet d'Idées Couture</span>
          </div>
          <h2 
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#181512]"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Inspirations & Tendances Mode
          </h2>
          <p 
            className="italic text-base sm:text-xl text-[#6B5F54] leading-relaxed"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            « Vous avez repéré un style sur Pinterest ou un défilé ? Nous le réinterprétons sur-mesure pour votre morphologie. »
          </p>
        </div>

        {/* Filter Bar with 3D Focus */}
        <div className="bg-white p-5 sm:p-7 rounded-[32px] border border-[#E8E1D7]/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-4 mb-10">
          
          {/* Top Segment: Type Toggle (Original vs External) */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                id="insp-filter-all"
                onClick={() => setFilterType('all')}
                className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all ${
                  filterType === 'all'
                    ? 'bg-[#181512] text-white shadow-md'
                    : 'bg-[#FAF8F5] text-[#5C5248] border border-[#E0D7CC] hover:bg-[#EFEAE2]'
                }`}
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Toutes ({inspirations.length})
              </button>

              <button
                id="insp-filter-original"
                onClick={() => setFilterType('original')}
                className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all ${
                  filterType === 'original'
                    ? 'bg-[#1B4332] text-white shadow-md'
                    : 'bg-[#FAF8F5] text-[#1B4332] border border-[#E0D7CC] hover:bg-[#EFEAE2]'
                }`}
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Créations Originales de l'Atelier</span>
              </button>

              <button
                id="insp-filter-external"
                onClick={() => setFilterType('external')}
                className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all ${
                  filterType === 'external'
                    ? 'bg-[#3A3530] text-white shadow-md'
                    : 'bg-[#FAF8F5] text-[#5C5248] border border-[#E0D7CC] hover:bg-[#EFEAE2]'
                }`}
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <Lightbulb className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Inspirations Défilés & Tendance</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[#8C7A6B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un style, mot clé..."
                className="w-full pl-9 pr-4 py-2.5 bg-[#FAF8F5] border border-[#E0D7CC] rounded-full text-xs text-[#181512] placeholder-[#A39688] focus:outline-none focus:border-[#1B4332]"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              />
            </div>
          </div>

          {/* Secondary Filter Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#F2ECE4]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] mr-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Styles :
            </span>
            <button
              onClick={() => setSelectedStyleTag('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold ${
                selectedStyleTag === 'all' ? 'bg-[#181512] text-white' : 'bg-[#FAF8F5] text-[#5C5248] hover:bg-[#EFEAE2]'
              }`}
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Tous
            </button>
            {allStyleTags.map((tag, i) => (
              <button
                key={i}
                onClick={() => setSelectedStyleTag(tag === selectedStyleTag ? 'all' : tag)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold ${
                  selectedStyleTag === tag ? 'bg-[#181512] text-white' : 'bg-[#FAF8F5] text-[#5C5248] border border-[#E8E1D7] hover:bg-[#EFEAE2]'
                }`}
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                #{tag}
              </button>
            ))}
          </div>

          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-2 border-t border-[#F2ECE4] text-xs">
              <span className="text-[#8C7A6B]">Filtres d'inspiration actifs</span>
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-[#1B4332] hover:underline font-bold"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Réinitialiser</span>
              </button>
            </div>
          )}

        </div>

        {/* Inspirations Cards Grid with 3D Elevation */}
        {filteredInspirations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredInspirations.map((item) => {
              const waOrderMsg = buildInspirationOrderMessage(item, settings.studioName);
              const waLink = generateWhatsAppLink(settings.whatsappNumber, waOrderMsg);

              return (
                <div
                  key={item.id}
                  id={`inspiration-card-${item.id}`}
                  className="group bg-white rounded-[28px] overflow-hidden border border-[#E8E1D7]/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_rgba(27,67,50,0.15)] hover:border-[#C5A880]/60 transition-all duration-400 flex flex-col justify-between transform hover:-translate-y-1.5"
                >
                  {/* Image Container */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#181512]">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 filter brightness-[0.96] contrast-[1.04]"
                    />

                    {/* MANDATORY PROMINENT BADGE (PRD Requirement) */}
                    <div className="absolute top-3.5 left-3.5 right-3.5 flex flex-col gap-1.5">
                      {item.isOriginalCreation ? (
                        <div className="self-start px-3.5 py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider uppercase bg-[#1B4332] text-white shadow-md border border-[#2D6A4F]/60 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                          <span>Création Originale de l'Atelier</span>
                        </div>
                      ) : (
                        <div className="self-start px-3.5 py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider uppercase bg-[#2C2723]/90 text-[#FAF8F5] backdrop-blur-md shadow-md border border-[#4A4035] flex items-center gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-[#C5A880]" />
                          <span>Inspiration & Tendance Externe</span>
                        </div>
                      )}
                    </div>

                    {/* Category Overlay bottom left */}
                    <div className="absolute bottom-3 left-3">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-black/60 text-white backdrop-blur-sm">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      
                      <div className="flex items-center justify-between text-xs text-[#8C7A6B]">
                        <span>{item.occasion}</span>
                        {item.sourceAuthor && (
                          <span className="text-[11px] truncate max-w-[140px] italic">
                            Source : {item.sourceAuthor}
                          </span>
                        )}
                      </div>

                      <h3 
                        className="text-xl font-bold text-[#181512] group-hover:text-[#1B4332] transition-colors"
                        style={{ fontFamily: "'Cinzel', serif" }}
                      >
                        {item.title}
                      </h3>

                      <p 
                        className="text-xs text-[#5C5248] leading-relaxed"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      >
                        {item.description}
                      </p>

                      {/* Style Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.styleTags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-0.5 rounded-md bg-[#FAF8F5] border border-[#E0D7CC] text-[10px] font-medium text-[#6B5F54]"
                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {item.sourceNotes && (
                        <p className="text-[11px] text-[#8C7A6B] italic pt-1 border-t border-[#F2ECE4]">
                          Note d'Atelier : {item.sourceNotes}
                        </p>
                      )}
                    </div>

                    {/* CONVERSION CTA with Shimmer */}
                    <div className="pt-4 border-t border-[#F2ECE4] space-y-2">
                      <div className="flex items-center gap-2">
                        <a
                          id={`insp-order-btn-${item.id}`}
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-shimmer flex-1 inline-flex items-center justify-center gap-2 bg-[#1B4332] hover:bg-[#143528] text-white py-3.5 px-4 rounded-xl text-xs font-bold tracking-wider uppercase shadow-md hover:shadow-lg transition-all border border-[#2D6A4F]/40 cursor-pointer"
                          title="Demander à la couturière de confectionner un modèle similaire"
                          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        >
                          <MessageCircle className="w-4 h-4 fill-current text-[#25D366]" />
                          <span>Commander Similaire</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => setSharingInspiration(item)}
                          className="p-3.5 rounded-xl bg-[#FAF8F5] hover:bg-[#C5A880] text-[#5C5248] hover:text-[#181512] transition-colors border border-[#E0D7CC] cursor-pointer"
                          title="Partager cette inspiration sur les réseaux"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="text-center">
                        <span className="text-[10px] text-[#8C7A6B]">
                          Adapté à votre taille, vos couleurs & vos matières préférées
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#E8E1D7] p-8 space-y-4 max-w-xl mx-auto shadow-sm">
            <Lightbulb className="w-10 h-10 text-[#C5A880] mx-auto opacity-60" />
            <h3 
              className="text-xl font-bold text-[#181512]"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              Aucune inspiration ne correspond à votre filtre
            </h3>
            <p className="text-xs text-[#6B5F54]">
              Vous pouvez nous envoyer directement vos photos ou liens Pinterest sur WhatsApp pour obtenir un avis et un devis.
            </p>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#181512] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#1B4332] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Voir tout le carnet d'inspirations</span>
            </button>
          </div>
        )}

      </div>

      {/* MODALE DE PARTAGE SOCIAL D'INSPIRATION */}
      {sharingInspiration && (
        <ShareModal
          item={sharingInspiration}
          type="inspiration"
          isOpen={Boolean(sharingInspiration)}
          onClose={() => setSharingInspiration(null)}
        />
      )}

    </section>
  );
};
