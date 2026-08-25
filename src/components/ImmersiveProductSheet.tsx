import React, { useState, useEffect } from 'react';
import { useStudio } from '../context/StudioContext';
import { Creation } from '../types';
import { 
  X, 
  MessageCircle, 
  Share2, 
  Check, 
  Scissors, 
  Sparkles, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck 
} from 'lucide-react';
import { generateWhatsAppLink, buildCreationOrderMessage } from '../data/initialData';
import { ShareModal } from './ShareModal';

interface ImmersiveProductSheetProps {
  creation: Creation;
  onClose?: () => void;
}

const ANGLE_LABELS = [
  'Vue de Face • Allure & Tombé',
  'Vue de Profil • Lignes & Galbe',
  'Vue de Dos • Traîne & Finitions',
  'Gros Plan • Étoffes & Points Main'
];

export const ImmersiveProductSheet: React.FC<ImmersiveProductSheetProps> = ({
  creation,
  onClose
}) => {
  const { settings } = useStudio();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const images = creation.images && creation.images.length > 0 
    ? creation.images 
    : ['/images/vanessa-hero.jpg'];

  const currentAngle = ANGLE_LABELS[currentImageIndex] || `Vue d'Atelier ${currentImageIndex + 1}`;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      } else if (e.key === 'ArrowRight') {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      } else if (e.key === 'ArrowLeft') {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, onClose]);

  const directWaUrl = generateWhatsAppLink(
    settings.whatsappNumber,
    buildCreationOrderMessage(
      settings.studioName,
      creation.title,
      creation.priceEstimate,
      creation.silhouette
    )
  );

  return (
    <div className="flex flex-col lg:flex-row h-full max-h-[92vh] sm:max-h-[90vh] bg-[#FAF8F5] overflow-y-auto lg:overflow-hidden select-none font-sans">
      
      {/* ========================================================================= */}
      {/* LEFT: MAJESTIC PHOTOGRAPHIC GALLERY                                      */}
      {/* ========================================================================= */}
      <div className="lg:w-[55%] relative bg-[#181512] flex flex-col justify-between overflow-hidden aspect-[4/5] sm:aspect-square lg:aspect-auto shrink-0">
        
        {/* Main Photograph with Smooth Transition */}
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          <img
            src={images[currentImageIndex]}
            alt={`${creation.title} - ${currentAngle}`}
            className="w-full h-full object-cover object-top transition-opacity duration-300 filter contrast-[1.04]"
          />

          {/* Subtle vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
        </div>

        {/* Top Badges over Photo */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-[#C5A880] text-[10px] font-bold tracking-widest uppercase border border-[#C5A880]/30 shadow-sm">
            <Sparkles className="w-3 h-3 text-[#C5A880]" />
            <span>{creation.categories[0] || 'Haute Couture'}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white/90 text-[10px] font-medium tracking-wider">
              {currentAngle}
            </div>

            {/* Mobile close button on photo */}
            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Gallery Navigation Arrows (if multiple images) */}
        {images.length > 1 && (
          <div className="absolute inset-y-0 inset-x-3 flex items-center justify-between pointer-events-none z-10">
            <button
              onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
              className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm pointer-events-auto transition-colors cursor-pointer"
              aria-label="Image précédente"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
              className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm pointer-events-auto transition-colors cursor-pointer"
              aria-label="Image suivante"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Bottom Thumbnail Strip */}
        {images.length > 1 && (
          <div className="absolute bottom-4 inset-x-4 flex items-center justify-center gap-2 z-10">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`w-12 h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  currentImageIndex === idx
                    ? 'border-[#C5A880] scale-105 shadow-md'
                    : 'border-white/30 opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={img}
                  alt={`Vignette ${idx + 1}`}
                  className="w-full h-full object-cover object-top"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* RIGHT: CARTEL COUTURE & DIRECT WHATSAPP ACTION                           */}
      {/* ========================================================================= */}
      <div className="lg:w-[45%] p-5 sm:p-8 lg:p-10 flex flex-col justify-between overflow-y-auto">
        
        {/* Header with Title & Close Button */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span 
                className="text-[10px] font-bold tracking-[0.24em] text-[#8C7A6B] uppercase block"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {creation.occasionName || 'Création Sur-Mesure'}
              </span>
              <h2 
                className="text-2xl sm:text-3xl font-bold text-[#181512] leading-tight"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {creation.title}
              </h2>
              {creation.subtitle && (
                <p 
                  className="italic text-sm text-[#6B5F54]"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                >
                  {creation.subtitle}
                </p>
              )}
            </div>

            {/* Close Cross Button for Desktop */}
            {onClose && (
              <button
                onClick={onClose}
                className="hidden lg:flex p-2 rounded-full text-[#8C7A6B] hover:text-[#181512] hover:bg-[#EAE3DA] transition-colors cursor-pointer shrink-0"
                aria-label="Fermer la vue détaillée"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Evocative Description */}
          <p 
            className="text-xs sm:text-sm text-[#4A423A] leading-relaxed"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {creation.longDescription || creation.description}
          </p>

          {/* Luxury Technical Specifications (Cartel Couture) */}
          <div className="space-y-3 pt-2">
            
            {/* Fabrics */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#EAE3DA] space-y-1 shadow-xs">
              <div 
                className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B]"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <Scissors className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Étoffes & Matières Nobles</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {creation.fabrics.map((f, i) => (
                  <span 
                    key={i} 
                    className="px-2.5 py-0.5 rounded-full bg-[#FAF8F5] text-[#181512] text-xs font-medium border border-[#E0D7CC]"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Silhouette & Cut */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#EAE3DA] space-y-1 shadow-xs">
              <div 
                className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B]"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Coupe & Allure</span>
              </div>
              <p 
                className="text-xs font-semibold text-[#181512]"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {creation.silhouette}
              </p>
            </div>

            {/* Confection & Fitting Delays */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#EAE3DA] space-y-1 shadow-xs">
              <div 
                className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B]"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <Clock className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Délai de Confection & Essayages</span>
              </div>
              <p 
                className="text-xs text-[#181512] font-medium"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {creation.preparationTime || '3 à 5 semaines'} • 2 séances d'essayage en atelier à Kinshasa
              </p>
            </div>

          </div>

          {/* Custom Options Pill List */}
          {creation.customOptions && creation.customOptions.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span 
                className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B]"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Personnalisations Possibles :
              </span>
              <ul className="text-xs text-[#5C5248] space-y-1 pl-1">
                {creation.customOptions.map((opt, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
                    <span>{opt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM ACTION BAR: 1 SINGLE ROYAL CTA + NATIVE SHARE                     */}
        {/* ========================================================================= */}
        <div className="pt-6 mt-6 border-t border-[#EAE3DA] space-y-3">
          
          {/* Main WhatsApp Direct Button */}
          <a
            href={directWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-3 bg-[#1B4332] hover:bg-[#143528] text-white py-4 rounded-2xl text-xs sm:text-sm font-bold tracking-[0.14em] uppercase transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer border border-[#C5A880]/50 active:scale-[0.98]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <MessageCircle className="w-4 h-4 fill-current text-[#25D366]" />
            <span>Commander cette création sur WhatsApp</span>
          </a>

          {/* Sub-actions: Share & Atelier Guarantee */}
          <div 
            className="flex items-center justify-between text-xs text-[#7A7065] px-1"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F]" />
              <span className="text-[11px]">Patronage sur-mesure exclusif</span>
            </div>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs text-[#181512] hover:text-[#1B4332] font-semibold transition-colors cursor-pointer py-1.5 px-3 rounded-lg hover:bg-white border border-[#E8E1D7] shadow-xs active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Partager la robe</span>
            </button>
          </div>

        </div>

      </div>

      {/* Rich Viral Share Modal */}
      {isShareModalOpen && (
        <ShareModal
          item={creation}
          type="creation"
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}

    </div>
  );
};
