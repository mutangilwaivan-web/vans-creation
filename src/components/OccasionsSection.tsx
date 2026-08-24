import React from 'react';
import { useStudio } from '../context/StudioContext';
import { Calendar, ArrowRight, MessageCircle } from 'lucide-react';
import { generateWhatsAppLink, buildGeneralContactMessage } from '../data/initialData';

interface OccasionsSectionProps {
  onSelectOccasion?: (occasionName: string) => void;
}

export const OccasionsSection: React.FC<OccasionsSectionProps> = ({ onSelectOccasion }) => {
  const { occasions, creations, setSelectedOccasionFilter, setActiveTab, settings } = useStudio();

  const handleOccasionClick = (occasionName: string) => {
    setSelectedOccasionFilter(occasionName);
    if (onSelectOccasion) {
      onSelectOccasion(occasionName);
    } else {
      setActiveTab('creations');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const customOccasionWaUrl = generateWhatsAppLink(
    settings.whatsappNumber,
    buildGeneralContactMessage(settings.studioName, undefined, 'Création sur-mesure pour un événement spécial')
  );

  return (
    <section id="occasions-section" className="py-10 sm:py-16 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3.5 mb-10 sm:mb-14">
          <div 
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F0EBE3] border border-[#D8CFC4] text-[#8C7A6B] text-[10px] sm:text-[11px] font-bold tracking-[0.20em] uppercase shadow-xs"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <Calendar className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Collections Événementielles</span>
          </div>
          <h2 
            className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#181512]"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Pour Chaque Grand Moment de Vie
          </h2>
          <p 
            className="italic text-sm sm:text-base text-[#6B5F54] max-w-2xl mx-auto"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            « Explorez nos univers créatifs sculptés selon la grandeur et le protocole de votre célébration. »
          </p>
        </div>

        {/* Occasions Cards Grid with 3D Depth */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {occasions.map((occ) => {
            const count = creations.filter(c => 
              c.occasionName.toLowerCase() === occ.name.toLowerCase() || c.occasionId === occ.id
            ).length;

            return (
              <div
                key={occ.id}
                id={`occasion-card-${occ.id}`}
                onClick={() => handleOccasionClick(occ.name)}
                className="group relative rounded-[28px] overflow-hidden cursor-pointer bg-[#181512] aspect-[4/5] sm:aspect-[3/4] shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_20px_50px_rgba(27,67,50,0.3)] transition-all duration-500 flex flex-col justify-end p-6 sm:p-8 border-2 border-[#38322B] hover:border-[#C5A880]/70 active:scale-[0.98] transform hover:-translate-y-1.5"
              >
                {/* Background Cover Image with Zoom */}
                <img
                  src={occ.coverImage}
                  alt={occ.name}
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 filter brightness-[0.78] contrast-[1.06]"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#12100E] via-[#12100E]/50 to-transparent group-hover:via-[#12100E]/35 transition-colors duration-300" />

                {/* Content */}
                <div className="relative z-10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span 
                      className="px-3 py-1 rounded-full text-[10px] sm:text-[10.5px] font-bold tracking-wider uppercase bg-[#C5A880] text-[#181512] shadow-sm"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      {count} Modèle{count > 1 ? 's' : ''} disponible{count > 1 ? 's' : ''}
                    </span>
                  </div>

                  <h3 
                    className="text-xl sm:text-2xl font-bold text-[#FAF8F5] group-hover:text-[#C5A880] transition-colors leading-tight"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    {occ.name}
                  </h3>

                  <p 
                    className="text-xs text-[#D8CFC4] line-clamp-2 leading-relaxed"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {occ.description}
                  </p>

                  <div 
                    className="pt-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C5A880] group-hover:text-white transition-colors"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    <span>Explorer la collection</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Custom Event Banner with 3D Depth */}
        <div className="mt-10 sm:mt-14 bg-white rounded-[32px] border border-[#E8E1D7]/80 p-6 sm:p-9 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <h4 
              className="text-lg sm:text-xl font-bold text-[#181512]"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              Un Événement Particulier Non Listé ?
            </h4>
            <p 
              className="text-xs sm:text-sm text-[#6B5F54] max-w-xl"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Dot, gala présidentiel, défilé ou anniversaire d'exception : Vanessa Kaniki conçoit une tenue exclusive adaptée à vos souhaits.
            </p>
          </div>

          <a
            href={customOccasionWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-shimmer inline-flex items-center justify-center gap-2.5 bg-[#1B4332] hover:bg-[#143528] text-white py-4 px-7 rounded-full text-xs font-bold uppercase tracking-[0.16em] shadow-lg hover:shadow-xl transition-all shrink-0 w-full sm:w-auto border border-[#2D6A4F]/50 cursor-pointer"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <MessageCircle className="w-4 h-4 fill-current text-[#25D366]" />
            <span>Consulter Vanessa sur WhatsApp</span>
          </a>
        </div>

      </div>
    </section>
  );
};
