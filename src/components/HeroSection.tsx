import React, { useState, useEffect } from 'react';
import { useStudio } from '../context/StudioContext';
import { ArrowDownRight, ArrowRight, MessageCircle, Unlock } from 'lucide-react';
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
      className="relative w-full min-h-[100dvh] lg:h-[100dvh] lg:max-h-[100dvh] bg-[#FAF8F5] text-[#181512] overflow-hidden flex flex-col justify-between select-none"
    >
      {/* ========================================================================= */}
      {/* 1. MONUMENTAL HIGH-FASHION MODEL PHOTOGRAPHY (RIGHT & BOTTOM FLUID BLEED) */}
      {/* Exactly like reference: No cards, no frames, no borders, fluid bleed     */}
      {/* ========================================================================= */}
      <div 
        id="hero-monumental-photo"
        className="absolute top-0 right-0 w-full sm:w-[75vw] md:w-[62vw] lg:w-[58vw] xl:w-[54vw] h-[65%] sm:h-[80%] md:h-full z-0 pointer-events-none flex items-end justify-end overflow-hidden"
      >
        <div className="relative w-full h-full">
          <img
            src="/images/vanessa-hero.jpg"
            alt="Vanessa Kaniki — Van's Creation Haute Couture"
            className={`w-full h-full object-cover object-[center_8%] md:object-[center_10%] filter brightness-[1.02] contrast-[1.05] transition-opacity duration-1000 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Seamless Edge Blending to Left & Top (Matches reference seamless canvas) */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAF8F5] via-[#FAF8F5]/85 md:via-[#FAF8F5]/40 to-transparent w-full md:w-[45%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAF8F5] via-transparent to-[#FAF8F5]/10 h-full" />
          <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-[#FAF8F5] to-transparent" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP EDITORIAL HEADER (MONOGRAM, NAV SHORTCUTS, LOCATION & TIME)        */}
      {/* Matches reference: "A/D" left, "STUDIO PROJECTS CONTACT" center, Time right*/}
      {/* ========================================================================= */}
      <header 
        id="hero-top-header"
        className="relative z-20 w-full max-w-[1600px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16 pt-5 sm:pt-7 flex items-center justify-between"
      >
        {/* Left: Monogram A/D style Brand Mark */}
        <div 
          id="hero-monogram-brand"
          onClick={() => setActiveTab('home')}
          className="cursor-pointer group flex items-center gap-3 select-none"
        >
          <div 
            className="text-2xl sm:text-3xl font-light text-[#181512] tracking-tighter leading-none group-hover:text-[#1B4332] transition-colors"
            style={{ fontFamily: "'Cinzel', 'Fraunces', serif" }}
          >
            <span>V</span>
            <span className="text-[#C5A880] mx-0.5 text-lg font-mono">/</span>
            <span>C</span>
          </div>
          <div className="hidden sm:flex flex-col pl-1">
            <span 
              className="text-[12px] font-bold tracking-[0.20em] text-[#181512] group-hover:text-[#1B4332] transition-colors uppercase leading-tight"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              VAN'S CREATION
            </span>
            <span 
              className="text-[8px] tracking-[0.26em] text-[#8C7A6B] uppercase font-semibold"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Haute Couture • Kinshasa
            </span>
          </div>
        </div>

        {/* Center: Clean Editorial Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-12">
          <button
            onClick={() => { setActiveTab('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="text-[11px] font-bold tracking-[0.22em] text-[#555048] hover:text-[#181512] uppercase transition-colors cursor-pointer"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            L'ATELIER
          </button>
          <button
            onClick={handleGoToCreations}
            className="text-[11px] font-bold tracking-[0.22em] text-[#555048] hover:text-[#181512] uppercase transition-colors cursor-pointer"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            CRÉATIONS
          </button>
          <button
            onClick={() => { setActiveTab('contact'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="text-[11px] font-bold tracking-[0.22em] text-[#555048] hover:text-[#181512] uppercase transition-colors cursor-pointer"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            CONTACT
          </button>
        </nav>

        {/* Right: Location, Live Clock & Direct WhatsApp */}
        <div 
          id="hero-top-meta"
          className="flex items-center gap-3 sm:gap-5 select-none"
        >
          <div className="text-right leading-tight">
            <div 
              className="text-[10px] sm:text-[11px] font-bold tracking-[0.24em] text-[#181512] uppercase"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              KINSHASA
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
            className="hidden xs:inline-flex items-center gap-1.5 bg-[#1B4332] hover:bg-[#143528] text-white px-3.5 py-1.5 rounded-full text-[10.5px] font-bold tracking-[0.14em] uppercase transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer border border-[#2D6A4F]/40"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current text-[#25D366]" />
            <span>WhatsApp</span>
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
      {/* FAR RIGHT COLLECTION BADGE (Matches reference "2024 COLLECTION A/D STUDIO") */}
      {/* ========================================================================= */}
      <div 
        id="hero-collection-tag"
        className="hidden lg:block absolute top-1/3 right-8 xl:right-12 z-10 text-right text-[9.5px] tracking-[0.24em] text-[#6B655C] uppercase leading-relaxed font-semibold select-none"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        <div>2026</div>
        <div>COLLECTION</div>
        <div className="text-[#181512] font-bold">VAN'S CREATION</div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MONUMENTAL TYPOGRAPHY "DIGITAL COUTURE" STYLE ("VAN'S CREATION")       */}
      {/* Exactly like reference with subline nested inside C                       */}
      {/* ========================================================================= */}
      <div 
        id="hero-main-title-wrap"
        className="relative z-10 w-full max-w-[1600px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16 my-auto pt-6 sm:pt-4 pb-2"
      >
        <div className="space-y-0">
          
          {/* Main Giant Headline Line 1: VAN'S */}
          <h1 
            className="font-light text-[15vw] sm:text-[13vw] md:text-[10vw] lg:text-[9.2vw] xl:text-[9.8vw] leading-[0.84] tracking-[-0.04em] text-[#181512] uppercase select-none transition-all"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            VAN'S
          </h1>

          {/* Main Giant Headline Line 2: CREATION + Embedded Subtitle */}
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6">
            <h1 
              className="font-light text-[15vw] sm:text-[13vw] md:text-[10vw] lg:text-[9.2vw] xl:text-[9.8vw] leading-[0.84] tracking-[-0.04em] text-[#181512] uppercase select-none transition-all"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              CREATION
            </h1>

            {/* Subline aligned with title (Matches "WHERE FASHION MEETS INNOVATION") */}
            <div 
              className="text-[9.5px] sm:text-[10.5px] md:text-[11px] font-semibold tracking-[0.24em] text-[#555048] uppercase leading-tight max-w-[220px] pb-1 sm:pb-3 pl-1 select-none"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <div>L'ALLIANCE DU STYLE</div>
              <div>ET DU SUR-MESURE</div>
              <div className="font-bold text-[#1B4332]">HAUTE COUTURE</div>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. BOTTOM EDITORIAL SECTION (ABOUT US, FEATURED PROJECT, SCROLL EXPLORE)  */}
      {/* Exactly like reference bottom bar                                         */}
      {/* ========================================================================= */}
      <footer 
        id="hero-bottom-bar"
        className="relative z-20 w-full max-w-[1600px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16 pb-6 sm:pb-8 md:pb-10 pt-4 flex flex-col md:flex-row items-start md:items-end justify-between gap-6 md:gap-10"
      >
        {/* Left: ABOUT US block + Single CTA */}
        <div className="max-w-[320px] lg:max-w-[360px] space-y-2 select-none">
          <div 
            className="text-[9px] font-bold tracking-[0.26em] uppercase text-[#8C7A6B]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            L'ATELIER VAN'S
          </div>

          <h2 
            className="text-xs sm:text-[13px] md:text-[14px] font-bold text-[#181512] leading-[1.3] uppercase"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            DES CRÉATIONS SUR-MESURE <span className="font-normal text-[#555048]">QUI SUBLIMENT VOTRE ÉLÉGANCE.</span>
          </h2>

          <p 
            className="text-[11px] sm:text-[12px] text-[#6B655C] leading-relaxed line-clamp-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {settings.bio || "Van's Creation est l'atelier de haute couture et modélisme fondé par Vanessa Kaniki. Chaque création est pensée comme une signature architecturale d'exception."}
          </p>

          <div className="pt-1.5">
            <button
              id="hero-exclusive-catalogue-btn"
              onClick={handleGoToCreations}
              className="group inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.20em] uppercase text-[#181512] hover:text-[#1B4332] border-b-2 border-[#181512] hover:border-[#1B4332] pb-0.5 transition-all cursor-pointer"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <span>DÉCOUVRIR LE CATALOGUE</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C5A880] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Middle: FEATURED PROJECT (Thumbnail + Title) */}
        {featuredCreation && (
          <div 
            id="hero-featured-card"
            onClick={() => setSelectedCreationForDetail(featuredCreation)}
            className="flex items-center gap-3 group cursor-pointer select-none"
            title="Voir la création en vedette"
          >
            <div 
              className="[writing-mode:vertical-rl] rotate-180 text-[8.5px] font-bold tracking-[0.26em] uppercase text-[#8C7A6B] shrink-0 hidden sm:block"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              CRÉATION EN VEDETTE
            </div>

            <div className="space-y-1.5">
              <div className="w-20 h-24 sm:w-24 sm:h-28 overflow-hidden bg-[#181512] relative border border-[#D9D3C7] group-hover:border-[#1B4332] transition-colors shadow-sm">
                <img
                  src={featuredCreation.images[0] || "/images/vanessa-hero.jpg"}
                  alt={featuredCreation.title}
                  className="w-full h-full object-cover object-[center_10%] group-hover:scale-105 transition-transform duration-500 filter contrast-[1.04]"
                />
              </div>

              <div className="space-y-0.5">
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

        {/* Right: Circular SCROLL TO EXPLORE Badge with Arrow (Exact reference design) */}
        <div 
          id="hero-scroll-badge-wrap"
          className="self-end md:self-auto shrink-0"
        >
          <button
            id="hero-scroll-explore-badge"
            onClick={handleGoToCreations}
            className="group relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-[#181512]/30 hover:border-[#1B4332] flex items-center justify-center transition-all hover:bg-[#1B4332] cursor-pointer"
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
            <ArrowDownRight className="w-4 h-4 text-[#181512] group-hover:text-white group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-all" />
          </button>
        </div>

      </footer>
    </section>
  );
};
