import React, { useState, useEffect } from 'react';
import { useStudio } from '../context/StudioContext';
import { Creation } from '../types';
import { 
  X, 
  MessageCircle, 
  Share2, 
  Scissors, 
  Sparkles, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck,
  Heart,
  Star,
  Send,
  MessageSquare,
  CheckCircle2,
  FileText,
  Eye,
  Camera
} from 'lucide-react';
import { generateWhatsAppLink, buildCreationOrderMessage } from '../data/initialData';
import { ShareModal } from './ShareModal';

interface ImmersiveProductSheetProps {
  creation: Creation;
  onClose?: () => void;
}

const ANGLE_DATA = [
  { short: 'Face', title: 'Vue de Face', subtitle: 'Allure & Tombé' },
  { short: 'Profil', title: 'Vue de Profil', subtitle: 'Lignes & Galbe' },
  { short: 'Dos', title: 'Vue de Dos', subtitle: 'Traîne & Finitions' },
  { short: 'Détail', title: 'Zoom Étoffe', subtitle: 'Points & Matière' },
];

export const ImmersiveProductSheet: React.FC<ImmersiveProductSheetProps> = ({
  creation,
  onClose
}) => {
  const { 
    settings, 
    likedCreationIds, 
    toggleLikeCreation, 
    addCreationComment 
  } = useStudio();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState<'details' | 'comments'>('details');

  // Touch Swipe Gesture State
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  // New Comment Form State
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentName, setCommentName] = useState('');
  const [commentLocation, setCommentLocation] = useState('');
  const [commentRating, setCommentRating] = useState(5);
  const [commentContent, setCommentContent] = useState('');
  const [commentSubmitted, setCommentSubmitted] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  const images = creation.images && creation.images.length > 0 
    ? creation.images 
    : ['/images/vanessa-hero.jpg'];

  const currentAngleInfo = ANGLE_DATA[currentImageIndex] || {
    short: `Vue ${currentImageIndex + 1}`,
    title: `Vue d'Atelier ${currentImageIndex + 1}`,
    subtitle: 'Création Van\'s'
  };

  const isLiked = likedCreationIds.includes(creation.id);
  const commentsList = creation.comments || [];

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

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 40;
    if (distance > minSwipeDistance) {
      // Swiped Left -> Next Angle
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    } else if (distance < -minSwipeDistance) {
      // Swiped Right -> Previous Angle
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim()) {
      setCommentError('Veuillez renseigner votre nom ou prénom.');
      return;
    }
    if (!commentContent.trim()) {
      setCommentError('Veuillez rédiger votre message ou impression.');
      return;
    }

    setCommentError(null);
    await addCreationComment(creation.id, {
      authorName: commentName.trim(),
      authorLocation: commentLocation.trim() || 'Kinshasa',
      content: commentContent.trim(),
      rating: commentRating,
    });

    setCommentSubmitted(true);
    setCommentContent('');
    setTimeout(() => {
      setShowCommentForm(false);
      setCommentSubmitted(false);
    }, 2800);
  };

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
    <div className="flex flex-col lg:flex-row w-full h-full lg:max-h-[90vh] bg-[#FAF8F5] overflow-y-auto lg:overflow-hidden select-none font-sans relative">
      
      {/* ========================================================================= */}
      {/* MOBILE STICKY TOP HEADER                                                  */}
      {/* ========================================================================= */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#EAE3DA] shadow-xs">
        <div className="flex items-center gap-2 min-w-0">
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 -ml-1 rounded-full text-[#181512] hover:bg-[#EAE3DA] transition-colors cursor-pointer shrink-0"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <span 
            className="text-xs font-bold uppercase tracking-widest text-[#181512] truncate"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            {creation.title}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Like Heart Button */}
          <button
            type="button"
            onClick={() => toggleLikeCreation(creation.id)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              isLiked
                ? 'bg-rose-100 text-rose-700 border border-rose-300'
                : 'bg-white text-[#6A5E52] border border-[#E0D7CC]'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-600 text-rose-600' : 'text-[#8C7A6B]'}`} />
            <span className="font-mono text-[11px]">{creation.likesCount || 0}</span>
          </button>

          {/* Share Button */}
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="p-1.5 rounded-full bg-white text-[#181512] border border-[#E0D7CC] hover:bg-[#EAE3DA] transition-colors cursor-pointer"
            aria-label="Partager"
          >
            <Share2 className="w-4 h-4 text-[#C5A880]" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LEFT: GALLERY + EXPLICIT 4-VIEWS STRIP                                    */}
      {/* ========================================================================= */}
      <div className="lg:w-[50%] relative bg-[#181512] flex flex-col justify-between overflow-hidden shrink-0">
        
        {/* Main Photograph with Touch Swipe Support */}
        <div 
          className="relative w-full h-80 sm:h-96 lg:h-full flex items-center justify-center overflow-hidden touch-pan-y cursor-grab active:cursor-grabbing select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={images[currentImageIndex]}
            alt={`${creation.title} - ${currentAngleInfo.title}`}
            className="w-full h-full object-cover object-top transition-all duration-300 filter contrast-[1.04]"
          />

          {/* Subtle vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

          {/* Floating Top Info Badges */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10 pointer-events-none">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-[#C5A880] text-[9.5px] font-bold tracking-widest uppercase border border-[#C5A880]/40 shadow-sm pointer-events-auto">
              <Sparkles className="w-3 h-3 text-[#C5A880]" />
              <span>{creation.categories[0] || 'Haute Couture'}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[9.5px] font-bold tracking-wider uppercase border border-white/20 shadow-sm pointer-events-auto">
              <Camera className="w-3 h-3 text-[#C5A880]" />
              <span>Vue {currentImageIndex + 1}/{images.length}</span>
            </div>
          </div>

          {/* Prominent Touch Navigation Arrows */}
          {images.length > 1 && (
            <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none z-10">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
                }}
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md pointer-events-auto transition-all cursor-pointer active:scale-90 border border-white/20 shadow-lg"
                aria-label="Vue précédente"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex((prev) => (prev + 1) % images.length);
                }}
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md pointer-events-auto transition-all cursor-pointer active:scale-90 border border-white/20 shadow-lg"
                aria-label="Vue suivante"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Angle Title & Swipe Hint Badge */}
          <div className="absolute bottom-3 inset-x-3 flex flex-col items-center gap-1 z-10 pointer-events-none">
            <span className="text-xs text-white font-bold bg-black/75 px-4 py-1 rounded-full backdrop-blur-md tracking-wider border border-white/20 shadow-md">
              {currentAngleInfo.title} • {currentAngleInfo.subtitle}
            </span>
            <span className="text-[9px] text-[#C5A880] tracking-widest uppercase font-semibold">
              Glissez le doigt ou cliquez sur les vues ci-dessous
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* EXPLICIT 4-VIEWS STRIP (Always visible right under the photo)             */}
        {/* ========================================================================= */}
        <div className="p-3 bg-[#110E0C] border-t border-b border-[#2C241D] text-white">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#C5A880]">
              <Eye className="w-3.5 h-3.5" />
              <span>Explorez les 4 Vues de l'Atelier</span>
            </div>
            <span className="text-[10px] font-mono text-stone-400">
              {currentImageIndex + 1} sur {images.length}
            </span>
          </div>

          {/* 4 Clickable Angle Cards with Large Previews */}
          <div className="grid grid-cols-4 gap-2">
            {images.map((img, idx) => {
              const isSelected = currentImageIndex === idx;
              const angle = ANGLE_DATA[idx] || {
                short: `Vue ${idx + 1}`,
                title: `Vue ${idx + 1}`,
                subtitle: ''
              };

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`flex flex-col items-center p-1 sm:p-1.5 rounded-xl border transition-all cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-[#C5A880]/25 border-[#C5A880] shadow-[0_0_12px_rgba(197,168,128,0.35)] scale-[1.03]'
                      : 'bg-black/50 border-white/15 opacity-70 hover:opacity-100 hover:border-white/40'
                  }`}
                  title={angle.title}
                >
                  <div className="w-full aspect-[3/4] rounded-lg overflow-hidden mb-1 relative bg-black">
                    <img
                      src={img}
                      alt={angle.title}
                      className="w-full h-full object-cover object-top"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 border-2 border-[#C5A880] rounded-lg pointer-events-none" />
                    )}
                  </div>
                  <span className={`text-[9.5px] sm:text-[10.5px] font-bold tracking-tight truncate w-full text-center ${
                    isSelected ? 'text-[#C5A880]' : 'text-stone-300'
                  }`}>
                    {angle.short}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* RIGHT: EDITORIAL CONTENT, DESCRIPTION, REVIEWS & CTA                    */}
      {/* ========================================================================= */}
      <div className="lg:w-[50%] p-5 sm:p-7 lg:p-8 flex flex-col justify-between overflow-y-visible lg:overflow-y-auto pb-32 lg:pb-8">
        
        <div className="space-y-4">
          
          {/* Header with Title & Desktop Close */}
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

          {/* Social Engagement Banner (Likes / Comments / Share) */}
          <div className="flex items-center gap-2 p-2 bg-white rounded-2xl border border-[#EAE3DA] shadow-xs">
            {/* Heart Button */}
            <button
              type="button"
              onClick={() => toggleLikeCreation(creation.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                isLiked
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-xs'
                  : 'bg-[#FAF8F5] text-[#181512] hover:bg-[#EFEAE2] border border-[#E8E1D7]'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600 text-rose-600' : 'text-[#8C7A6B]'}`} />
              <span>{creation.likesCount || 0} J'aime</span>
            </button>

            {/* Comment Switcher */}
            <button
              type="button"
              onClick={() => {
                setActiveRightTab('comments');
                setShowCommentForm(true);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#FAF8F5] hover:bg-[#EFEAE2] text-[#181512] border border-[#E8E1D7] text-xs font-bold transition-all cursor-pointer active:scale-95"
            >
              <MessageSquare className="w-4 h-4 text-[#C5A880]" />
              <span>{commentsList.length} Avis</span>
            </button>

            {/* Share Modal Trigger */}
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#FAF8F5] hover:bg-[#EFEAE2] text-[#181512] border border-[#E8E1D7] text-xs font-bold transition-all cursor-pointer active:scale-95"
            >
              <Share2 className="w-4 h-4 text-[#C5A880]" />
              <span>Partager</span>
            </button>
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="flex items-center gap-2 p-1 bg-[#EFEAE2] rounded-xl border border-[#DCD3C7]">
            <button
              type="button"
              onClick={() => setActiveRightTab('details')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeRightTab === 'details'
                  ? 'bg-white text-[#181512] shadow-xs'
                  : 'text-[#6A5E52] hover:text-[#181512]'
              }`}
            >
              Fiche Couture & Étoffes
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab('comments')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeRightTab === 'comments'
                  ? 'bg-white text-[#181512] shadow-xs'
                  : 'text-[#6A5E52] hover:text-[#181512]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Impressions ({commentsList.length})</span>
            </button>
          </div>

          {/* TAB 1: FICHE TECHNIQUE COUTURE & DESCRIPTION */}
          {activeRightTab === 'details' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* DESCRIPTION BLOCK: Clear, High-Contrast & Perfectly Legible on Mobile */}
              <div className="p-4 sm:p-4.5 rounded-2xl bg-white border border-[#EAE3DA] shadow-xs space-y-1.5">
                <div 
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B]"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  <FileText className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Description du Modèle</span>
                </div>
                <p 
                  className="text-[13px] sm:text-sm text-[#2C241D] leading-relaxed font-normal"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {creation.longDescription || creation.description}
                </p>
              </div>

              {/* Luxury Technical Specifications (Cartel Couture) */}
              <div className="space-y-3">
                
                {/* Haute Couture Line */}
                <div className="p-3.5 rounded-2xl bg-white border border-[#EAE3DA] space-y-1 shadow-xs">
                  <div 
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B]"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Ligne & Niveau de Patronage</span>
                  </div>
                  <p 
                    className="text-xs font-bold text-[#1B4332]"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {creation.coutureLine || 'Ligne Haute Couture Sur-Mesure'}
                  </p>
                </div>

                {/* Fabrics */}
                <div className="p-3.5 rounded-2xl bg-white border border-[#EAE3DA] space-y-1 shadow-xs">
                  <div 
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B]"
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
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B]"
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

                {/* Confection & Fitting Protocol */}
                <div className="p-3.5 rounded-2xl bg-white border border-[#EAE3DA] space-y-1.5 shadow-xs">
                  <div 
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B]"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    <Clock className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Protocole de Confection & Essayages</span>
                  </div>
                  <div className="space-y-1 text-xs text-[#181512]">
                    <p className="font-semibold text-[#181512]">
                      Délai : {creation.preparationTime || '3 à 5 semaines'}
                    </p>
                    <p className="text-[11.5px] text-[#5C5248] leading-relaxed">
                      {creation.fittingDetails || '2 séances privées d’essayage à l’Atelier de Kinshasa ou visioconférence guidée pour la Diaspora.'}
                    </p>
                  </div>
                </div>

              </div>

              {/* Custom Options Pill List */}
              {creation.customOptions && creation.customOptions.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-white border border-[#EAE3DA] space-y-1.5 shadow-xs">
                  <span 
                    className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B] block"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Personnalisations Possibles :
                  </span>
                  <ul className="text-xs text-[#5C5248] space-y-1 pl-1">
                    {creation.customOptions.map((opt, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] shrink-0" />
                        <span>{opt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: IMPRESSIONS & COMMENTAIRES CLIENTES */}
          {activeRightTab === 'comments' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Top Banner with Action to Write */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#181512]">
                    Impressions & Retours Couture
                  </h4>
                  <p className="text-[11px] text-[#6B5F54]">
                    Témoignages et appréciations sur ce modèle.
                  </p>
                </div>

                {!showCommentForm && (
                  <button
                    type="button"
                    onClick={() => setShowCommentForm(true)}
                    className="px-3 py-1.5 rounded-xl bg-[#181512] hover:bg-[#1B4332] text-white text-[11px] font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    Laisser un mot
                  </button>
                )}
              </div>

              {/* Comment Submission Form */}
              {showCommentForm && (
                <form onSubmit={handleCommentSubmit} className="p-4 bg-white rounded-2xl border border-[#E8E1D7] shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#181512]">
                      Votre impression sur ce modèle
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCommentForm(false)}
                      className="text-xs text-[#8C7A6B] hover:text-[#181512]"
                    >
                      Annuler
                    </button>
                  </div>

                  {commentSubmitted && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Votre message a été transmis avec succès à l'Atelier.</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                        Votre Nom
                      </label>
                      <input
                        type="text"
                        required
                        value={commentName}
                        onChange={(e) => setCommentName(e.target.value)}
                        placeholder="ex: Marie-Claire"
                        className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3 py-2 text-xs text-[#181512] focus:outline-none focus:border-[#1B4332]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                        Ville / Pays
                      </label>
                      <input
                        type="text"
                        value={commentLocation}
                        onChange={(e) => setCommentLocation(e.target.value)}
                        placeholder="ex: Kinshasa"
                        className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3 py-2 text-xs text-[#181512] focus:outline-none focus:border-[#1B4332]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                      Note d'appréciation
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setCommentRating(star)}
                          className="p-1 text-[#C5A880] hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star className={`w-4 h-4 ${star <= commentRating ? 'fill-[#C5A880]' : 'text-stone-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                      Votre Message
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder="Partagez vos impressions sur la silhouette, les étoffes ou la confection..."
                      className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl p-3 text-xs text-[#181512] focus:outline-none focus:border-[#1B4332] resize-none"
                    />
                  </div>

                  {commentError && (
                    <p className="text-xs text-rose-600">{commentError}</p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#181512] hover:bg-[#1B4332] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-98"
                  >
                    <Send className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Publier mon impression</span>
                  </button>
                </form>
              )}

              {/* Comments List */}
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {commentsList.length > 0 ? (
                  commentsList.map((comm) => (
                    <div key={comm.id} className="p-3.5 bg-white rounded-2xl border border-[#EAE3DA] space-y-1.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-[#FAF8F5] border border-[#D5CABE] flex items-center justify-center text-[10px] font-bold text-[#8C7A6B]">
                            {comm.authorName.charAt(0)}
                          </div>
                          <span className="text-xs font-bold text-[#181512]">{comm.authorName}</span>
                          {comm.authorLocation && (
                            <span className="text-[10px] text-[#8C7A6B]">({comm.authorLocation})</span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 text-[#C5A880]">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-[10px] font-bold font-mono">{comm.rating || 5}/5</span>
                        </div>
                      </div>

                      <p className="text-xs text-[#4A423A] leading-relaxed">
                        {comm.content}
                      </p>

                      <div className="text-[9.5px] text-[#A89C8F]">
                        {comm.createdAt}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 bg-white rounded-2xl border border-[#EAE3DA] text-center space-y-1.5">
                    <p className="text-xs font-semibold text-[#181512]">Aucun commentaire pour l'instant</p>
                    <p className="text-[11px] text-[#6B5F54]">Soyez la première à partager votre impression sur cette création.</p>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* BOTTOM ACTION BAR: FIXED ON MOBILE, STATIC ON DESKTOP                    */}
        {/* ========================================================================= */}
        <div className="fixed bottom-0 inset-x-0 bg-[#FAF8F5]/95 backdrop-blur-md p-3.5 sm:p-4 border-t border-[#EAE3DA] z-30 lg:static lg:p-0 lg:border-t-0 lg:pt-6 lg:mt-6 lg:border-t lg:border-[#EAE3DA] space-y-3 shadow-lg lg:shadow-none">
          
          {/* Main WhatsApp Direct Button */}
          <a
            href={directWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-shimmer w-full flex items-center justify-center gap-3 bg-[#1B4332] hover:bg-[#143528] text-white py-3.5 sm:py-4 rounded-2xl text-xs sm:text-sm font-bold tracking-[0.16em] uppercase transition-all duration-300 shadow-md hover:shadow-2xl transform hover:-translate-y-0.5 cursor-pointer border border-[#C5A880]/60 active:scale-[0.98]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <MessageCircle className="w-4 h-4 fill-current text-[#25D366]" />
            <span>Commander cette pièce sur WhatsApp</span>
          </a>

          {/* Sub-actions for Desktop */}
          <div 
            className="hidden lg:flex items-center justify-between text-xs text-[#7A7065] px-1"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <div className="flex items-center gap-1.5 text-[#2D6A4F] font-medium">
              <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
              <span className="text-[11.5px]">Patronage architectural sur-mesure</span>
            </div>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs text-[#181512] hover:text-[#1B4332] font-bold transition-all cursor-pointer py-2 px-3.5 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#E0D7CC] shadow-xs active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Partager la création</span>
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
