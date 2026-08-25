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
  Play,
  Crown,
  ChevronRight,
  Sparkle
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
      alert('Veuillez donner un nom à la création (ex: Robe Impériale AURA)');
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
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-[#E5DDD2] shadow-[0_20px_50px_rgba(24,21,18,0.06)] p-6 sm:p-9 space-y-7 animate-in fade-in relative overflow-hidden">
      
      {/* Top Gold Accent */}
      <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-[#C5A880] to-transparent" />

      {/* Header for Vanessa */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0EAE1] pb-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#E5DDD2] text-[#8C7A6B] text-[10.5px] font-bold uppercase tracking-[0.2em]">
            <Crown className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Mode Express • Vanessa Kaniki</span>
          </div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-[#181512] tracking-wide">
            Publier une Nouvelle Pièce d'Atelier
          </h2>
          <p className="text-xs text-[#6B5F54] leading-relaxed">
            Prenez vos photos avec votre téléphone, sélectionnez les tissus et publiez en 3 étapes simples.
          </p>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="self-start sm:self-center px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-[#8C7A6B] hover:text-[#181512] hover:bg-[#FAF8F5] border border-transparent hover:border-[#E5DDD2] transition-all cursor-pointer"
          >
            Fermer
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-7" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        
        {/* ÉTAPE 1 : PHOTOS (JUSQU'À 4 PRISES DE VUES) */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#FAF8F5] border border-[#E5DDD2] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-[#181512] text-[#D4AF37] text-xs font-bold flex items-center justify-center shadow-xs">1</span>
              <h3 className="font-cinzel text-sm font-bold text-[#181512] uppercase tracking-wider">
                Photos de la Création (Idéalement 4 vues)
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-[#8C7A6B] bg-white px-2.5 py-1 rounded-full border border-[#E5DDD2]">
              {images.length}/4 photo{images.length > 1 ? 's' : ''}
            </span>
          </div>

          <p className="text-xs text-[#6B5F54]">
            Présentez la pièce sous ses meilleurs angles (Face, Profil, Dos / Traîne, Gros plan sur les finitions).
          </p>

          {/* 4 slots grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {[0, 1, 2, 3].map((slotIdx) => {
              const currentImg = images[slotIdx];
              return (
                <div key={slotIdx} className="space-y-2 text-center">
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-dashed border-[#D8CFC4] bg-white group hover:border-[#C5A880] transition-all duration-300 flex flex-col items-center justify-center p-2 shadow-xs">
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
                          className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-rose-600 text-white rounded-full transition-colors shadow-md cursor-pointer"
                          title="Supprimer cette photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-center p-2">
                        <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] text-[#C5A880] flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-300 border border-[#E5DDD2]">
                          <Camera className="w-5 h-5" />
                        </div>
                        <span className="text-[10.5px] font-bold text-[#181512] block">
                          + Ajouter
                        </span>
                        <span className="text-[9px] text-[#8C7A6B] block mt-0.5">
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
                  <span className="text-[10px] text-[#8C7A6B] font-medium block truncate">
                    {angleLabels[slotIdx]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Multiple File Upload helper */}
          <div className="pt-2">
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-[#181512] hover:bg-[#2C2621] text-[#FAF8F5] rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs border border-[#3D352E]">
              <Upload className="w-4 h-4 text-[#C5A880]" />
              <span>Choisir plusieurs photos depuis mon appareil</span>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e)}
              />
            </label>
          </div>
        </div>

        {/* ÉTAPE 2 : INFORMATIONS ET NOM */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#FAF8F5] border border-[#E5DDD2] space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-xl bg-[#181512] text-[#D4AF37] text-xs font-bold flex items-center justify-center shadow-xs">2</span>
            <h3 className="font-cinzel text-sm font-bold text-[#181512] uppercase tracking-wider">
              Nom, Occasion & Silhouette
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                Nom de la Création *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Robe Royale KINSHASA AURA"
                className="w-full bg-white border border-[#E5DDD2] rounded-2xl px-4 py-3 text-xs text-[#181512] focus:outline-none focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/20 transition-all font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                Occasion / Catégorie
              </label>
              <select
                value={occasionName}
                onChange={(e) => setOccasionName(e.target.value)}
                className="w-full bg-white border border-[#E5DDD2] rounded-2xl px-4 py-3 text-xs text-[#181512] focus:outline-none focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/20 transition-all font-medium"
              >
                {occasions.map(occ => (
                  <option key={occ.id} value={occ.name}>{occ.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
              Silhouette / Coupe Signature
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
              {PRESET_SILHOUETTES.map(sil => (
                <button
                  key={sil}
                  type="button"
                  onClick={() => setSelectedSilhouette(sil)}
                  className={`p-2.5 rounded-xl text-left text-xs font-semibold transition-all border cursor-pointer ${
                    selectedSilhouette === sil
                      ? 'bg-[#181512] text-white border-[#181512] shadow-xs'
                      : 'bg-white hover:bg-[#F5EFEB] text-[#5C5247] border-[#E5DDD2]'
                  }`}
                >
                  <span className="line-clamp-1">{sil}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
              Description / Histoire de la pièce (Optionnel)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez les finitions brodées à la main, le drapé fluide, l'effet recherché..."
              className="w-full bg-white border border-[#E5DDD2] rounded-2xl p-3.5 text-xs text-[#181512] focus:outline-none focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/20 transition-all"
            />
          </div>
        </div>

        {/* ÉTAPE 3 : TISSUS & COULEURS */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#FAF8F5] border border-[#E5DDD2] space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-xl bg-[#181512] text-[#D4AF37] text-xs font-bold flex items-center justify-center shadow-xs">3</span>
            <h3 className="font-cinzel text-sm font-bold text-[#181512] uppercase tracking-wider">
              Étoffes & Nuances Présentées
            </h3>
          </div>

          <div className="space-y-2">
            <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
              Tissus Nobles (Sélectionnez un ou plusieurs)
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_FABRICS.map(fabric => {
                const isSelected = selectedFabrics.includes(fabric);
                return (
                  <button
                    key={fabric}
                    type="button"
                    onClick={() => toggleFabric(fabric)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-[#181512] text-[#D4AF37] border-[#181512] shadow-xs'
                        : 'bg-white hover:bg-[#F5EFEB] text-[#5C5247] border-[#E5DDD2]'
                    }`}
                  >
                    {isSelected && '✓ '}
                    {fabric}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
              Couleurs / Nuances
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(color => {
                const isSelected = selectedColors.includes(color);
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => toggleColor(color)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-[#181512] text-[#D4AF37] border-[#181512] shadow-xs'
                        : 'bg-white hover:bg-[#F5EFEB] text-[#5C5247] border-[#E5DDD2]'
                    }`}
                  >
                    {isSelected && '✓ '}
                    {color}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Featured checkbox */}
          <div className="pt-2">
            <label className="inline-flex items-center gap-2.5 cursor-pointer select-none bg-white px-4 py-2.5 rounded-2xl border border-[#E5DDD2]">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-[#181512] border-[#D8CFC4] focus:ring-[#C5A880]"
              />
              <span className="text-xs font-semibold text-[#181512] flex items-center gap-1.5">
                <Sparkle className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Mettre cette création à la une sur l'accueil (Coup de Cœur de Vanessa)</span>
              </span>
            </label>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="w-full py-4 bg-[#181512] hover:bg-[#2C2621] text-[#FAF8F5] rounded-2xl text-xs font-bold uppercase tracking-[0.2em] shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50 border border-[#3D352E]"
          >
            <Crown className="w-4 h-4 text-[#D4AF37]" />
            <span>{isSubmitting ? 'Publication en cours...' : 'Publier Immédiatement sur la Vitrine'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};
