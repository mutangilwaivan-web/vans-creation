import React from 'react';
import { useStudio } from '../context/StudioContext';
import { 
  PhoneCall, 
  MessageCircle, 
  Mail, 
  MapPin, 
  Clock, 
  Instagram, 
  Sparkles, 
  Calendar
} from 'lucide-react';
import { generateWhatsAppLink, buildGeneralContactMessage } from '../data/initialData';

export const ContactSection: React.FC = () => {
  const { settings } = useStudio();

  const directWaUrl = generateWhatsAppLink(
    settings.whatsappNumber,
    buildGeneralContactMessage(settings.studioName, undefined, "Demande de rendez-vous & création sur-mesure")
  );

  const rdvWaUrl = generateWhatsAppLink(
    settings.whatsappNumber,
    `Bonjour ${settings.studioName} ✨\nJe souhaite prendre rendez-vous pour un essayage / consultation personnalisée à l'Atelier.`
  );

  return (
    <section id="contact-section" className="py-12 sm:py-20 bg-[#FAF8F5] min-h-[80vh]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10 sm:mb-14">
          <div 
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EFEAE2] border border-[#D8CFC4] text-[#8C7A6B] text-[10px] sm:text-xs font-bold tracking-widest uppercase shadow-xs"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Contact Direct & Rendez-Vous</span>
          </div>
          
          <h1 
            className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#181512]"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Échangez avec Vanessa Kaniki
          </h1>

          <p 
            className="italic text-xs sm:text-base text-[#6B5F54] max-w-2xl mx-auto"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            « Pour toute question, prise de rendez-vous en atelier ou commande sur-mesure, contactez-nous directement par WhatsApp ou téléphone. »
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* Left Column: Direct WhatsApp Action Card (Primary Focus) */}
          <div className="md:col-span-7 bg-white p-6 sm:p-10 rounded-3xl border border-[#E8E1D7] shadow-lg space-y-6 text-left">
            
            <div className="space-y-2">
              <div 
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold uppercase tracking-wider"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></span>
                <span>Réponse Rapide & Accompagnement VIP</span>
              </div>
              
              <h2 
                className="text-xl sm:text-2xl font-bold text-[#181512]"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Canal Privilégié WhatsApp
              </h2>
              
              <p 
                className="text-xs sm:text-sm text-[#5C5248] leading-relaxed"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Discutez en direct avec la créatrice, partagez vos photos d'inspiration, posez vos questions sur les étoffes et planifiez vos séances d'essayage en toute simplicité.
              </p>
            </div>

            {/* Main Action Buttons */}
            <div className="space-y-3 pt-2">
              <a
                id="contact-main-whatsapp-btn"
                href={directWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white py-4 px-6 rounded-2xl text-xs sm:text-sm font-bold tracking-wider uppercase shadow-md hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:scale-98 cursor-pointer"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <MessageCircle className="w-5 h-5 fill-current shrink-0" />
                <span>Ouvrir la discussion WhatsApp</span>
              </a>

              <a
                id="contact-rdv-whatsapp-btn"
                href={rdvWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2.5 bg-[#181512] hover:bg-[#1B4332] text-[#FAF8F5] py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-bold tracking-wider uppercase shadow-sm hover:shadow-md transition-all border border-[#C5A880]/40 active:scale-98 cursor-pointer"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <Calendar className="w-4 h-4 text-[#C5A880] shrink-0" />
                <span>Prendre RDV pour un essayage</span>
              </a>
            </div>

            {/* Direct Phone Call Button */}
            <div className="pt-3 border-t border-[#F2ECE4] flex items-center justify-between">
              <div 
                className="text-xs text-[#6B5F54]"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <span className="font-bold text-[#181512] block">Appel Direct :</span>
                <span>Disponible aux horaires d'ouverture</span>
              </div>
              <a
                href={`tel:${settings.whatsappNumber.replace(/[^0-9+]/g, '')}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#EFEAE2] text-[#181512] border border-[#E0D7CC] text-xs font-bold transition-colors"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Appeler {settings.whatsappNumber}</span>
              </a>
            </div>

          </div>

          {/* Right Column: Atelier Coordinates & Details */}
          <div className="md:col-span-5 space-y-5">
            
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E8E1D7] shadow-sm space-y-5 text-left">
              <h3 
                className="text-lg font-bold text-[#181512] border-b border-[#F2ECE4] pb-3"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Coordonnées de l'Atelier
              </h3>

              <div 
                className="space-y-4 text-xs sm:text-sm text-[#4A423A]"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                
                {/* WhatsApp */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#FAF8F5] text-[#25D366] shrink-0 border border-[#EAE3DA]">
                    <MessageCircle className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <span className="font-bold text-[#181512] uppercase tracking-wider text-[10px] sm:text-[11px] block">
                      WhatsApp Officiel
                    </span>
                    <a
                      href={directWaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 font-bold hover:underline"
                    >
                      {settings.whatsappNumber}
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#FAF8F5] text-[#C5A880] shrink-0 border border-[#EAE3DA]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-[#181512] uppercase tracking-wider text-[10px] sm:text-[11px] block">
                      Email Professionnel
                    </span>
                    <a href={`mailto:${settings.email}`} className="hover:underline text-[#181512]">
                      {settings.email}
                    </a>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#FAF8F5] text-[#C5A880] shrink-0 border border-[#EAE3DA]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-[#181512] uppercase tracking-wider text-[10px] sm:text-[11px] block">
                      Atelier Privé
                    </span>
                    <span className="text-[#181512] font-medium block">{settings.address}</span>
                    <span className="text-[#8C7A6B] text-[11px]">{settings.city}</span>
                  </div>
                </div>

                {/* Opening Hours */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#FAF8F5] text-[#C5A880] shrink-0 border border-[#EAE3DA]">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-[#181512] uppercase tracking-wider text-[10px] sm:text-[11px] block">
                      Horaires d'Accueil
                    </span>
                    <span className="text-[#181512] font-medium block">{settings.openingHours}</span>
                    <span className="text-[#8C7A6B] text-[11px]">Sur rendez-vous préalable</span>
                  </div>
                </div>

                {/* Instagram */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#FAF8F5] text-[#C5A880] shrink-0 border border-[#EAE3DA]">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-[#181512] uppercase tracking-wider text-[10px] sm:text-[11px] block">
                      Instagram Officiel
                    </span>
                    <span className="text-[#1B4332] font-semibold">{settings.instagram}</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Reassurance Banner */}
            <div className="p-5 rounded-3xl bg-[#181512] text-[#FAF8F5] space-y-1.5 text-left border border-[#3D352E]">
              <div 
                className="flex items-center gap-2 text-[#C5A880] text-xs font-bold uppercase tracking-wider"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Accueil & Conseil Personnalisé</span>
              </div>
              <p 
                className="text-xs text-[#D8CFC4] leading-relaxed"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Vanessa Kaniki vous reçoit personnellement pour concevoir une création adaptée à vos envies et à votre morphologie.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
