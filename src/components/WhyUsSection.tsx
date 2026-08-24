import React from 'react';
import { useStudio } from '../context/StudioContext';
import { 
  Scissors, 
  Sparkles, 
  Ruler, 
  HeartHandshake, 
  CheckCircle2, 
  ArrowUpRight 
} from 'lucide-react';
import { generateWhatsAppLink, buildGeneralContactMessage } from '../data/initialData';

export const WhyUsSection: React.FC = () => {
  const { settings, setActiveTab } = useStudio();

  const argumentsList = [
    {
      icon: <Ruler className="w-6 h-6 text-[#C5A880]" />,
      title: "Sur-Mesure Architectural",
      subtitle: "Patronage unique & toiles d'essai",
      description: "Chaque patron est tracé manuellement à vos mensurations exactes. Pas de standardisation, nous sculptons le vêtement pour magnifier vos proportions.",
      highlight: "Précision au millimètre",
    },
    {
      icon: <Scissors className="w-6 h-6 text-[#C5A880]" />,
      title: "Personnalisation Intégrale",
      subtitle: "Encolures, traînes & étoffes au choix",
      description: "Vous avez le contrôle total sur les détails : choix du décolleté, manches amovibles, fentes galbantes, broderies fines et finitions dos.",
      highlight: "100% de liberté créative",
    },
    {
      icon: <Sparkles className="w-6 h-6 text-[#C5A880]" />,
      title: "Finitions Haute Couture",
      subtitle: "Matières nobles & points invisibles",
      description: "Soie sauvage, mikado italien, dentelle de Calais et organza précieux. Ourlets roulottés à la main, baleinages d’art et doublures soyeuses.",
      highlight: "Standards des grands ateliers",
    },
    {
      icon: <HeartHandshake className="w-6 h-6 text-[#C5A880]" />,
      title: "Accompagnement Bienveillant",
      subtitle: "Échanges WhatsApp & essayages dédiés",
      description: "Un contact direct avec votre couturière sans intermédiaire. Suivi vidéo de l'avancement, essayages en atelier ou guidage précis à distance.",
      highlight: "Disponibilité continue",
    },
  ];

  const whatsappAppointmentUrl = generateWhatsAppLink(
    settings.whatsappNumber,
    buildGeneralContactMessage(settings.studioName, undefined, 'Consultation Sur-Mesure Gratuite')
  );

  return (
    <section id="why-us-section" className="py-16 sm:py-24 bg-[#FAF8F5] border-b border-[#EAE3DA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div 
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F0EBE3] border border-[#D8CFC4] text-[#8C7A6B] text-[10px] sm:text-[11px] font-bold tracking-[0.20em] uppercase shadow-xs"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>L'Excellence du Savoir-Faire</span>
          </div>
          <h2 
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#181512]"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Pourquoi Choisir Notre Atelier Digital ?
          </h2>
          <p 
            className="italic text-base sm:text-xl text-[#6B5F54] leading-relaxed"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            « Bien plus qu'un vêtement, nous donnons vie à une création qui raconte votre histoire et sublime votre présence. »
          </p>
        </div>

        {/* 4 Core Pillars Grid with 3D Elevation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {argumentsList.map((item, index) => (
            <div
              key={index}
              id={`why-us-card-${index}`}
              className="group bg-white p-7 sm:p-8 rounded-[28px] border border-[#E8E1D7]/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_40px_rgba(27,67,50,0.15)] hover:border-[#C5A880]/60 transition-all duration-400 flex flex-col justify-between transform hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] border border-[#EAE3DA] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#1B4332] group-hover:text-white transition-all duration-400 shadow-xs">
                  {item.icon}
                </div>
                
                <div className="space-y-1">
                  <span 
                    className="text-[10px] sm:text-[10.5px] font-bold text-[#C5A880] uppercase tracking-wider block"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {item.highlight}
                  </span>
                  <h3 
                    className="text-lg sm:text-xl font-bold text-[#181512]"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    {item.title}
                  </h3>
                  <p 
                    className="text-xs font-semibold text-[#8C7A6B]"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {item.subtitle}
                  </p>
                </div>

                <p 
                  className="text-[12.5px] text-[#5C5248] leading-[1.65]"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {item.description}
                </p>
              </div>

              <div 
                className="pt-6 mt-6 border-t border-[#F2ECE4] flex items-center gap-2 text-xs font-semibold text-[#181512] group-hover:text-[#1B4332] transition-colors"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
                <span>Garantie de satisfaction</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner Conversion */}
        <div className="mt-14 p-8 sm:p-12 rounded-[36px] bg-[#181512] text-[#FAF8F5] flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl border border-[#3A322A]">
          <div className="space-y-2 text-center md:text-left">
            <span 
              className="text-xs font-bold uppercase tracking-widest text-[#C5A880]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Premier échange gratuit & sans engagement
            </span>
            <h3 
              className="text-2xl sm:text-3xl font-bold"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              Vous avez un événement en vue ?
            </h3>
            <p 
              className="text-xs sm:text-sm text-[#D8CFC4] max-w-xl leading-relaxed"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Partagez vos inspirations ou vos croquis directement sur WhatsApp. Nous étudions la faisabilité et vous guidons sur les matières.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3.5 shrink-0 w-full md:w-auto">
            <a
              id="why-us-whatsapp-cta"
              href={whatsappAppointmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-shimmer inline-flex items-center justify-center gap-2.5 bg-[#1B4332] hover:bg-[#143528] text-white px-7 py-4 rounded-full text-xs font-bold uppercase tracking-[0.16em] shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto border border-[#2D6A4F]/50"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <span>Échanger sur WhatsApp</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
            <button
              onClick={() => {
                setActiveTab('creations');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center gap-2 bg-[#2C2723] hover:bg-[#3D3630] text-[#FAF8F5] px-6 py-4 rounded-full text-xs font-bold uppercase tracking-[0.16em] transition-colors w-full sm:w-auto border border-[#443C35]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <span>Voir le catalogue</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
