import React from 'react';
import { useStudio } from '../context/StudioContext';
import { ActiveTab } from '../types';
import { 
  MessageCircle, 
  MapPin, 
  Mail, 
  Lock, 
  ArrowUp 
} from 'lucide-react';
import { generateWhatsAppLink, buildGeneralContactMessage } from '../data/initialData';

export const Footer: React.FC = () => {
  const { settings, setActiveTab, setSelectedOccasionFilter } = useStudio();

  const handleNav = (tab: ActiveTab, occasion?: string) => {
    if (occasion) {
      setSelectedOccasionFilter(occasion);
      setActiveTab('creations');
    } else {
      setActiveTab(tab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const waUrl = generateWhatsAppLink(
    settings.whatsappNumber,
    buildGeneralContactMessage(settings.studioName)
  );

  return (
    <footer id="main-footer" className="bg-[#0F0D0B] text-[#D8CFC4] border-t border-[#2C2723]/80 pt-14 sm:pt-16 pb-10 sm:pb-12 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 space-y-10 sm:space-y-12">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-14">
          
          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <span 
                className="text-xl sm:text-2xl font-bold tracking-[0.18em] text-[#FAF8F5] block"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {settings.studioName.toUpperCase()}
              </span>
              <span 
                className="text-[9.5px] tracking-[0.24em] text-[#C5A880] uppercase font-semibold block mt-1"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Atelier Digital de Modélisme & Haute Couture
              </span>
            </div>

            <p 
              className="text-[12px] sm:text-[13px] text-[#A89D91] leading-[1.65] max-w-md"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {settings.subTagline}
            </p>

            <div className="pt-1">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 bg-[#1B4332] hover:bg-[#143528] text-white px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-[0.14em] transition-all duration-400 border border-[#2D6A4F]/40 shadow-sm hover:shadow-md"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <MessageCircle className="w-4 h-4 fill-current text-[#25D366]" />
                <span>WhatsApp : {settings.whatsappNumber}</span>
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 
              className="text-[11px] font-bold uppercase tracking-[0.20em] text-[#FAF8F5]"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              Maison Van's
            </h4>
            <ul 
              className="space-y-2.5 text-[12px] sm:text-[13px] text-[#A89D91]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <li>
                <button onClick={() => handleNav('home')} className="hover:text-[#C5A880] transition-colors duration-300 cursor-pointer">
                  Accueil
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('creations')} className="hover:text-[#C5A880] transition-colors duration-300 cursor-pointer">
                  Pièces d'Exception & Catalogue
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('about')} className="hover:text-[#C5A880] transition-colors duration-300 cursor-pointer">
                  L'Atelier & Le Savoir-Faire
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('contact')} className="hover:text-[#C5A880] transition-colors duration-300 cursor-pointer">
                  Contact & Rendez-Vous
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Atelier & Horaires */}
          <div className="lg:col-span-4 space-y-3">
            <h4 
              className="text-[11px] font-bold uppercase tracking-[0.20em] text-[#FAF8F5]"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              Atelier & Visites
            </h4>
            <div 
              className="space-y-2 text-[12px] sm:text-[13px] text-[#A89D91]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <p className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                <span>{settings.address}, {settings.city}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#C5A880] shrink-0" />
                <span>{settings.email}</span>
              </p>
              <p className="text-[11px] text-[#7A7067] pt-0.5">
                {settings.openingHours}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => handleNav('admin')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A1714] hover:bg-[#2C2723] text-[#A89D91] hover:text-[#FAF8F5] text-[11px] font-semibold border border-[#2E2822]/80 transition-all duration-300 cursor-pointer"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <Lock className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Espace Privé Couturière</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div 
          className="pt-7 border-t border-[#241F1B]/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] sm:text-[12px] text-[#7A7067]"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} {settings.studioName}. Haute Couture & Sur-Mesure.</span>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-[#A89D91] hover:text-[#FAF8F5] transition-colors duration-300 cursor-pointer group"
          >
            <span>Haut de page</span>
            <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
          </button>
        </div>

      </div>
    </footer>
  );
};
