import React, { useState, useRef } from 'react';
import { useStudio } from '../context/StudioContext';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Check, 
  Trash2, 
  Plus, 
  Heart, 
  Shirt, 
  Calendar, 
  Scissors, 
  Palette, 
  Eye, 
  HelpCircle,
  Clock,
  Coins,
  Film,
  Play
} from 'lucide-react';

interface QuickAddModalProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PRESET_FABRICS = [
  'Mikado de Soie',
  'Dentelle de Calais',
  'Satin Duchesse',
  'Soie Sauvage',
  'Tulle Brodée',
  'Velours de Soie',
  'Crêpe Georgette',
  'Organza de Soie',
  'Taffetas Royal'
];

const PRESET_COLORS = [
  'Noir Impérial',
  'Doré / Or Pur',
  'Bleu Nuit Saphir',
  'Blanc Ivoire',
  'Émeraude Profond',
  'Bordeaux Royal',
  'Rose Poudré',
  'Champagne Perlé',
  'Argent Scintillant'
];

const PRESET_SILHOUETTES = [
  'Coupe Sirène & Traîne Majestueuse',
  'Robe Princesse Sculpturale',
  'Fourreau Élégant Fendu',
  'Ligne A Impériale',
  'Drapé Asymétrique Couture',
  'Bustier Coeur & Jupe Évasée'
];

