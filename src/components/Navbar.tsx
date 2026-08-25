import React, { useState, useEffect } from 'react';
import { useStudio } from '../context/StudioContext';
import { ActiveTab } from '../types';
import { 
  MessageCircle, 
  Menu, 
  X, 
  Lock, 
  Unlock, 
  ChevronRight,
  Heart
} from 'lucide-react';
import { generateWhatsAppLink, buildGeneralContactMessage } from '../data/initialData';

export const Navbar: React.FC = () => {
  const { 
    settings, 
    activeTab, 
    setActiveTab, 
    adminAuthenticated, 
    setSelectedOccasionFilter,
    likedCreationIds
  } = useStudio();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Primary Navigation destinations
  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'creations', label: 'CRÉATIONS' },
    { id: 'about', label: "L'ATELIER" },
    { id: 'contact', label: 'CONTACT' },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    if (tab === 'creations') {
      setSelectedOccasionFilter(null);
    }
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const whatsappDirectUrl = generateWhatsAppLink(
    settings.whatsappNumber,
    buildGeneralContactMessage(settings.studioName)
  );

  // STRICT REQUIREMENT: The Navbar MUST NEVER be visible on the Home page
  if (activeTab === 'home') {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-500">
      {/* Main Sticky Haute-Couture Navbar */}
      <nav 
        id="main-navbar"
        className={`transition-all duration-500 ${
          isScrolled 
            ? 'bg-[#FAF8F5]/[0.97] backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.06)] py-2.5 sm:py-3 border-b border-[#E8E1D7]' 
            : 'bg-[#FAF8F5]/92 backdrop-blur-xl py-3.5 sm:py-4 border-b border-[#EAE3DA]/70'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between">
          
          {/* Monogram Brand Signature */}
          <button
            id="brand-logo-button"
            type="button"
            onClick={() => handleNavClick('home')}
            className="text-left group flex items-center gap-3 cursor-pointer select-none"
          >
            <div 
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#181512] text-[#FAF8F5] flex items-center justify-center text-[13px] sm:text-sm font-light border border-[#C5A880]/50 shadow-md group-hover:bg-[#1B4332] group-hover:border-[#2D6A4F]/60 transition-all duration-500 group-hover:scale-105"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              <span>V</span>
              <span className="text-[#C5A880] text-xs font-mono font-normal mx-0.5">/</span>
              <span>C</span>
            </div>
            <div className="flex flex-col">
              <span 
                className="text-[13px] sm:text-[15px] font-bold tracking-[0.18em] text-[#1E1B18] group-hover:text-[#1B4332] transition-colors duration-300"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                VAN'S CREATION
              </span>
              <span 
                className="text-[8.5px] sm:text-[9px] tracking-[0.24em] text-[#8C7A6B] uppercase font-semibold"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Haute Couture • Kinshasa
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links with 3D Pill Design */}
          <div className="hidden md:flex items-center gap-1.5 bg-[#F0EBE3]/90 p-1.5 rounded-full border border-[#DCD3C7]/90 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`relative px-5 lg:px-6 py-2 text-[11px] font-bold tracking-[0.18em] uppercase transition-all duration-400 rounded-full cursor-pointer ${
                    isActive 
                      ? 'bg-[#181512] text-[#FAF8F5] shadow-[0_4px_14px_rgba(24,21,18,0.3)] scale-[1.02]' 
                      : 'text-[#6B5F54] hover:text-[#1B4332] hover:bg-white/90'
                  }`}
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Action: Wishlist Shortcut, WhatsApp Direct & Admin Shortcut */}
          <div className="hidden sm:flex items-center gap-2.5">
            {likedCreationIds.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSelectedOccasionFilter('favorites');
                  setActiveTab('creations');
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#6E2333]/10 hover:bg-[#6E2333]/20 text-[#6E2333] border border-rose-300/80 text-[11px] font-bold tracking-wider transition-all cursor-pointer shadow-xs active:scale-95"
                title="Consulter mes coups de cœur"
              >
                <Heart className="w-3.5 h-3.5 fill-[#6E2333] text-[#6E2333]" />
                <span>Coups de Cœur ({likedCreationIds.length})</span>
              </button>
            )}

            <a
              id="navbar-whatsapp-cta"
              href={whatsappDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-shimmer inline-flex items-center gap-2 bg-[#1B4332] hover:bg-[#143528] text-white px-5 py-2.5 rounded-full text-[11px] font-bold tracking-[0.14em] uppercase transition-all duration-400 shadow-md hover:shadow-xl hover:scale-[1.03] active:scale-[0.97] cursor-pointer border border-[#2D6A4F]/50"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current text-[#25D366]" />
              <span>WhatsApp Direct</span>
            </a>

            <button
              id="nav-admin-shortcut"
              type="button"
              onClick={() => handleNavClick('admin')}
              className={`p-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                adminAuthenticated 
                  ? 'bg-[#C5A880]/20 text-[#1B4332] border border-[#C5A880]/50 shadow-sm' 
                  : 'text-[#8C7A6B] hover:text-[#1B4332] hover:bg-[#EAE3DA]'
              }`}
              title="Espace Atelier"
              aria-label="Accès Atelier"
            >
              {adminAuthenticated ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            id="mobile-menu-toggle"
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 text-[#1E1B18] hover:bg-[#EAE3DA] rounded-xl transition-colors duration-300 cursor-pointer active:scale-95 border border-[#E8E1D7]/60 shadow-xs"
            aria-label="Ouvrir le menu de navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>

        {/* Mobile Dropdown Menu with Spring Easing */}
        <div 
          id="mobile-menu-drawer" 
          className={`md:hidden overflow-hidden transition-all duration-500 ease-out ${
            mobileMenuOpen 
              ? 'max-h-[520px] opacity-100 border-t border-[#EAE3DA]' 
              : 'max-h-0 opacity-0 border-t-0'
          }`}
        >
          <div className="bg-[#FAF8F5] px-5 pt-3 pb-6 space-y-2.5 shadow-xl">
            <div className="grid grid-cols-1 gap-1.5">
              <button
                type="button"
                onClick={() => handleNavClick('home')}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-[11.5px] font-bold tracking-[0.16em] uppercase text-[#3E3830] hover:bg-[#EFEAE2] cursor-pointer transition-colors duration-300 active:bg-[#E8E1D7] active:scale-[0.99]"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <span>ACCUEIL</span>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </button>

              {likedCreationIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOccasionFilter('favorites');
                    setActiveTab('creations');
                    setMobileMenuOpen(false);
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                  }}
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-[11.5px] font-bold tracking-[0.16em] uppercase bg-rose-50 border border-rose-200 text-rose-800 cursor-pointer transition-colors duration-300 active:scale-[0.99]"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  <span className="flex items-center gap-2">
                    <Heart className="w-4 h-4 fill-rose-600 text-rose-600" />
                    <span>MES COUPS DE CŒUR ({likedCreationIds.length})</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-rose-600" />
                </button>
              )}

              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-[11.5px] font-bold tracking-[0.16em] uppercase transition-all duration-300 cursor-pointer active:scale-[0.99] ${
                      isActive 
                        ? 'bg-[#181512] text-[#FAF8F5] shadow-md' 
                        : 'text-[#3E3830] hover:bg-[#EFEAE2] active:bg-[#E8E1D7]'
                    }`}
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="w-4 h-4 opacity-40" />
                  </button>
                );
              })}
            </div>

            <div className="pt-3.5 border-t border-[#EAE3DA] space-y-2.5">
              <a
                href={whatsappDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-shimmer w-full flex items-center justify-center gap-2.5 bg-[#1B4332] hover:bg-[#143528] text-white py-4 rounded-2xl text-[11.5px] font-bold tracking-[0.16em] uppercase shadow-lg transition-all duration-300 active:scale-[0.98] border border-[#2D6A4F]/60"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <MessageCircle className="w-4 h-4 fill-current text-[#25D366]" />
                <span>Discuter sur WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => handleNavClick('admin')}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-[11px] text-[#8C7A6B] hover:text-[#1B4332] font-semibold transition-colors duration-300"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {adminAuthenticated ? <Unlock className="w-3.5 h-3.5 text-[#C5A880]" /> : <Lock className="w-3.5 h-3.5" />}
                <span>{adminAuthenticated ? 'Atelier Actif' : 'Espace Vanessa'}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
