import React, { useState, useEffect } from 'react';
import { useStudio } from '../context/StudioContext';
import { ArrowDownRight, ArrowRight, MessageCircle, Unlock, Sparkles } from 'lucide-react';
import { generateWhatsAppLink, buildGeneralContactMessage } from '../data/initialData';

export const HeroSection: React.FC = () => {
  const { 
    settings, 
    creations, 
    setActiveTab, 
    setSelectedCreationForDetail,
    adminAuthenticated 
  } = useStudio();

  const [currentTime, setCurrentTime] = useState<string>('05:32:17');
  const [imageLoaded, setImageLoaded] = useState(false);

  // Real-time Clock in Africa/Kinshasa
  useEffect(() => {
    const updateClock = () => {
      try {
        const opts: Intl.DateTimeFormatOptions = { 
          timeZone: 'Africa/Kinshasa', 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        };
        const timeFormatted = new Intl.DateTimeFormat('fr-FR', opts).format(new Date());
        setCurrentTime(timeFormatted);
      } catch {
        const now = new Date();
        setCurrentTime(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Featured Creation for bottom preview
  const featuredCreation = creations.find(c => c.misEnAvant === true || c.isFeatured === true) || creations[0] || {
    id: 'creat-default',
    title: 'ROBE ÉMERAUDE',
    categories: ['COLLECTION GALA', 'Haute Couture'],
    images: ['/images/vanessa-hero.jpg']
  };

  const handleGoToCreations = () => {
    setActiveTab('creations');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section 
      id="hero-editorial-view"
      className="relative w-full min-h-[100dvh] bg-[#FAF8F5] text-[#181512] overflow-x-hidden flex flex-col justify-between select-none"
    >
      {/* ========================================================================= */}
      {/* 1. TOP HEADER: MONOGRAM, CITY, TIME & WHATSAPP (NO NAVBAR ON HOME)        */}
      {/* ========================================================================= */}
      <header 
        id="hero-top-header"
        className="relative z-20 w-full max-w-7xl mx-auto px-5 sm:px-8 md:px-12 lg:px-16 pt-5 sm:pt-7 flex items-center justify-between"
      >
        {/* Left: Monogram V/C Brand Mark */}
        <div 
          id="hero-monogram-brand"
          onClick={() => setActiveTab('home')}
          className="cursor-pointer group flex items-center gap-3 select-none"
        >
          <div 
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#181512] text-[#FAF8F5] flex items-center justify-center text-sm font-light border border-[#C5A880]/60 shadow-sm group-hover:bg-[#1B4332] transition-colors duration-300"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            <span>V</span>
            <span className="text-[#C5A880] text-xs font-mono font-normal mx-0.5 transform -rotate-12">/</span>
            <span>C</span>
          </div>
          <div className="flex flex-col">
            <span 
              className="text-xs sm:text-base font-bold tracking-[0.18em] text-[#181512] group-hover:text-[#1B4332] transition-colors uppercase leading-tight"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              VAN'S CREATION
            </span>
            <span 
              className="text-[8px] sm:text-[9px] tracking-[0.24em] text-[#8C7A6B] uppercase font-semibold"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Haute Couture • Kinshasa
            </span>
          </div>
        </div>

        {/* Right: Location, Live Clock & Direct WhatsApp */}
        <div 
          id="hero-top-meta"
          className="flex items-center gap-3 sm:gap-4 select-none"
        >
          <div className="text-right leading-tight hidden xs:block">
            <div 
              className="flex items-center justify-end gap-1.5 text-[9px] sm:text-[10.5px] font-bold tracking-[0.22em] text-[#181512] uppercase"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>KINSHASA</span>
            </div>
            <div className="text-[#8C7A6B] tracking-[0.16em] tabular-nums font-mono text-[10px] sm:text-xs">
              {currentTime}
            </div>
          </div>

          <a
            href={generateWhatsAppLink(
              settings.whatsappNumber,
              buildGeneralContactMessage(settings.studioName)
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-[#1B4332] hover:bg-[#143528] text-white px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10.5px] font-bold tracking-[0.14em] uppercase transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer border border-[#2D6A4F]/40 active:scale-95"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current text-[#25D366]" />
            <span className="hidden xs:inline">WhatsApp</span>
          </a>

          {adminAuthenticated && (
            <button
              onClick={() => setActiveTab('admin')}
              className="p-1.5 rounded-full bg-[#C5A880]/20 text-[#181512] hover:bg-[#C5A880]/40 transition-colors"
              title="Accéder à l'Atelier / Admin"
            >
              <Unlock className="w-3.5 h-3.5 text-[#1B4332]" />
            </button>
          )}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN HERO BODY: RESPONSIVE FOREGROUND EDITORIAL LAYOUT                 */}
      {/* - Desktop (md+): 2-Column Split with Monumental Photo on Right            */}
      {/* - Mobile (< md): Clean Flow with Photo in Foreground & No Text on Face    */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 md:px-12 lg:px-16 py-4 sm:py-6 lg:py-6 my-auto flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 lg:gap-14 flex-grow">
        
        {/* LEFT COLUMN: Haute Couture Typography & Single Luxury CTA */}
        <div className="w-full md:w-[50%] lg:w-[48%] flex flex-col justify-center space-y-4 sm:space-y-5 text-center md:text-left">
          
          {/* Eyebrow / Creator Tag */}
          <div 
            className="flex items-center justify-center md:justify-start gap-2 text-[10px] sm:text-[11px] md:text-[12px] font-bold tracking-[0.28em] text-[#1B4332] uppercase select-none"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <span className="w-5 sm:w-7 h-[1.5px] bg-[#2D6A4F]"></span>
            <span>PAR VANESSA KANIKI</span>
          </div>

          {/* Main Monumental Haute Couture Typography */}
          <h1 
            className="font-light text-[13vw] sm:text-[10vw] md:text-[6.5vw] lg:text-[5.5vw] xl:text-[6vw] leading-[0.88] tracking-[-0.035em] text-[#181512] uppercase select-none"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            <span className="block hero-title-line">VAN'S</span>
            <span className="block relative hero-title-line" style={{ animationDelay: '0.12s' }}>
              CREATION
            </span>
          </h1>

          {/* ===================================================================== */}
          {/* MOBILE FOREGROUND PORTRAIT (Visible ONLY on Mobile < md)              */}
          {/* The photo is in the foreground, face 100% visible, no text on face    */}
          {/* ===================================================================== */}
          <div className="block md:hidden my-2 w-full">
            <div className="relative w-full max-w-[290px] xs:max-w-[310px] sm:max-w-[340px] aspect-[3/4] mx-auto rounded-3xl overflow-hidden border border-[#E8E1D7] shadow-xl bg-[#181512]">
              <img
                src="/images/vanessa-hero.jpg"
                alt="Vanessa Kaniki en robe émeraude Haute Couture"
                className="w-full h-full object-cover object-[center_10%] filter brightness-[1.02] contrast-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />
              
              <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181512]/80 backdrop-blur-md text-[#C5A880] text-[9px] font-bold tracking-widest uppercase border border-[#C5A880]/30 shadow-xs">
                <Sparkles className="w-3 h-3 text-[#C5A880]" />
                <span>Collection 2026</span>
              </div>

              <div className="absolute bottom-3 inset-x-3 text-center">
                <span 
                  className="text-[10.5px] text-white/95 font-bold tracking-[0.16em] uppercase drop-shadow-sm"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  Robe Émeraude • Sur-Mesure d'Art
                </span>
              </div>
            </div>
          </div>

          {/* Subtitle & Value Proposition */}
          <div 
            className="text-[11px] sm:text-[12.5px] font-semibold tracking-[0.20em] text-[#555048] uppercase leading-relaxed max-w-md mx-auto md:mx-0"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <div>L'ALLIANCE DU STYLE ET DU SUR-MESURE</div>
            <div className="font-bold text-[#1B4332] mt-0.5">
              HAUTE COUTURE • KINSHASA
            </div>
          </div>

          {/* STUNNING ROYAL CTA BUTTON (The ONLY CTA on Homepage) */}
          <div className="pt-2 sm:pt-3">
            <button
              id="hero-exclusive-catalogue-btn"
              onClick={handleGoToCreations}
              className="group relative w-full sm:w-auto max-w-[310px] sm:max-w-none mx-auto md:mx-0 inline-flex items-center justify-center gap-4 px-8 sm:px-10 py-4 sm:py-[18px] rounded-full bg-[#181512] hover:bg-[#1B4332] text-[#FAF8F5] text-[12px] sm:text-[13px] font-bold tracking-[0.20em] uppercase transition-all duration-400 transform hover:-translate-y-0.5 shadow-xl hover:shadow-2xl cursor-pointer border border-[#3A322A] hover:border-[#2D6A4F]/60 active:scale-[0.98]"
              title="Découvrir le catalogue de la Maison Van's Creation"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <span>DÉCOUVRIR LE CATALOGUE</span>
              <div className="w-6 h-6 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                <ArrowRight className="w-3.5 h-3.5 text-[#C5A880] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: Desktop & Tablet Monumental Portrait (Clean & Perfectly Positioned) */}
        <div className="hidden md:flex w-full md:w-[50%] lg:w-[52%] items-center justify-center">
          <div className="relative w-full max-w-[400px] lg:max-w-[460px] xl:max-w-[500px] aspect-[3/4] rounded-3xl overflow-hidden border border-[#E8E1D7] shadow-2xl bg-[#181512] group">
            <img
              src="/images/vanessa-hero.jpg"
              alt="Vanessa Kaniki — Van's Creation Haute Couture"
              className={`w-full h-full object-cover object-[center_10%] filter brightness-[1.03] contrast-[1.06] saturate-[1.06] group-hover:scale-103 transition-transform duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
            />
            {/* Subtle Vignette & Tag */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />
            
            <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#181512]/80 backdrop-blur-md text-[#C5A880] text-[9.5px] font-bold tracking-widest uppercase border border-[#C5A880]/30 shadow-sm">
              <Sparkles className="w-3 h-3 text-[#C5A880]" />
              <span>Collection Signature 2026</span>
            </div>

            <div className="absolute bottom-4 inset-x-4 text-center">
              <span 
                className="text-[11px] text-white/95 font-bold tracking-[0.18em] uppercase drop-shadow-sm"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Robe Émeraude • Sur-Mesure d'Art
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. BOTTOM BAR: L'ATELIER, CRÉATION EN VEDETTE, ROTATING SCROLL BADGE       */}
      {/* ========================================================================= */}
      <footer 
        id="hero-footer-bar"
        className="relative z-20 w-full max-w-7xl mx-auto px-5 sm:px-8 md:px-12 lg:px-16 pb-5 sm:pb-7 md:pb-9 pt-3 md:pt-0 flex flex-col md:flex-row items-center md:items-end justify-between gap-5 md:gap-8 border-t border-[#EAE3DA]/50 md:border-t-0"
      >
        {/* Left Combined: L'ATELIER + CRÉATION EN VEDETTE */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-8 lg:gap-12 w-full md:w-auto text-center sm:text-left">
          
          {/* L'ATELIER / À PROPOS BLOCK */}
          <div 
            id="hero-about-us-block"
            className="max-w-[280px] sm:max-w-[320px] space-y-1 select-none hidden xs:block"
          >
            <div 
              className="text-[9px] sm:text-[10px] font-bold tracking-[0.24em] uppercase text-[#8C7A6B]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              L'ATELIER VAN'S
            </div>
            
            <h2 
              className="text-xs sm:text-[13.5px] font-bold text-[#181512] leading-[1.3] uppercase"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              DES CRÉATIONS SUR-MESURE <span className="font-normal text-[#555048]">QUI SUBLIMENT VOTRE ÉLÉGANCE.</span>
            </h2>
          </div>

          {/* CRÉATION DU MOMENT / EN VEDETTE */}
          {featuredCreation && (
            <div 
              id="hero-featured-card"
              onClick={() => setSelectedCreationForDetail(featuredCreation)}
              className="flex items-center gap-3 group cursor-pointer select-none"
              title="Voir la création du moment"
            >
              <div 
                className="[writing-mode:vertical-rl] rotate-180 text-[8px] sm:text-[8.5px] font-bold tracking-[0.24em] uppercase text-[#8C7A6B] shrink-0 hidden sm:block"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                EN VEDETTE
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-14 h-16 sm:w-16 sm:h-20 overflow-hidden bg-[#181512] relative border border-[#D9D3C7] group-hover:border-[#1B4332] transition-colors shadow-xs rounded-sm shrink-0">
                  <img
                    src={featuredCreation.images[0] || "/images/vanessa-hero.jpg"}
                    alt={featuredCreation.title}
                    className="w-full h-full object-cover object-[center_10%] group-hover:scale-105 transition-transform duration-500 filter contrast-[1.04]"
                  />
                </div>
                
                <div className="space-y-0.5 text-left">
                  <h4 
                    className="text-xs font-semibold text-[#181512] tracking-wider uppercase truncate max-w-[120px]"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    {featuredCreation.title || "ROBE ÉMERAUDE"}
                  </h4>
                  <p 
                    className="text-[8.5px] font-semibold tracking-[0.18em] text-[#8C7A6B] uppercase truncate max-w-[120px]"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {featuredCreation.categories?.[0] || 'COLLECTION GALA'}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Minimalist Rotating Circular Badge (Scroll to Explore) */}
        <div 
          id="hero-scroll-badge-wrap"
          className="shrink-0"
        >
          <button
            id="hero-scroll-explore-badge"
            onClick={handleGoToCreations}
            className="group relative w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-[#181512]/30 hover:border-[#1B4332] flex items-center justify-center transition-all hover:bg-[#1B4332] cursor-pointer"
            aria-label="Explorer le catalogue"
            title="Explorer le catalogue"
          >
            <svg className="absolute inset-0 w-full h-full animate-spin-slow" viewBox="0 0 100 100">
              <path
                id="circlePath"
                d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                fill="none"
              />
              <text className="text-[7.5px] font-bold tracking-[0.24em] uppercase fill-[#6B655C] group-hover:fill-white transition-colors">
                <textPath href="#circlePath">
                  • SCROLL TO EXPLORE • VAN'S COUTURE
                </textPath>
              </text>
            </svg>
            <ArrowDownRight className="w-3.5 h-3.5 text-[#181512] group-hover:text-white group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-all" />
          </button>
        </div>

      </footer>
    </section>
  );
};
