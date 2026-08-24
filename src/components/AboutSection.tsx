import React from 'react';
import { useStudio } from '../context/StudioContext';
import { 
  Scissors, 
  CheckCircle, 
  MessageCircle, 
  Sparkles
} from 'lucide-react';
import { generateWhatsAppLink, buildGeneralContactMessage } from '../data/initialData';

export const AboutSection: React.FC = () => {
  const { settings } = useStudio();

  const steps = [
    {
      number: "01",
      title: "Consultation & Esquisse",
      description: "Échange direct avec Vanessa Kaniki pour cerner vos envies, votre morphologie et le thème de votre événement.",
    },
    {
      number: "02",
      title: "Patronage & Toile d'Essai",
      description: "Conception d'un patron sur-mesure unique et validation du bien-aller lors d'un premier essayage en toile.",
    },
    {
      number: "03",
      title: "Coupe & Assemblage Noble",
      description: "Façonnage dans les plus belles soies, mikados ou dentelles avec baleinage couturier et finitions d'art.",
    },
    {
      number: "04",
      title: "Finitions & Remise de la Pièce",
      description: "Ourlets invisibles main, ajustements ultimes et livraison de votre création dans sa housse de protection.",
    },
  ];

  const whatsappDirectUrl = generateWhatsAppLink(
    settings.whatsappNumber,
    buildGeneralContactMessage(settings.studioName, undefined, 'Rencontre & Échange Atelier')
  );

  return (
    <section id="about-section" className="py-14 sm:py-20 bg-[#FAF8F5] border-b border-[#EAE3DA]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center mb-16 sm:mb-20">
          
          {/* Left: Couturière Portrait in 3D Stage */}
          <div className="lg:col-span-6">
            <div className="relative aspect-[4/5] rounded-[32px] overflow-hidden shadow-[0_25px_60px_-15px_rgba(27,67,50,0.3)] border-2 border-[#C5A880]/60 bg-[#181512] group">
              <img
                src="/images/vanessa-hero.jpg"
                alt="Vanessa Kaniki - Modéliste Couturière"
                className="w-full h-full object-cover object-top filter contrast-[1.05] saturate-[1.08] group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex items-end p-6 sm:p-8">
                <div className="text-white space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181512]/80 backdrop-blur-md text-[#C5A880] text-[9.5px] font-bold tracking-widest uppercase border border-[#C5A880]/40 mb-1">
                    <Sparkles className="w-3 h-3 text-[#C5A880]" />
                    <span>Fondatrice & Maître Modéliste</span>
                  </div>
                  <span 
                    className="text-2xl sm:text-3xl font-bold block"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    {settings.designerName}
                  </span>
                  <span 
                    className="text-[10px] sm:text-[11px] text-[#D8CFC4] tracking-[0.20em] uppercase block font-semibold"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Atelier Haute Couture • Kinshasa
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Bio & Philosophy */}
          <div className="lg:col-span-6 space-y-6">
            <div 
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F0EBE3] border border-[#D8CFC4] text-[#8C7A6B] text-[10px] sm:text-[11px] font-bold tracking-[0.20em] uppercase shadow-xs"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <Scissors className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Savoir-Faire & Modélisme d'Art</span>
            </div>

            <h2 
              className="text-2xl sm:text-4xl md:text-[2.75rem] font-bold tracking-tight text-[#181512] leading-[1.1]"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              L'Art de la Coupe & la Pureté des Lignes
            </h2>

            <p 
              className="italic text-lg sm:text-xl text-[#6B5F54] leading-relaxed"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              « Chaque création est pensée comme une signature architecturale unique, conçue pour magnifier la silhouette lors de vos moments inoubliables. »
            </p>

            <div 
              className="space-y-4 text-[13px] sm:text-sm text-[#4A423A] leading-[1.7]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <p>{settings.bio}</p>
              <p>{settings.atelierStory}</p>
            </div>

            {/* Commitments */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-[12px] sm:text-[13px] font-semibold text-[#181512]"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <CheckCircle className="w-[18px] h-[18px] text-[#2D6A4F] shrink-0" />
                <span>Patrons personnalisés et pièces uniques sur commande</span>
              </div>
              <div className="flex items-center gap-3 text-[12px] sm:text-[13px] font-semibold text-[#181512]"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <CheckCircle className="w-[18px] h-[18px] text-[#2D6A4F] shrink-0" />
                <span>Matières nobles sélectionnées pour leur tombé majestueux</span>
              </div>
              <div className="flex items-center gap-3 text-[12px] sm:text-[13px] font-semibold text-[#181512]"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <CheckCircle className="w-[18px] h-[18px] text-[#2D6A4F] shrink-0" />
                <span>Suivi direct et personnalisé via WhatsApp</span>
              </div>
            </div>

            <div className="pt-3">
              <a
                href={whatsappDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-shimmer inline-flex items-center gap-2.5 bg-[#1B4332] hover:bg-[#143528] text-white px-8 py-4 rounded-full text-[11px] sm:text-[12px] font-bold tracking-[0.16em] uppercase shadow-lg hover:shadow-2xl transition-all duration-400 border border-[#2D6A4F]/50 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <MessageCircle className="w-4 h-4 fill-current text-[#25D366]" />
                <span>Prendre Rendez-Vous à l'Atelier</span>
              </a>
            </div>

          </div>
        </div>

        {/* 4-Step Process Bar with 3D Hover elevation */}
        <div className="bg-white p-7 sm:p-10 rounded-3xl border border-[#E8E1D7]/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2.5">
            <span 
              className="text-[10px] sm:text-[11px] font-bold text-[#8C7A6B] tracking-[0.22em] uppercase"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Méthodologie Sur-Mesure
            </span>
            <h3 
              className="text-xl sm:text-2xl font-bold text-[#181512]"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              De l'Esquisse à la Pièce Finale
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className="group/step bg-[#FAF8F5] p-6 rounded-2xl border border-[#E8E1D7]/80 space-y-3 flex flex-col justify-between hover:border-[#C5A880] hover:shadow-lg hover:-translate-y-1 transition-all duration-400 cursor-default"
              >
                <span 
                  className="text-2xl sm:text-3xl font-bold text-[#C5A880] group-hover/step:text-[#1B4332] transition-colors block"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  {step.number}
                </span>
                <div className="space-y-1.5">
                  <h4 
                    className="text-[13px] sm:text-sm font-bold text-[#181512]"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    {step.title}
                  </h4>
                  <p 
                    className="text-[12px] text-[#5C5248] leading-[1.6]"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