export const VanessaQuickAddModal: React.FC<QuickAddModalProps> = ({ onSuccess, onCancel }) => {
  const { occasions, addCreation } = useStudio();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simple state for Vanessa
  const [title, setTitle] = useState('');
  const [occasionName, setOccasionName] = useState(occasions[0]?.name || 'Mariages & Cérémonies');
  const [description, setDescription] = useState('');
  const [selectedSilhouette, setSelectedSilhouette] = useState(PRESET_SILHOUETTES[0]);
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>(['Mikado de Soie']);
  const [selectedColors, setSelectedColors] = useState<string[]>(['Noir Impérial']);
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [priceEstimate, setPriceEstimate] = useState('Sur devis');
  const [preparationTime, setPreparationTime] = useState('3 à 4 semaines');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Photo Angle Labels (1 to 4)
  const angleLabels = [
    'Vue 1 (Face / Principale)',
    'Vue 2 (Profil)',
    'Vue 3 (Dos / Traîne)',
    'Vue 4 (Détail de Couture)'
  ];

  // Handle local image file upload (from phone camera or gallery)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, slotIndex?: number) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Process uploaded files
    const fileList: File[] = Array.from(files);
    fileList.forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const base64Url = reader.result;
          setImages(prev => {
            const next = [...prev];
            if (slotIndex !== undefined && slotIndex < next.length) {
              next[slotIndex] = base64Url;
            } else if (slotIndex !== undefined && slotIndex >= next.length) {
              next[slotIndex] = base64Url;
            } else {
              if (next.length < 4) {
                next.push(base64Url);
              }
            }
            return next.filter(Boolean);
          });
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleFabric = (fabric: string) => {
    if (selectedFabrics.includes(fabric)) {
      if (selectedFabrics.length > 1) {
        setSelectedFabrics(selectedFabrics.filter(f => f !== fabric));
      }
    } else {
      setSelectedFabrics([...selectedFabrics, fabric]);
    }
  };

  const toggleColor = (color: string) => {
    if (selectedColors.includes(color)) {
      if (selectedColors.length > 1) {
        setSelectedColors(selectedColors.filter(c => c !== color));
      }
    } else {
      setSelectedColors([...selectedColors, color]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Veuillez donner un nom à la création (ex: Robe Divine AURA)');
      return;
    }

    const fallbackImg = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85';
    const finalImages = images.length > 0 ? images : [fallbackImg];

    setIsSubmitting(true);

    const targetOccasion = occasions.find(o => o.name === occasionName) || occasions[0];

    const newCreation = {
      title: title.trim(),
      subtitle: `Confection artisanale sur-mesure • ${occasionName}`,
      description: description.trim() || `Création haute couture sur-mesure sculptée dans un sublime ${selectedFabrics.join(' et ')}. Finitions main d'Atelier.`,
      longDescription: description.trim() || `Modèle exclusif façonné par Vanessa Kaniki. Patronage individuel d'après vos mensurations exactes avec essayage dédié à l'Atelier.`,
      categories: ['Haute Couture', 'Sur-Mesure'],
      occasionId: targetOccasion?.id || 'occ-custom',
      occasionName: targetOccasion?.name || occasionName,
      colors: selectedColors,
      fabrics: selectedFabrics,
      silhouette: selectedSilhouette,
      coutureLine: `Ligne ${occasionName}`,
      fittingDetails: '2 séances d’essayage privées à l’Atelier de Kinshasa ou visioconférence guidée pour la Diaspora',
      images: finalImages,
      videoUrl: videoUrl.trim() || undefined,
      priceEstimate: priceEstimate.trim() || 'Sur devis',
      preparationTime: preparationTime.trim() || '3 à 4 semaines',
      isAvailable: true,
      availabilityBadge: 'Sur commande' as const,
      customOptions: [
        'Ajustement de la longueur et de la traîne',
        'Choix du décolleté et des manches',
        'Doublure pure soie sur-mesure'
      ],
      isFeatured: isFeatured,
      misEnAvant: isFeatured
    };

    addCreation(newCreation);
    setIsSubmitting(false);

    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E8E1D7] shadow-xl p-6 sm:p-8 space-y-6 animate-in fade-in">
      
      {/* Header for Vanessa */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F2ECE4] pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFEAE2] text-[#8C7A6B] text-[11px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Mode Simple Spécial Vanessa Kaniki</span>
          </div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-[#181512]">
            Ajouter une Nouvelle Tenue en 3 Étapes
          </h2>
          <p className="text-xs text-[#6B5F54]">
            Prenez vos photos avec votre téléphone, choisissez le tissu et publiez directement sur votre site.
          </p>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="self-start sm:self-center px-4 py-2 rounded-xl text-xs font-bold uppercase text-[#8C7A6B] hover:text-[#181512] hover:bg-[#FAF8F5]"
          >
            Fermer
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* ÉTAPE 1 : PHOTOS (JUSQU'À 4 PRISES DE VUES) */}
        <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E0D7CC] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#181512] text-[#C5A880] text-xs font-bold flex items-center justify-center">1</span>
              <h3 className="font-cinzel text-sm font-bold text-[#181512] uppercase tracking-wider">
                Photos de la Création (Idéalement 4 vues)
              </h3>
            </div>
            <span className="text-[11px] text-[#8C7A6B]">
              {images.length}/4 photo{images.length > 1 ? 's' : ''} ajoutée{images.length > 1 ? 's' : ''}
            </span>
          </div>

          <p className="text-xs text-[#5C5248]">
            Ajoutez les photos de votre modèle (Face, Profil, Dos/Traîne, Gros plan sur la couture).
          </p>

          {/* 4 slots grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((slotIdx) => {
              const currentImg = images[slotIdx];
              return (
                <div key={slotIdx} className="space-y-1.5 text-center">
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-dashed border-[#D8CFC4] bg-white group hover:border-[#C5A880] transition-all flex flex-col items-center justify-center p-2">
                    {currentImg ? (
                      <>
                        <img 
                          src={currentImg} 
                          alt={`Angle ${slotIdx + 1}`} 
                          className="w-full h-full object-cover rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(slotIdx)}
                          className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-rose-600 text-white rounded-full transition-colors shadow-md"
                          title="Supprimer cette photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-center p-2">
                        <div className="w-10 h-10 rounded-full bg-[#FAF8F5] text-[#C5A880] flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                          <Camera className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold text-[#181512] block">
                          + Ajouter
                        </span>
                        <span className="text-[9px] text-[#8C7A6B] block">
                          {angleLabels[slotIdx].split(' ')[1] || `Vue ${slotIdx + 1}`}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, slotIdx)}
                        />
                      </label>
                    )}
                  </div>
                  <span className="text-[10px] text-[#7A695A] font-medium block truncate">
                    {angleLabels[slotIdx]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Quick upload all button */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-[#181512] hover:bg-[#2C2723] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm">
              <Upload className="w-4 h-4 text-[#C5A880]" />
              <span>Choisir plusieurs photos depuis votre galerie / téléphone</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFileChange(e)}
              />
            </label>
          </div>

          {/* Optional Video Upload Section */}
          <div className="pt-4 border-t border-[#EAE3DA] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-[#6E2333]" />
                <span className="text-xs font-bold text-[#181512] uppercase tracking-wider">
                  Vidéo ou Défilé de la Pièce (Optionnel)
                </span>
              </div>
              <span className="text-[10px] text-[#8C7A6B] bg-[#EFEAE2] px-2 py-0.5 rounded-full font-semibold">
                WhatsApp Status / Reels ready
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#D8CFC4] hover:border-[#6E2333] text-[#181512] rounded-xl text-xs font-semibold transition-all shadow-xs">
                  <Play className="w-3.5 h-3.5 text-[#6E2333] fill-current" />
                  <span>Importer un extrait vidéo (.mp4, .mov)</span>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (typeof reader.result === 'string') {
                            setVideoUrl(reader.result);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>

              <div>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Ou collez un lien vidéo direct (https://...)"
                  className="w-full bg-white border border-[#D8CFC4] rounded-xl px-3 py-2 text-xs text-[#181512] placeholder-[#A09385]"
                />
              </div>
            </div>

            {videoUrl && (
              <div className="p-3 bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-xs text-[#181512] truncate font-medium">Vidéo associée prête pour la publication</span>
                </div>
                <button
                  type="button"
                  onClick={() => setVideoUrl('')}
                  className="text-xs text-rose-600 font-bold hover:underline shrink-0"
                >
                  Supprimer
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ÉTAPE 2 : INFORMATIONS ESSENTIELLES */}
        <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E0D7CC] space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#181512] text-[#C5A880] text-xs font-bold flex items-center justify-center">2</span>
            <h3 className="font-cinzel text-sm font-bold text-[#181512] uppercase tracking-wider">
              Nom de la Tenue & Occasion
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                Nom de la Création *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Robe Impériale AURA, Ensemble Saphir..."
                className="w-full bg-white border border-[#D8CFC4] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#181512] focus:border-[#C5A880] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                Occasion / Collection *
              </label>
              <select
                value={occasionName}
                onChange={(e) => setOccasionName(e.target.value)}
                className="w-full bg-white border border-[#D8CFC4] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#181512] focus:border-[#C5A880] focus:outline-none"
              >
                {occasions.map(occ => (
                  <option key={occ.id} value={occ.name}>{occ.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                Petite Description pour vos Clientes (Facultatif - ou générer en 1 clic)
              </label>
              <button
                type="button"
                onClick={() => {
                  const sampleDesc = `Sublime création sur-mesure confectionnée en ${selectedFabrics.join(' et ')}, silhouette ${selectedSilhouette.toLowerCase()} pour ${occasionName.toLowerCase()}. Finitions soignées à la main dans notre Atelier de Kinshasa.`;
                  setDescription(sampleDesc);
                }}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-[#9E7D53] hover:text-[#181512] bg-[#EFEAE2] hover:bg-[#E2D6C5] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                title="Générer automatiquement une description élégante"
              >
                <Sparkles className="w-3 h-3 text-[#C5A880]" />
                <span>Remplir automatiquement pour moi</span>
              </button>
            </div>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Robe sirène avec traîne majestueuse et décolleté plongeant brodé de perles fines... (Laissez vide pour une description automatique générée par l'Atelier)"
              className="w-full bg-white border border-[#D8CFC4] rounded-xl p-3 text-xs text-[#181512] focus:border-[#C5A880] focus:outline-none"
            />
            <p className="text-[10px] text-[#8C7A6B] mt-1 italic">
              💡 Si vous n'avez pas le temps d'écrire, laissez ce champ vide : une description haute couture sera générée automatiquement à partir des tissus et de la coupe choisis !
            </p>
          </div>
        </div>

        {/* ÉTAPE 3 : DÉTAILS COUTURE EN 1 CLIC (TISSUS, COULEURS, COUPE) */}
        <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E0D7CC] space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#181512] text-[#C5A880] text-xs font-bold flex items-center justify-center">3</span>
            <h3 className="font-cinzel text-sm font-bold text-[#181512] uppercase tracking-wider">
              Détails Couture en 1 Clic
            </h3>
          </div>

          {/* Coupe / Silhouette */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
              Silhouette & Coupe :
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_SILHOUETTES.map((sil, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedSilhouette(sil)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    selectedSilhouette === sil
                      ? 'bg-[#181512] text-white shadow-sm'
                      : 'bg-white text-[#5C5248] border border-[#D8CFC4] hover:border-[#181512]'
                  }`}
                >
                  {sil}
                </button>
              ))}
            </div>
          </div>

          {/* Tissus */}
          <div className="space-y-1.5 pt-2 border-t border-[#EAE3DA]">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
              Tissus Nobles Utilisés (Cliquez pour sélectionner) :
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_FABRICS.map((fabric, i) => {
                const isSelected = selectedFabrics.includes(fabric);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleFabric(fabric)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#C5A880] text-[#181512] shadow-sm font-bold'
                        : 'bg-white text-[#5C5248] border border-[#D8CFC4] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{fabric}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Couleurs */}
          <div className="space-y-1.5 pt-2 border-t border-[#EAE3DA]">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
              Couleurs / Nuances Réalisables :
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((col, i) => {
                const isSelected = selectedColors.includes(col);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleColor(col)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#181512] text-[#FAF8F5] shadow-sm'
                        : 'bg-white text-[#5C5248] border border-[#D8CFC4] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-[#C5A880]" />
                    <span>{col}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Délais et prix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#EAE3DA]">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                Délai de Confection
              </label>
              <input
                type="text"
                value={preparationTime}
                onChange={(e) => setPreparationTime(e.target.value)}
                placeholder="Ex: 3 à 4 semaines"
                className="w-full bg-white border border-[#D8CFC4] rounded-xl px-3 py-2 text-xs text-[#181512]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                Tarif Estimatif (ou "Sur devis")
              </label>
              <input
                type="text"
                value={priceEstimate}
                onChange={(e) => setPriceEstimate(e.target.value)}
                placeholder="Ex: Sur devis (Dès 750$)"
                className="w-full bg-white border border-[#D8CFC4] rounded-xl px-3 py-2 text-xs text-[#181512]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="quick-feat-check"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="rounded border-[#D8CFC4] text-[#C5A880] focus:ring-[#C5A880]"
            />
            <label htmlFor="quick-feat-check" className="text-xs font-bold text-[#181512] cursor-pointer">
              Mettre en avant sur la page d'accueil (Pièce Signature)
            </label>
          </div>

        </div>

        {/* BOUTON DE PUBLICATION */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:flex-1 py-4 bg-[#181512] hover:bg-[#2C2723] text-white rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#C5A880]" />
            <span>Publier la Création sur le Site</span>
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-6 py-4 bg-[#EFEAE2] hover:bg-[#E4DCCF] text-[#4A423A] rounded-2xl text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              Annuler
            </button>
          )}
        </div>

      </form>

    </div>
  );
};
