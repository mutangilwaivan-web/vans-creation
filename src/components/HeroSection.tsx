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
      id="hero-poster-view"
      className="relative w-full min-h-[100dvh] lg:h-[100dvh] lg:max-h-[100dvh] bg-[#FAF8F5] text-[#1A1A18] overflow-hidden flex flex-col justify-between select-none"
    >
      {/* ========================================================================= */}
      {/* DESKTOP & TABLET BACKGROUND MODEL BLEND (Screen >= md)                     */}
      {/* Seamless edge blend on large screens                                      */}
      {/* ========================================================================= */}
      <div 
        id="hero-desktop-model-container"
        className="hidden md:flex absolute bottom-0 right-0 w-[55vw] lg:w-[50vw] xl:w-[46vw] h-full z-0 pointer-events-none items-end justify-end overflow-hidden"
      >
        <div className="relative w-full h-full">
          <img
            src="/images/vanessa-hero.jpg"
            alt="Vanessa Kaniki — Van's Creation Haute Couture"
            className={`w-full h-full object-cover object-top lg:object-center filter brightness-[1.03] contrast-[1.06] saturate-[1.06] transition-opacity duration-1000 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
          />
          {/* Seamless Edge Blends for Desktop */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAF8F5] via-[#FAF8F5]/80 md:via-[#FAF8F5]/40 to-transparent w-full md:w-[45%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAF8F5] via-transparent to-[#FAF8F5]/20 h-full" />
          <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-[#FAF8F5] to-transparent" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. TOP HEADER: MONOGRAM, CITY, LIVE CLOCK & DIRECT WHATSAPP               */}
      {/* ========================================================================= */}
      <header 
        id="hero-top-header"
        className="relative z-20 w-full px-5 sm:px-8 md:px-10 lg:px-14 pt-4 sm:pt-6 md:pt-8 flex items-center justify-between"
      >
        {/* Left: Monogram V/C Brand Signature */}
        <div 
          id="hero-monogram-brand"
          onClick={() => setActiveTab('home')}
          className="cursor-pointer group flex items-center gap-2.5 sm:gap-3 select-none"
        >
          <div 
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#181512] text-[#FAF8F5] flex items-center justify-center text-sm sm:text-base border border-[#C5A880]/60 shadow-sm group-hover:bg-[#1B4332] transition-colors duration-400"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            <span className="font-light">V</span>
            <span className="text-[#C5A880] text-xs font-mono font-normal mx-0.5 transform -rotate-12">/</span>
            <span className="font-light">C</span>
          </div>
          <div className="flex flex-col">
            <span 
              className="text-xs sm:text-base font-bold tracking-[0.16em] sm:tracking-[0.18em] text-[#181512] group-hover:text-[#1B4332] transition-colors leading-tight"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              VAN'S CREATION
            </span>
            <span 
              className="text-[8px] sm:text-[9px] tracking-[0.24em] sm:tracking-[0.26em] text-[#8C7A6B] uppercase font-semibold"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Haute Couture • Kinshasa
            </span>
          </div>
        </div>

        {/* Right: Location, Live Clock & Direct WhatsApp */}
        <div 
          id="hero-top-meta"
          className="flex items-center gap-2.5 sm:gap-4 select-none"
        >
          {/* Location & Clock */}
          <div className="text-right leading-tight">
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

          {/* Quick WhatsApp Contact Pill on Header */}
          <a
            href={generateWhatsAppLink(
              settings.whatsappNumber,
              buildGeneralContactMessage(settings.studioName)
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-[#1B4332] hover:bg-[#143528] text-white px-3.5 py-1.5 rounded-full text-[10.5px] font-bold tracking-[0.14em] uppercase transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer border border-[#2D6A4F]/40"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current text-[#25D366]" />
            <span className="hidden xs:inline">WhatsApp</span>
          </a>

          {/* Admin shortcut if authenticated */}
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
      {/* TOP RIGHT COLLECTION BADGE (DESKTOP)                                     */}
      {/* ========================================================================= */}
      <div 
        id="hero-collection-tag"
        className="hidden lg:block absolute top-28 xl:top-32 right-10 lg:right-14 z-10 text-right text-[10px] sm:text-[11px] tracking-[0.24em] text-[#6B655C] uppercase leading-relaxed font-semibold select-none"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        <div>COLLECTION 2026</div>
        <div>PIÈCES SIGNATURES</div>
        <div className="text-[#1B4332] font-bold">VANESSA KANIKI</div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN HERO BODY: RESPONSIVE FOREGROUND LAYOUT (MOBILE + DESKTOP)        */}
      {/* ========================================================================= */}
      <div 
        id="hero-main-title-wrap"
        className="relative z-10 px-5 sm:px-8 md:px-10 lg:px-14 my-auto pt-3 sm:pt-4 md:pt-2 w-full max-w-5xl"
      >
        <div className="flex flex-col md:block space-y-3 sm:space-y-4">
          
          {/* Eyebrow / Creator Tag */}
          <div 
            className="flex items-center gap-2 text-[10px] sm:text-[11px] md:text-[12px] font-bold tracking-[0.28em] sm:tracking-[0.32em] text-[#1B4332] uppercase pl-1 select-none"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <span className="w-5 sm:w-7 h-[1.5px] bg-[#2D6A4F]"></span>
            <span>PAR VANESSA KANIKI</span>
          </div>

          {/* Main Monumental Haute Couture Typography */}
          <h1 
            className="font-light text-[12.5vw] sm:text-[10vw] md:text-[8.5vw] lg:text-[7.5vw] xl:text-[8.2vw] leading-[0.88] tracking-[-0.035em] text-[#181512] uppercase select-none"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            <span className="block hero-title-line">VAN'S</span>
            <span className="block relative hero-title-line" style={{ animationDelay: '0.12s' }}>
              CREATION
            </span>
          </h1>

          {/* ===================================================================== */}
          {/* MOBILE FOREGROUND MODEL SHOWCASE (Visible ONLY on Mobile < md)        */}
          {/* Brings the photo proudly into the foreground on mobile screens        */}
          {/* ===================================================================== */}
          <div className="block md:hidden my-3 w-full">
            <div className="relative w-full max-w-[310px] sm:max-w-[340px] aspect-[4/5] mx-auto rounded-[24px] overflow-hidden border border-[#C5A880]/50 shadow-[0_12px_35px_-8px_rgba(27,67,50,0.25)] bg-[#181512]">
              <img
                src="/images/vanessa-hero.jpg"
                alt="Vanessa Kaniki en robe émeraude Haute Couture"
                className="w-full h-full object-cover object-top filter brightness-[1.03] contrast-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/15 pointer-events-none" />
              
              {/* Floating Badge in Portrait */}
              <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181512]/85 backdrop-blur-md text-[#C5A880] text-[9px] font-bold tracking-widest uppercase border border-[#C5A880]/40">
                <Sparkles className="w-3 h-3 text-[#C5A880]" />
                <span>Collection 2026</span>
              </div>

              <div className="absolute bottom-3 inset-x-3 text-center">
                <span 
                  className="text-[10px] text-white/95 font-bold tracking-[0.18em] uppercase drop-shadow-sm"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  Robe Émeraude • Sur-Mesure d'Art
                </span>
              </div>
            </div>
          </div>

          {/* Subtitle in French & STRICTLY ONE SINGLE EXCLUSIVE PREMIUM CTA */}
          <div className="pt-1 sm:pt-2 pl-1 space-y-4 sm:space-y-6">
            <div 
              className="text-[10px] sm:text-[11.5px] font-semibold tracking-[0.22em] sm:tracking-[0.26em] text-[#555048] uppercase leading-snug max-w-[290px]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <div>L'ALLIANCE DU STYLE</div>
              <div>ET DU SUR-MESURE</div>
              <div className="font-bold text-[#1B4332]">
                HAUTE COUTURE
              </div>
            </div>

            {/* ONLY ONE SINGLE CTA BUTTON */}
            <div>
              <button
                id="hero-exclusive-catalogue-btn"
                onClick={handleGoToCreations}
                className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3.5 px-7 sm:px-10 py-4 sm:py-[18px] rounded-full bg-[#181512] hover:bg-[#1B4332] text-[#FAF8F5] text-xs sm:text-[13px] font-bold tracking-[0.20em] sm:tracking-[0.22em] uppercase transition-all duration-400 transform hover:-translate-y-0.5 shadow-xl hover:shadow-2xl cursor-pointer border border-[#3A322A] hover:border-[#2D6A4F]/60 active:scale-[0.98]"
                title="Découvrir le catalogue de la Maison Van's Creation"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <span>DÉCOUVRIR LE CATALOGUE</span>
                <div className="w-5 h-5 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                  <ArrowRight className="w-3 h-3 text-[#C5A880] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. BOTTOM BAR: L'ATELIER, CRÉATION EN VEDETTE, CIRCULAR SCROLL BADGE       */}
      {/* ========================================================================= */}
      <footer 
        id="hero-footer-bar"
        className="relative z-20 w-full px-5 sm:px-8 md:px-10 lg:px-14 pb-5 sm:pb-8 md:pb-10 pt-3 md:pt-0 flex flex-col md:flex-row items-start md:items-end justify-between gap-5 md:gap-8 bg-gradient-to-t from-[#FAF8F5] via-[#FAF8F5]/90 md:bg-transparent"
      >
        {/* Left Combined: L'ATELIER + CRÉATION EN VEDETTE */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-8 lg:gap-14 w-full md:w-auto">
          
          {/* L'ATELIER / À PROPOS BLOCK */}
          <div 
            id="hero-about-us-block"
            className="max-w-[280px] sm:max-w-[310px] space-y-1 sm:space-y-2 select-none hidden xs:block"
          >
            <div 
              className="text-[9px] sm:text-[10px] font-bold tracking-[0.22em] uppercase text-[#8C7A6B]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              L'ATELIER VAN'S
            </div>
            
            <h2 
              className="text-xs sm:text-sm md:text-[15px] font-bold text-[#181512] leading-[1.35] uppercase"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              DES CRÉATIONS SUR-MESURE <span className="font-normal text-[#555048]">QUI SUBLIMENT VOTRE ÉLÉGANCE.</span>
            </h2>
            
            <p 
              className="text-[11px] sm:text-[12px] text-[#6B655C] leading-relaxed line-clamp-2 md:line-clamp-3"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {settings.bio || "Van's Creation est l'atelier de haute couture et modélisme sur-mesure fondé par Vanessa Kaniki à Kinshasa."}
            </p>
          </div>

          {/* CRÉATION DU MOMENT / EN VEDETTE */}
          {featuredCreation && (
            <div 
              id="hero-featured-card"
              onClick={() => {
                setSelectedCreationForDetail(featuredCreation);
              }}
              className="flex items-center gap-3 sm:gap-3.5 group cursor-pointer select-none"
              title="Voir la création du moment"
            >
              {/* Vertical label reading upwards */}
              <div 
                className="[writing-mode:vertical-rl] rotate-180 text-[8.5px] sm:text-[9px] font-bold tracking-[0.26em] uppercase text-[#8C7A6B] shrink-0"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                CRÉATION EN VEDETTE
              </div>

              {/* Square / Vertical Thumbnail & Titles */}
              <div className="space-y-1.5">
                <div className="w-18 h-22 sm:w-24 sm:h-28 md:w-26 md:h-30 overflow-hidden bg-[#181512] relative border border-[#D9D3C7] group-hover:border-[#1B4332] transition-colors shadow-sm rounded-sm">
                  <img
                    src={featuredCreation.images[0] || "/images/vanessa-hero.jpg"}
                    alt={featuredCreation.title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 filter contrast-[1.04]"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                </div>
                
                <div className="space-y-0.5">
                  <h4 
                    className="text-xs sm:text-[13px] font-semibold text-[#181512] tracking-wider uppercase truncate max-w-[110px] sm:max-w-[130px]"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    {featuredCreation.title || "ROBE ÉMERAUDE"}
                  </h4>
                  <p 
                    className="text-[8.5px] sm:text-[9px] font-semibold tracking-[0.20em] text-[#8C7A6B] uppercase truncate max-w-[110px] sm:max-w-[130px]"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {featuredCreation.categories?.[0] || 'COLLECTION GALA'}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Minimalist Scroll cue (Bottom Right) */}
        <div 
          id="hero-scroll-badge-wrap"
          className="self-end md:self-auto shrink-0 pt-1 sm:pt-0"
        >
          <button
            id="hero-scroll-explore-badge"
            onClick={handleGoToCreations}
            className="group flex flex-col items-center gap-1.5 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Explorer les créations"
            title="Explorer le catalogue"
          >
            <div className="w-9 h-9 rounded-full border border-[#1A1A18]/25 group-hover:border-[#1B4332] flex items-center justify-center transition-all group-hover:bg-[#1B4332] group-hover:text-white">
              <ArrowDownRight className="w-3.5 h-3.5 text-[#1A1A18] group-hover:text-[#FAF8F5] group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-all" />
            </div>
            <span 
              className="text-[8px] font-semibold tracking-[0.22em] text-[#8C7A6B] uppercase"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              EXPLORER
            </span>
          </button>
        </div>

      </footer>
    </section>
  );
};
