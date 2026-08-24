import React from 'react';
import { useStudio } from '../context/StudioContext';
import { MessageCircle } from 'lucide-react';
import { generateWhatsAppLink, buildGeneralContactMessage } from '../data/initialData';

export const FloatingWhatsApp: React.FC = () => {
  const { settings } = useStudio();

  const directWaUrl = generateWhatsAppLink(
    settings.whatsappNumber,
    buildGeneralContactMessage(settings.studioName)
  );

  return (
    <div 
      id="floating-whatsapp-widget" 
      className="fixed bottom-6 right-6 z-40 flex items-center select-none font-sans"
    >
      <a
        id="floating-whatsapp-button"
        href={directWaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 bg-[#25D366] hover:bg-[#1B4332] text-white hover:text-[#C5A880] rounded-full shadow-2xl border-2 border-transparent hover:border-[#C5A880] transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 cursor-pointer"
        title="Contacter Vanessa sur WhatsApp"
        aria-label="Contacter l'atelier sur WhatsApp"
      >
        {/* Subtle Ambient Glow */}
        <div className="absolute inset-0 rounded-full bg-[#25D366]/25 blur-md group-hover:bg-[#1B4332]/30 transition-all" />
        
        <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 fill-current relative z-10 transition-transform duration-300 group-hover:scale-110" />
      </a>
    </div>
  );
};
