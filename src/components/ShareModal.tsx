import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  MessageCircle, 
  Copy, 
  Check, 
  Sparkles, 
  Smartphone, 
  Download, 
  Image as ImageIcon, 
  Camera, 
  ArrowRight, 
  Info,
  Film,
  Play,
  ExternalLink,
  Link2,
  Video
} from 'lucide-react';
import { Creation, Inspiration } from '../types';
import { useStudio } from '../context/StudioContext';
import { buildCreationShareMessage, buildInspirationShareMessage } from '../data/initialData';

interface ShareModalProps {
  item: Creation | Inspiration;
  type?: 'creation' | 'inspiration';
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  item,
  type = 'creation',
  isOpen,
  onClose,
}) => {
  const { settings } = useStudio();
  const [activeShareTab, setActiveShareTab] = useState<'status' | 'direct' | 'social'>('status');
  const [mediaMode, setMediaMode] = useState<'photo' | 'video'>(item.videoUrl ? 'video' : 'photo');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedStatusText, setCopiedStatusText] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const isCreation = type === 'creation';
  const creation = isCreation ? (item as Creation) : null;
  const inspiration = !isCreation ? (item as Inspiration) : null;

  // Build clean, deep-linkable share URL
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const shareParam = isCreation && creation 
    ? `?robe=${encodeURIComponent(creation.slug || creation.id)}` 
    : isCreation && creation?.id 
    ? `?robe=${encodeURIComponent(creation.id)}`
    : `?inspiration=${encodeURIComponent(inspiration?.id || '')}`;
  
  const shareUrl = `${origin}${pathname}${shareParam}`;

  // Image for previews & Pinterest
  const previewImage = isCreation && creation
    ? (creation.images && creation.images[0]) || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=85'
    : (inspiration?.imageUrl || 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1400&q=85');

  const videoUrl = item.videoUrl || null;

  // Text message builders
  const whatsappShareText = isCreation && creation
    ? buildCreationShareMessage(creation, settings.studioName, shareUrl, settings.whatsappNumber)
    : inspiration
    ? buildInspirationShareMessage(inspiration, settings.studioName, shareUrl)
    : `Découvrez cette création sur l'Atelier Digital Van's Creation : ${shareUrl}`;

  // Dedicated Short WhatsApp Status caption with direct link to product sheet
  const statusCaption = isCreation && creation
    ? `${creation.title.toUpperCase()}${videoUrl && mediaMode === 'video' ? ' (Vidéo du Défilé)' : ''}
Confection sur-mesure Maison Van's (${creation.silhouette})
Étoffes : ${creation.fabrics?.slice(0, 3).join(', ') || 'Soie & Dentelle d\'exception'}

Fiche produit interactive, photographies et détails :
${shareUrl}

Consultation et commande atelier : ${settings.whatsappNumber}`
    : `${inspiration?.title.toUpperCase()}
Inspiration et confection haute couture sur-mesure.
Découvrir la fiche officielle du modèle :
${shareUrl}

Atelier Maison Van's Kinshasa : ${settings.whatsappNumber}`;

  // Social caption for Instagram / TikTok
  const instagramCaption = isCreation && creation
    ? `${creation.title.toUpperCase()}\nConfection sur-mesure et modélisme architectural par ${settings.designerName} (${settings.studioName} - Kinshasa).\n\nSilhouette : ${creation.silhouette}\nÉtoffes : ${creation.fabrics?.join(', ') || 'Matières nobles'}\n${videoUrl ? 'Vidéo du défilé disponible sur la fiche officielle.\n' : ''}\nDécouvrez la fiche détaillée à 360° et le catalogue complet : ${shareUrl}\n\n#VansCreation #VanessaKaniki #HauteCoutureKinshasa #SurMesure #RobeDeMariéeKinshasa #ModeCongolaise #KinshasaFashion`
    : `${inspiration?.title.toUpperCase()}\nInspiration et création d'art par ${settings.studioName} (${inspiration?.category}).\n\nExplorez l'Atelier Digital : ${shareUrl}\n\n#VansCreation #KinshasaFashion #HauteCouture #SurMesure`;

  // WhatsApp Share URL (Opens WhatsApp with preloaded text containing direct link)
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(statusCaption)}`;

  // Facebook Share URL
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

  // Pinterest Pin URL
  const pinterestShareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${encodeURIComponent(previewImage)}&description=${encodeURIComponent(isCreation && creation ? `${creation.title} — Haute Couture Sur-Mesure Maison Van's Kinshasa` : 'Inspiration Maison Van\'s')}`;

  // Twitter / X Share URL
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(isCreation && creation ? `Découvrez « ${creation.title} » — Création Sur-Mesure par Maison Van's Kinshasa.` : 'Inspiration Couture — Maison Van\'s Kinshasa')}&url=${encodeURIComponent(shareUrl)}&hashtags=HauteCouture,SurMesure,Kinshasa,VansCreation`;

  // Download High-Resolution Image for WhatsApp Status / Story
  const handleDownloadImage = async () => {
    try {
      setIsDownloading(true);
      const response = await fetch(previewImage, { mode: 'cors' });
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const fileName = `Vans-Creation-${item.title.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      // Auto-copy status text with direct link for effortless posting
      await navigator.clipboard.writeText(statusCaption);
      setCopiedStatusText(true);
      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
        setCopiedStatusText(false);
      }, 4000);
    } catch (e) {
      // Fallback: open image in new tab & copy status text
      window.open(previewImage, '_blank');
      await navigator.clipboard.writeText(statusCaption);
      setCopiedStatusText(true);
      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
        setCopiedStatusText(false);
      }, 4000);
    } finally {
      setIsDownloading(false);
    }
  };

  // Download / Save Video for WhatsApp Status / Reel / Story
  const handleDownloadVideo = async () => {
    if (!videoUrl) return;
    try {
      setIsDownloading(true);
      const response = await fetch(videoUrl, { mode: 'cors' });
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const fileName = `Vans-Creation-Video-${item.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp4`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      // Auto-copy status text with direct product sheet link
      await navigator.clipboard.writeText(statusCaption);
      setCopiedStatusText(true);
      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
        setCopiedStatusText(false);
      }, 4000);
    } catch (e) {
      // Fallback: open direct video URL in new tab for direct save
      window.open(videoUrl, '_blank');
      await navigator.clipboard.writeText(statusCaption);
      setCopiedStatusText(true);
      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
        setCopiedStatusText(false);
      }, 4000);
    } finally {
      setIsDownloading(false);
    }
  };

  // Copy Link Handler
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch (e) {
      console.warn('Clipboard write error', e);
    }
  };

  // Copy Status Text Handler
  const handleCopyStatusText = async () => {
    try {
      await navigator.clipboard.writeText(statusCaption);
      setCopiedStatusText(true);
      setTimeout(() => setCopiedStatusText(false), 3000);
    } catch (e) {
      console.warn('Clipboard write error', e);
    }
  };

  // Copy Instagram/TikTok Caption Handler
  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(instagramCaption);
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 3000);
    } catch (e) {
      console.warn('Clipboard write error', e);
    }
  };

  // Helper to safely convert an image or video URL to a sharable File object
  const getMediaFile = async (url: string, isVideo: boolean): Promise<File | null> => {
    const ext = isVideo ? 'mp4' : 'jpg';
    const mimeType = isVideo ? 'video/mp4' : 'image/jpeg';
    const fileName = `Vans-Creation-${item.title.replace(/[^a-zA-Z0-9]/g, '_')}.${ext}`;

    try {
      const res = await fetch(url, { mode: 'cors' });
      const blob = await res.blob();
      return new File([blob], fileName, { type: blob.type || mimeType });
    } catch (err) {
      // Fallback for images via canvas
      if (!isVideo) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = url;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || 800;
          canvas.height = img.naturalHeight || 1200;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', 0.92));
            if (blob) {
              return new File([blob], fileName, { type: 'image/jpeg' });
            }
          }
        } catch (e2) {
          console.warn('Canvas conversion fallback failed', e2);
        }
      }
      return null;
    }
  };

  // 1-Click WhatsApp Status Share with Media + Caption with deep link
  const handleNativeShare = async () => {
    setIsDownloading(true);
    // Always pre-copy the status caption with link for instant safety
    try {
      await navigator.clipboard.writeText(statusCaption);
      setCopiedStatusText(true);
      setTimeout(() => setCopiedStatusText(false), 5000);
    } catch (err) {
      // Ignore clipboard error
    }

    const isVid = mediaMode === 'video' && !!videoUrl;
    const mediaTarget = isVid ? videoUrl! : previewImage;

    try {
      const file = await getMediaFile(mediaTarget, isVid);
      
      if (navigator.share && file && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: isCreation && creation ? `${creation.title} — ${settings.studioName}` : settings.studioName,
          text: statusCaption,
          files: [file],
        });
        setDownloadSuccess(true);
      } else if (navigator.share) {
        // Fallback: share text & URL via Web Share
        await navigator.share({
          title: isCreation && creation ? `${creation.title} — ${settings.studioName}` : settings.studioName,
          text: statusCaption,
          url: shareUrl,
        });
      } else {
        // Desktop or non-supported browser: download media & open WhatsApp Web/App
        if (isVid) {
          await handleDownloadVideo();
        } else {
          await handleDownloadImage();
        }
        window.open(whatsappShareUrl, '_blank');
      }
    } catch (e) {
      console.warn('Native share cancelled or failed', e);
      // If native share fails or user cancels, make sure text is copied and open whatsapp link
      window.open(whatsappShareUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div 
      id="social-share-modal-backdrop"
      className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="social-share-modal-container"
        className="bg-[#FAF8F5] text-[#181512] w-full max-h-[94vh] sm:max-h-[90vh] sm:max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#EAE3DA] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#181512] text-[#FAF8F5] px-5 py-4 flex items-center justify-between border-b border-[#2C2723] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#C5A880]/20 border border-[#C5A880]/40 flex items-center justify-center text-[#C5A880]">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-cinzel text-sm sm:text-base font-bold text-[#FAF8F5] tracking-wide">
                Partager en Statut & Réseaux
              </h3>
              <p className="text-[10px] sm:text-[11px] text-[#C5A880] tracking-wider uppercase">
                Maison Van's • Kinshasa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF8F5] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="bg-[#EFEAE2] p-1.5 grid grid-cols-3 gap-1 border-b border-[#DCD3C7] shrink-0">
          <button
            type="button"
            onClick={() => setActiveShareTab('status')}
            className={`py-2 px-2 text-center rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeShareTab === 'status'
                ? 'bg-white text-[#181512] shadow-xs'
                : 'text-[#6A5E52] hover:text-[#181512]'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Statut / Story</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveShareTab('direct')}
            className={`py-2 px-2 text-center rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeShareTab === 'direct'
                ? 'bg-white text-[#181512] shadow-xs'
                : 'text-[#6A5E52] hover:text-[#181512]'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
            <span>WhatsApp Chat</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveShareTab('social')}
            className={`py-2 px-2 text-center rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeShareTab === 'social'
                ? 'bg-white text-[#181512] shadow-xs'
                : 'text-[#6A5E52] hover:text-[#181512]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Insta & Réseaux</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          
          {/* TAB 1: Statut WhatsApp & Story Instagram (Photo / Vidéo + Lien fiche produit) */}
          {activeShareTab === 'status' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Media Mode Toggle (Photo vs Video) if creation has video */}
              {videoUrl && (
                <div className="flex items-center justify-between bg-[#EAE3DA]/70 p-1 rounded-2xl border border-[#D5CABE]">
                  <span className="text-[11px] font-bold text-[#6A5E52] px-3 uppercase tracking-wider flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Support à partager :</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setMediaMode('photo')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        mediaMode === 'photo'
                          ? 'bg-[#181512] text-[#FAF8F5] shadow-xs'
                          : 'text-[#5C5247] hover:text-[#181512]'
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Photo HD</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMediaMode('video')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        mediaMode === 'video'
                          ? 'bg-[#6E2333] text-white shadow-xs'
                          : 'text-[#5C5247] hover:text-[#181512]'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Vidéo Défilé</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Visual Preview of the WhatsApp Status / Story */}
              <div className="bg-[#181512] text-white p-3.5 rounded-2xl border border-[#3D352E] shadow-md relative overflow-hidden">
                <div className="text-[10px] uppercase font-bold text-[#C5A880] tracking-wider mb-2 flex items-center justify-between">
                  <span>Aperçu de votre Statut / Story</span>
                  <span className="bg-[#25D366]/20 text-[#25D366] px-2 py-0.5 rounded-full text-[9px] font-semibold flex items-center gap-1">
                    <Check className="w-2.5 h-2.5" />
                    <span>Lien vers fiche produit inclus</span>
                  </span>
                </div>
                
                <div className="flex gap-3 items-center">
                  <div className="relative w-24 h-32 rounded-xl overflow-hidden shrink-0 border border-white/20 shadow-sm bg-black">
                    {mediaMode === 'video' && videoUrl ? (
                      <video 
                        src={videoUrl}
                        controls
                        playsInline
                        muted
                        loop
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img 
                        src={previewImage} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    
                    <div className="absolute top-1 left-1 pointer-events-none">
                      {mediaMode === 'video' && videoUrl ? (
                        <span className="bg-[#6E2333]/90 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                          Vidéo
                        </span>
                      ) : (
                        <span className="bg-black/70 text-[#C5A880] text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                          Photo HD
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5 text-xs text-[#E5D5C3]">
                    <h4 className="font-cinzel text-sm sm:text-base font-bold text-[#FAF8F5] line-clamp-1">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-[#D8CFC4] line-clamp-2">
                      {isCreation && creation ? `Silhouette ${creation.silhouette} • 100% Sur-Mesure` : (inspiration?.description || '')}
                    </p>
                    <div className="bg-white/10 p-2 rounded-xl text-[10px] text-[#C5A880] font-mono flex items-center justify-between gap-1 border border-white/10">
                      <span className="truncate">{shareUrl}</span>
                      <span className="text-[#25D366] text-[9px] uppercase font-bold shrink-0">Lien Direct</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* DEDICATED PRODUCT SHEET LINK BOX (Direct Traffic Driver) */}
              <div className="p-3.5 bg-gradient-to-r from-[#FAF6F0] to-[#F2EDE4] rounded-2xl border-2 border-[#C5A880]/60 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs font-bold text-[#181512] uppercase tracking-wider flex items-center gap-1.5">
                    <Link2 className="w-4 h-4 text-[#6E2333]" />
                    <span>Lien direct de la fiche produit</span>
                  </span>
                  <span className="text-[10px] font-bold text-[#6E2333] bg-[#6E2333]/10 px-2 py-0.5 rounded-full">
                    Générateur de trafic
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="w-full bg-white border border-[#D5CABE] rounded-xl px-3 py-2 text-xs text-[#181512] font-mono select-all focus:outline-none shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#6E2333] hover:bg-[#541523] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copier Lien</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-[#6A5E52] leading-tight">
                  Collez ce lien comme <strong>sticker de lien</strong> dans votre Story Instagram ou comme <strong>légende cliquable</strong> dans votre Statut WhatsApp pour amener vos contacts directement sur cette robe.
                </p>
              </div>

              {/* Action Buttons for Status / Story */}
              <div className="space-y-2.5">
                
                {/* 1. PRINCIPAL : Partager directement sur Statut WhatsApp avec Photo et Lien Solidaire */}
                <button
                  type="button"
                  onClick={handleNativeShare}
                  disabled={isDownloading}
                  className="w-full flex items-center justify-center gap-2.5 py-4 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer group active:scale-98 border-2 border-emerald-400/40"
                >
                  <Smartphone className="w-4 h-4 fill-current shrink-0 group-hover:scale-110 transition-transform" />
                  <span>
                    {isDownloading 
                      ? 'Préparation de la photo et du lien...' 
                      : 'Ouvrir dans WhatsApp & Statut (Photo et Lien)'}
                  </span>
                </button>

                {/* 2. Téléchargement direct Photo HD ou Vidéo */}
                {mediaMode === 'video' && videoUrl ? (
                  <button
                    type="button"
                    onClick={handleDownloadVideo}
                    disabled={isDownloading}
                    className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-[#6E2333] hover:bg-[#541523] text-white font-semibold text-xs shadow-sm transition-all cursor-pointer group active:scale-98"
                  >
                    <Download className="w-3.5 h-3.5 text-[#C5A880] group-hover:translate-y-0.5 transition-transform" />
                    <span>
                      {downloadSuccess 
                        ? 'Vidéo téléchargée et texte avec lien copié' 
                        : 'Télécharger la Vidéo HD du Défilé'}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleDownloadImage}
                    disabled={isDownloading}
                    className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-[#181512] hover:bg-[#2C2723] text-[#FAF8F5] font-semibold text-xs shadow-sm transition-all border border-[#C5A880]/40 cursor-pointer group active:scale-98"
                  >
                    <Download className="w-3.5 h-3.5 text-[#C5A880] group-hover:translate-y-0.5 transition-transform" />
                    <span>
                      {downloadSuccess 
                        ? 'Photo HD téléchargée et texte avec lien copié' 
                        : 'Télécharger la Photo HD (Légende copiée)'}
                    </span>
                  </button>
                )}

                {/* 3. Copier la légende + lien */}
                <button
                  type="button"
                  onClick={handleCopyStatusText}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#181512] font-semibold text-xs border border-[#D5CABE] transition-colors cursor-pointer"
                >
                  {copiedStatusText ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Légende & Lien de la fiche copiés !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#9E7D53]" />
                      <span>Copier le texte avec le lien de la fiche produit</span>
                    </>
                  )}
                </button>
              </div>

              {/* Step-by-step Guide for WhatsApp Status */}
              <div className="bg-[#EFEAE2] p-3.5 rounded-2xl border border-[#DCD3C7] space-y-1.5 text-xs text-[#5C5247]">
                <div className="font-bold text-[#181512] text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Comment publier sur Statut & Stories en 3 clics ?</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[11px] pl-1">
                  <li>Cliquez sur <strong>« Télécharger la {mediaMode === 'video' && videoUrl ? 'Vidéo' : 'Photo'} »</strong> ci-dessus (le texte et le lien se copient automatiquement).</li>
                  <li>Ouvrez <strong>WhatsApp &gt; Mon Statut</strong> (ou Instagram Story) et choisissez le fichier téléchargé.</li>
                  <li>Collez la légende copiée : vos contacts cliqueront directement sur le lien pour découvrir la robe et vous contacter !</li>
                </ol>
              </div>

            </div>
          )}

          {/* TAB 2: WhatsApp Chat & Envoi direct aux clientes */}
          {activeShareTab === 'direct' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Card Preview */}
              <div className="bg-[#EFEAE2] p-3 rounded-2xl border border-[#DCD3C7] flex items-center gap-3.5 shadow-inner">
                <div className="w-16 h-20 rounded-xl overflow-hidden border border-[#D5CABE] shadow-sm shrink-0 relative bg-black">
                  {videoUrl ? (
                    <video 
                      src={videoUrl}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                  ) : (
                    <img 
                      src={previewImage} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  {videoUrl && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Play className="w-4 h-4 text-white fill-current" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#9E7D53] block truncate">
                      {isCreation && creation ? creation.occasionName : (inspiration?.category || 'Couture')}
                    </span>
                    {videoUrl && (
                      <span className="bg-[#6E2333] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase">
                        Vidéo
                      </span>
                    )}
                  </div>
                  <h4 className="font-cinzel text-xs sm:text-sm font-bold text-[#181512] line-clamp-1">
                    {item.title}
                  </h4>
                  {isCreation && creation && (
                    <p className="text-[11px] text-[#5C5247] line-clamp-1">
                      Silhouette {creation.silhouette} • 100% Sur-Mesure
                    </p>
                  )}
                  <div className="inline-flex items-center gap-1 text-[10px] text-[#25D366] font-semibold">
                    <Sparkles className="w-3 h-3 text-[#C5A880]" />
                    <span>Lien interactif avec fiche 360° {videoUrl ? '& vidéo' : ''}</span>
                  </div>
                </div>
              </div>

              {/* WhatsApp Button */}
              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-current shrink-0" />
                <span>Envoyer sur WhatsApp (Contacts ou Groupes)</span>
              </a>

              {/* Native Mobile Share */}
              <button
                type="button"
                onClick={handleNativeShare}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-[#181512] hover:bg-[#2C2723] text-[#FAF8F5] font-medium text-xs shadow-md transition-all border border-[#3D352E] cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-[#C5A880] shrink-0" />
                <span>Partager via une autre application (SMS, Mail, etc.)</span>
              </button>

              {/* Direct Link Copy */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                  Lien direct vers la fiche de cette création
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="w-full bg-white border border-[#D8CFC4] rounded-xl px-3 py-2 text-xs text-[#181512] font-mono select-all focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#181512] hover:bg-[#2C2723] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copié</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span>Copier</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: Instagram, TikTok, Facebook, Pinterest */}
          {activeShareTab === 'social' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Social Channels Icons */}
              <div className="grid grid-cols-3 gap-2">
                {/* Facebook */}
                <a
                  href={facebookShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-white hover:bg-[#F3EFE9] border border-[#E0D8CE] text-[#181512] transition-colors text-center group"
                  title="Partager sur Facebook"
                >
                  <div className="w-7 h-7 rounded-full bg-[#1877F2] text-white flex items-center justify-center mb-1 text-xs font-bold shadow-sm group-hover:scale-105 transition-transform">
                    f
                  </div>
                  <span className="text-[10px] font-semibold text-[#5C5247]">Facebook</span>
                </a>

                {/* Pinterest */}
                <a
                  href={pinterestShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-white hover:bg-[#F3EFE9] border border-[#E0D8CE] text-[#181512] transition-colors text-center group"
                  title="Épingler sur Pinterest"
                >
                  <div className="w-7 h-7 rounded-full bg-[#E60023] text-white flex items-center justify-center mb-1 text-xs font-bold shadow-sm group-hover:scale-105 transition-transform">
                    P
                  </div>
                  <span className="text-[10px] font-semibold text-[#5C5247]">Pinterest</span>
                </a>

                {/* Twitter / X */}
                <a
                  href={twitterShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-white hover:bg-[#F3EFE9] border border-[#E0D8CE] text-[#181512] transition-colors text-center group"
                  title="Partager sur X (Twitter)"
                >
                  <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center mb-1 text-xs font-bold shadow-sm group-hover:scale-105 transition-transform">
                    𝕏
                  </div>
                  <span className="text-[10px] font-semibold text-[#5C5247]">X (Twitter)</span>
                </a>
              </div>

              {/* Instagram & TikTok Caption Ready-to-use */}
              <div className="bg-white p-3.5 rounded-2xl border border-[#E5DDD2] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#181512] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                    Légende pour Instagram / TikTok
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCaption}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#9E7D53] hover:text-[#181512] bg-[#FAF8F5] hover:bg-[#EFEAE2] border border-[#D5CABE] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedCaption ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700">Copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copier</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-[#6A5E52] bg-[#FAF8F5] p-2.5 rounded-xl border border-[#ECE4DA] font-mono leading-relaxed line-clamp-3">
                  {instagramCaption}
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-[#F3EFE9] px-5 py-3 border-t border-[#E5DDD2] flex items-center justify-between shrink-0">
          <div className="text-[10px] text-[#8C7A6B] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#C5A880]" />
            <span>Maison Van's Atelier Digital</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white hover:bg-[#EAE3DA] text-xs font-semibold text-[#181512] border border-[#D5CABE] transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
