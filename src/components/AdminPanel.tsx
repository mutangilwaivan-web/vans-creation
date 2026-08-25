import React, { useState, useEffect } from 'react';
import { useStudio } from '../context/StudioContext';
import { Creation, Inspiration, Occasion, Testimonial, HeroSlide } from '../types';
import { 
  Lock, 
  Unlock, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Upload, 
  Sparkles, 
  Shirt, 
  Lightbulb, 
  Calendar, 
  Star, 
  Settings, 
  Share2, 
  Save, 
  RotateCcw, 
  Download, 
  UploadCloud, 
  Eye, 
  EyeOff, 
  MessageCircle,
  Scissors,
  Layers,
  Image as ImageIcon,
  Zap,
  Sliders,
  ShieldCheck,
  UserCheck,
  KeyRound,
  LogOut,
  Mail,
  Play,
  Crown,
  Sparkle,
  ChevronRight,
  ExternalLink,
  PhoneCall,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { generateWhatsAppLink } from '../data/initialData';
import { VanessaQuickAddModal } from './VanessaQuickAddModal';
import { AdminAuthScreen } from './AdminAuthScreen';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { hashPassword, verifyPassword, AdminAuthConfig, ADMIN_AUTH_STORAGE_KEY } from '../lib/security';

type AdminTab = 'creations' | 'inspirations' | 'occasions' | 'testimonials' | 'settings' | 'share-tool' | 'backup';

export const AdminPanel: React.FC = () => {
  const {
    creations,
    inspirations,
    occasions,
    testimonials,
    settings,
    adminAuthenticated,
    setAdminAuthenticated,
    addCreation,
    updateCreation,
    deleteCreation,
    toggleCreationAvailability,
    addInspiration,
    updateInspiration,
    deleteInspiration,
    addOccasion,
    updateOccasion,
    deleteOccasion,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
    toggleTestimonialVisibility,
    setFeaturedCreation,
    setSelectedCreationForDetail,
    updateSettings,
    resetToDefaults,
    exportDataJson,
    importDataJson,
    setActiveTab,
  } = useStudio();

  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('creations');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Creation Form State
  const [creationFormMode, setCreationFormMode] = useState<'simple' | 'advanced'>('simple');
  const [editingCreationId, setEditingCreationId] = useState<string | null>(null);
  const [creationForm, setCreationForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    longDescription: '',
    occasionName: occasions[0]?.name || 'Mariages & Cérémonies',
    categories: 'Haute Couture, Sur-Mesure',
    colors: 'Noir, Doré',
    fabrics: 'Soie Sauvage, Dentelle',
    silhouette: 'Sculpturale & Évasée',
    coutureLine: 'Ligne Gala & Tapis Rouge',
    fittingDetails: '2 séances privées d’essayage à l’Atelier de Kinshasa ou visioconférence guidée pour la Diaspora',
    images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=750&q=75'],
    videoUrl: '',
    priceEstimate: 'Sur devis (Dès 750$)',
    preparationTime: '3 à 5 semaines',
    isAvailable: true,
    availabilityBadge: 'Sur commande' as 'Sur commande' | 'Pièce unique disponible' | 'En confection',
    customOptions: 'Ajustement de la traîne, Choix des manches, Corset intérieur sur-mesure',
    isFeatured: false,
  });

  // Inspiration Form State
  const [editingInspirationId, setEditingInspirationId] = useState<string | null>(null);
  const [inspirationForm, setInspirationForm] = useState({
    title: '',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=85',
    category: 'Haute Couture',
    occasion: occasions[0]?.name || 'Galas & Soirées Mondaines',
    colors: 'Bleu, Noir',
    styleTags: 'Sculptural, Avant-Garde',
    isOriginalCreation: true,
    sourceAuthor: "Atelier Maison Van's",
    sourceNotes: 'Modèle original sur-mesure.',
  });

  // Occasion Form State
  const [editingOccasionId, setEditingOccasionId] = useState<string | null>(null);
  const [occasionForm, setOccasionForm] = useState({
    name: '',
    description: '',
    coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    displayOrder: 1,
  });

  // Testimonial Form State
  const [editingTestimonialId, setEditingTestimonialId] = useState<string | null>(null);
  const [testimonialForm, setTestimonialForm] = useState({
    clientName: '',
    eventType: 'Mariage',
    feedback: '',
    rating: 5,
    date: 'Février 2026',
    creationName: '',
    clientPhotoUrl: '',
    isVisible: true,
  });

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState(settings);

  // Security Management State
  const [currentAdminPassword, setCurrentAdminPassword] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [securityMessage, setSecurityMessage] = useState<string | null>(null);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Fast Share Tool State
  const [selectedShareItemType, setSelectedShareItemType] = useState<'creation' | 'inspiration'>('creation');
  const [selectedShareItemId, setSelectedShareItemId] = useState<string>(creations[0]?.id || '');
  const [customShareRecipient, setCustomShareRecipient] = useState('');
  const [copiedShareText, setCopiedShareText] = useState(false);

  // Backup Import State
  const [importJsonText, setImportJsonText] = useState('');

  const triggerSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleLogout = () => {
    localStorage.removeItem('maison_vans_admin_session');
    localStorage.removeItem('maison_vans_admin_auth');
    localStorage.removeItem('maison_vans_atelier_data_v1_admin_auth');
    setAdminAuthenticated(false);
    setActiveTab('home');
  };

  // Helper for image upload to base64
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("L'image sélectionnée dépasse la taille recommandée de 2 Mo.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          callback(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Creation Submit Handler
  const handleSaveCreation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!creationForm.title.trim()) return;

    const targetOccasion = occasions.find(o => o.name === creationForm.occasionName) || occasions[0];

    const creationData = {
      title: creationForm.title.trim(),
      subtitle: creationForm.subtitle.trim() || `Création ${creationForm.occasionName}`,
      description: creationForm.description.trim(),
      longDescription: creationForm.longDescription.trim() || creationForm.description.trim(),
      categories: creationForm.categories.split(',').map(c => c.trim()).filter(Boolean),
      occasionId: targetOccasion?.id || 'occ-mariage',
      occasionName: targetOccasion?.name || creationForm.occasionName,
      colors: creationForm.colors.split(',').map(c => c.trim()).filter(Boolean),
      fabrics: creationForm.fabrics.split(',').map(f => f.trim()).filter(Boolean),
      silhouette: creationForm.silhouette.trim() || 'Coupe Sirène & Traîne',
      coutureLine: creationForm.coutureLine.trim() || 'Ligne Prestige Atelier',
      fittingDetails: creationForm.fittingDetails.trim() || '2 séances privées d’essayage à l’Atelier de Kinshasa ou visioconférence guidée pour la Diaspora',
      images: creationForm.images.filter(img => img.trim() !== ''),
      videoUrl: creationForm.videoUrl.trim() || undefined,
      priceEstimate: creationForm.priceEstimate.trim() || 'Sur devis',
      preparationTime: creationForm.preparationTime.trim() || '3 à 4 semaines',
      isAvailable: creationForm.isAvailable,
      availabilityBadge: creationForm.availabilityBadge,
      customOptions: creationForm.customOptions.split(',').map(o => o.trim()).filter(Boolean),
      isFeatured: creationForm.isFeatured,
      misEnAvant: creationForm.isFeatured
    };

    if (editingCreationId) {
      updateCreation(editingCreationId, creationData);
      triggerSuccess('Création mise à jour avec succès !');
    } else {
      addCreation(creationData);
      triggerSuccess('Nouvelle création ajoutée au catalogue !');
    }

    setEditingCreationId(null);
    setCreationForm({
      title: '',
      subtitle: '',
      description: '',
      longDescription: '',
      occasionName: occasions[0]?.name || 'Mariages & Cérémonies',
      categories: 'Haute Couture, Sur-Mesure',
      colors: 'Noir, Doré',
      fabrics: 'Soie Sauvage, Dentelle',
      silhouette: 'Sculpturale & Évasée',
      coutureLine: 'Ligne Gala & Tapis Rouge',
      fittingDetails: '2 séances privées d’essayage à l’Atelier de Kinshasa ou visioconférence guidée pour la Diaspora',
      images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=750&q=75'],
      videoUrl: '',
      priceEstimate: 'Sur devis (Dès 750$)',
      preparationTime: '3 à 5 semaines',
      isAvailable: true,
      availabilityBadge: 'Sur commande',
      customOptions: 'Ajustement de la traîne, Choix des manches, Corset intérieur sur-mesure',
      isFeatured: false,
    });
  };

  const handleEditCreationClick = (c: Creation) => {
    setEditingCreationId(c.id);
    setCreationFormMode('advanced');
    setCreationForm({
      title: c.title,
      subtitle: c.subtitle || '',
      description: c.description,
      longDescription: c.longDescription || c.description,
      occasionName: c.occasionName,
      categories: c.categories.join(', '),
      colors: c.colors.join(', '),
      fabrics: c.fabrics.join(', '),
      silhouette: c.silhouette || '',
      coutureLine: c.coutureLine || 'Ligne Prestige Atelier',
      fittingDetails: c.fittingDetails || '',
      images: c.images.length > 0 ? c.images : [''],
      videoUrl: c.videoUrl || '',
      priceEstimate: c.priceEstimate || 'Sur devis',
      preparationTime: c.preparationTime || '3 à 4 semaines',
      isAvailable: c.isAvailable,
      availabilityBadge: c.availabilityBadge || 'Sur commande',
      customOptions: c.customOptions ? c.customOptions.join(', ') : '',
      isFeatured: Boolean(c.isFeatured || c.misEnAvant),
    });
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Inspiration Submit Handler
  const handleSaveInspiration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspirationForm.title.trim() || !inspirationForm.imageUrl.trim()) return;

    const data = {
      title: inspirationForm.title.trim(),
      description: inspirationForm.description.trim(),
      imageUrl: inspirationForm.imageUrl.trim(),
      category: inspirationForm.category.trim(),
      occasion: inspirationForm.occasion,
      colors: inspirationForm.colors.split(',').map(c => c.trim()).filter(Boolean),
      styleTags: inspirationForm.styleTags.split(',').map(t => t.trim()).filter(Boolean),
      isOriginalCreation: inspirationForm.isOriginalCreation,
      sourceAuthor: inspirationForm.sourceAuthor.trim() || "Atelier Maison Van's",
      sourceNotes: inspirationForm.sourceNotes.trim(),
    };

    if (editingInspirationId) {
      updateInspiration(editingInspirationId, data);
      triggerSuccess('Inspiration mise à jour !');
    } else {
      addInspiration(data);
      triggerSuccess('Nouvelle inspiration ajoutée !');
    }

    setEditingInspirationId(null);
    setInspirationForm({
      title: '',
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=85',
      category: 'Haute Couture',
      occasion: occasions[0]?.name || 'Galas & Soirées Mondaines',
      colors: 'Bleu, Noir',
      styleTags: 'Sculptural, Avant-Garde',
      isOriginalCreation: true,
      sourceAuthor: "Atelier Maison Van's",
      sourceNotes: 'Modèle original sur-mesure.',
    });
  };

  // Occasion Submit Handler
  const handleSaveOccasion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!occasionForm.name.trim()) return;

    const data = {
      name: occasionForm.name.trim(),
      description: occasionForm.description.trim(),
      coverImage: occasionForm.coverImage.trim() || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
      displayOrder: occasionForm.displayOrder || 1,
    };

    if (editingOccasionId) {
      updateOccasion(editingOccasionId, data);
      triggerSuccess('Occasion mise à jour !');
    } else {
      addOccasion(data);
      triggerSuccess('Nouvelle occasion créée !');
    }

    setEditingOccasionId(null);
    setOccasionForm({
      name: '',
      description: '',
      coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
      displayOrder: occasions.length + 1,
    });
  };

  // Testimonial Submit Handler
  const handleSaveTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testimonialForm.clientName.trim() || !testimonialForm.feedback.trim()) return;

    const data = {
      clientName: testimonialForm.clientName.trim(),
      eventType: testimonialForm.eventType.trim() || 'Mariage',
      feedback: testimonialForm.feedback.trim(),
      rating: testimonialForm.rating,
      date: testimonialForm.date || 'Février 2026',
      creationName: testimonialForm.creationName.trim(),
      clientPhotoUrl: testimonialForm.clientPhotoUrl.trim(),
      isVisible: testimonialForm.isVisible,
    };

    if (editingTestimonialId) {
      updateTestimonial(editingTestimonialId, data);
      triggerSuccess('Avis client mis à jour !');
    } else {
      addTestimonial(data);
      triggerSuccess('Nouvel avis client ajouté !');
    }

    setEditingTestimonialId(null);
    setTestimonialForm({
      clientName: '',
      eventType: 'Mariage',
      feedback: '',
      rating: 5,
      date: 'Février 2026',
      creationName: '',
      clientPhotoUrl: '',
      isVisible: true,
    });
  };

  // Settings Submit Handler
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settingsForm);
    triggerSuccess('Paramètres de l’atelier et numéro WhatsApp mis à jour !');
  };

  // Generate Quick Share Link
  const selectedCreation = creations.find(c => c.id === selectedShareItemId) || creations[0];
  const selectedInspiration = inspirations.find(i => i.id === selectedShareItemId) || inspirations[0];

  const shareText = selectedShareItemType === 'creation' && selectedCreation
    ? `Bonjour ${customShareRecipient || ''} ✨\nJe voulais te partager cette création de mon Atelier Couture :\n👗 *${selectedCreation.title}*\n${selectedCreation.description}\n\nDécouvre plus de photos et détails sur notre Atelier Digital :\n${window.location.origin}/#creation-${selectedCreation.slug}`
    : `Bonjour ${customShareRecipient || ''} ✨\nVoici une superbe inspiration couture :\n💡 *${selectedInspiration?.title}*\n${selectedInspiration?.description}\n\nRéalisable sur mesure dans notre Atelier Digital !`

  const handleCopyShare = () => {
    navigator.clipboard.writeText(shareText);
    setCopiedShareText(true);
    setTimeout(() => setCopiedShareText(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const url = generateWhatsAppLink('', shareText);
    window.open(url, '_blank');
  };

  // If NOT authenticated, show standard modern AdminAuthScreen
  if (!adminAuthenticated) {
    return (
      <AdminAuthScreen
        onSuccess={() => triggerSuccess('Bienvenue dans votre espace Atelier Vanessa Kaniki !')}
        onCancel={() => setActiveTab('home')}
      />
    );
  }

  // Find the featured creation
  const featuredItem = creations.find(c => c.misEnAvant || c.isFeatured);

  return (
    <section id="admin-panel-dashboard" className="py-12 sm:py-16 bg-[#FAF8F5] min-h-screen relative select-none">
      
      {/* Decorative Ambient Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#C5A880]/10 via-transparent to-transparent blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        
        {/* 1. HAUTE COUTURE HEADER BAR */}
        <div className="bg-[#141210] text-[#FAF8F5] p-6 sm:p-8 rounded-3xl shadow-[0_20px_50px_rgba(20,18,16,0.25)] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border border-[#2E2822] relative overflow-hidden">
          
          {/* Top Gold Foil Accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C5A880] to-transparent" />

          {/* Left: Designer Avatar & Info */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#2C2621] to-[#181512] border-2 border-[#C5A880]/60 text-[#D4AF37] flex items-center justify-center font-bold text-xl tracking-wider shadow-md" style={{ fontFamily: "'Cinzel', serif" }}>
                VK
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#141210] flex items-center justify-center shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </span>
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#C5A880]/15 text-[#E8D8C4] text-[10px] font-bold uppercase tracking-[0.2em] border border-[#C5A880]/30">
                <Crown className="w-3 h-3 text-[#D4AF37]" />
                <span>Direction Haute Couture</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-wide text-[#FAF8F5]" style={{ fontFamily: "'Cinzel', serif" }}>
                Atelier Digital de Vanessa
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#A89C8F]">
                <span className="text-[#E8D8C4] font-medium">{settings.designerName || 'Vanessa Kaniki'}</span>
                <span>•</span>
                <span className="text-[#C5A880]">{settings.email || 'mutangilwaivan@gmail.com'}</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Session Sécurisée</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end pt-2 lg:pt-0 border-t lg:border-t-0 border-[#2E2822]">
            <button
              onClick={() => setActiveTab('home')}
              className="px-4 py-2.5 rounded-xl bg-[#241F1A] hover:bg-[#332C25] text-xs font-bold uppercase tracking-wider text-[#FAF8F5] transition-all border border-[#3D352E] cursor-pointer flex items-center gap-2 hover:border-[#C5A880]/40 shadow-xs"
            >
              <Eye className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Voir la Vitrine</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-200 border border-rose-800/40 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              title="Fermer la session d'administration"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>

        {/* 2. KPI METRICS SUMMARY ROW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5DDD2] shadow-xs flex items-center gap-3.5 luxury-card-hover">
            <div className="w-11 h-11 rounded-xl bg-[#FAF8F5] border border-[#E5DDD2] text-[#C5A880] flex items-center justify-center shrink-0">
              <Shirt className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B] block">Vitrine Atelier</span>
              <span className="text-xl sm:text-2xl font-bold text-[#181512]" style={{ fontFamily: "'Cinzel', serif" }}>
                {creations.length}
              </span>
              <span className="text-[10px] text-[#6B5F54] block truncate">pièces créées</span>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5DDD2] shadow-xs flex items-center gap-3.5 luxury-card-hover">
            <div className="w-11 h-11 rounded-xl bg-[#FAF8F5] border border-[#E5DDD2] text-[#C5A880] flex items-center justify-center shrink-0">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B] block">Inspirations</span>
              <span className="text-xl sm:text-2xl font-bold text-[#181512]" style={{ fontFamily: "'Cinzel', serif" }}>
                {inspirations.length}
              </span>
              <span className="text-[10px] text-[#6B5F54] block truncate">modèles & styles</span>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5DDD2] shadow-xs flex items-center gap-3.5 luxury-card-hover">
            <div className="w-11 h-11 rounded-xl bg-[#FAF8F5] border border-[#E5DDD2] text-[#C5A880] flex items-center justify-center shrink-0">
              <Star className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B] block">Avis Clientes</span>
              <span className="text-xl sm:text-2xl font-bold text-[#181512]" style={{ fontFamily: "'Cinzel', serif" }}>
                {testimonials.length}
              </span>
              <span className="text-[10px] text-[#6B5F54] block truncate">témoignages 5★</span>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5DDD2] shadow-xs flex items-center gap-3.5 luxury-card-hover">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">WhatsApp Atelier</span>
              <span className="text-xs font-bold text-[#181512] block truncate">
                {settings.whatsappNumber || '+33658921473'}
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold block">Actif & Relié</span>
            </div>
          </div>

        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-xs animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 3. NAVIGATION TABS (TOUCH-FRIENDLY & SWIPEABLE ON MOBILE) */}
        <div className="overflow-x-auto no-scrollbar py-1">
          <div className="inline-flex gap-2 p-1.5 bg-white/95 backdrop-blur-md rounded-2xl border border-[#E5DDD2] shadow-sm min-w-full sm:min-w-0">
            
            <button
              onClick={() => setActiveAdminTab('creations')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeAdminTab === 'creations' 
                  ? 'bg-[#181512] text-[#FAF8F5] shadow-md border border-[#3D352E]' 
                  : 'text-[#6B5F54] hover:bg-[#FAF8F5] hover:text-[#181512]'
              }`}
            >
              <Shirt className="w-4 h-4 text-[#C5A880]" />
              <span>Créations ({creations.length})</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('inspirations')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeAdminTab === 'inspirations' 
                  ? 'bg-[#181512] text-[#FAF8F5] shadow-md border border-[#3D352E]' 
                  : 'text-[#6B5F54] hover:bg-[#FAF8F5] hover:text-[#181512]'
              }`}
            >
              <Lightbulb className="w-4 h-4 text-[#C5A880]" />
              <span>Inspirations ({inspirations.length})</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('occasions')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeAdminTab === 'occasions' 
                  ? 'bg-[#181512] text-[#FAF8F5] shadow-md border border-[#3D352E]' 
                  : 'text-[#6B5F54] hover:bg-[#FAF8F5] hover:text-[#181512]'
              }`}
            >
              <Calendar className="w-4 h-4 text-[#C5A880]" />
              <span>Occasions ({occasions.length})</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('testimonials')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeAdminTab === 'testimonials' 
                  ? 'bg-[#181512] text-[#FAF8F5] shadow-md border border-[#3D352E]' 
                  : 'text-[#6B5F54] hover:bg-[#FAF8F5] hover:text-[#181512]'
              }`}
            >
              <Star className="w-4 h-4 text-[#C5A880]" />
              <span>Avis ({testimonials.length})</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('share-tool')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeAdminTab === 'share-tool' 
                  ? 'bg-[#181512] text-[#FAF8F5] shadow-md border border-[#3D352E]' 
                  : 'text-[#6B5F54] hover:bg-[#FAF8F5] hover:text-[#181512]'
              }`}
            >
              <Share2 className="w-4 h-4 text-[#25D366]" />
              <span>Partage WhatsApp</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('settings')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeAdminTab === 'settings' 
                  ? 'bg-[#181512] text-[#FAF8F5] shadow-md border border-[#3D352E]' 
                  : 'text-[#6B5F54] hover:bg-[#FAF8F5] hover:text-[#181512]'
              }`}
            >
              <Settings className="w-4 h-4 text-[#C5A880]" />
              <span>Paramètres</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('backup')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                activeAdminTab === 'backup' 
                  ? 'bg-[#181512] text-[#FAF8F5] shadow-md border border-[#3D352E]' 
                  : 'text-[#6B5F54] hover:bg-[#FAF8F5] hover:text-[#181512]'
              }`}
            >
              <Save className="w-4 h-4 text-[#C5A880]" />
              <span>Sauvegarde</span>
            </button>

          </div>
        </div>

        {/* TAB 1: CREATIONS MANAGEMENT */}
        {activeAdminTab === 'creations' && (
          <div className="space-y-8">
            
            {/* Mode Switcher for Creation Form: Express Vanessa vs Full Form */}
            {!editingCreationId && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-[#E5DDD2] shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#181512]">Mode d'ajout :</span>
                  <span className="text-[11px] text-[#8C7A6B]">
                    {creationFormMode === 'simple' ? '✨ Mode Simple Vanessa (3 étapes rapides)' : '🛠️ Mode Avancé Détaillé'}
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-[#E5DDD2] self-stretch sm:self-auto justify-center">
                  <button
                    type="button"
                    onClick={() => setCreationFormMode('simple')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      creationFormMode === 'simple'
                        ? 'bg-[#181512] text-white shadow-xs'
                        : 'text-[#5C5248] hover:text-[#181512]'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Mode Express Vanessa</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreationFormMode('advanced')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      creationFormMode === 'advanced'
                        ? 'bg-[#181512] text-white shadow-xs'
                        : 'text-[#5C5248] hover:text-[#181512]'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Mode Avancé</span>
                  </button>
                </div>
              </div>
            )}

            {/* Quick Add Component for Vanessa */}
            {!editingCreationId && creationFormMode === 'simple' ? (
              <VanessaQuickAddModal 
                onSuccess={() => {
                  triggerSuccess('✨ Félicitations Vanessa ! Votre nouvelle création est publiée sur le site !');
                }}
              />
            ) : (
            /* Add / Edit Form Card (Advanced / Editing) */
            <div className="bg-white p-6 sm:p-9 rounded-3xl border border-[#E5DDD2] shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-4">
                <h2 className="font-cinzel text-xl font-bold text-[#181512] flex items-center gap-2">
                  <Shirt className="w-5 h-5 text-[#C5A880]" />
                  <span>{editingCreationId ? 'Modifier la Création' : 'Ajouter une Nouvelle Création (Mode Complet)'}</span>
                </h2>
                {editingCreationId && (
                  <button
                    onClick={() => {
                      setEditingCreationId(null);
                      setCreationForm({
                        title: '',
                        subtitle: '',
                        description: '',
                        longDescription: '',
                        occasionName: occasions[0]?.name || 'Mariages & Cérémonies',
                        categories: 'Haute Couture, Sur-Mesure',
                        colors: 'Noir, Doré',
                        fabrics: 'Soie Sauvage, Dentelle',
                        silhouette: 'Sculpturale & Évasée',
                        coutureLine: 'Ligne Gala & Tapis Rouge',
                        fittingDetails: '2 séances privées d’essayage à l’Atelier de Kinshasa ou visioconférence guidée pour la Diaspora',
                        images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=750&q=75'],
                        videoUrl: '',
                        priceEstimate: 'Sur devis (Dès 750$)',
                        preparationTime: '3 à 5 semaines',
                        isAvailable: true,
                        availabilityBadge: 'Sur commande',
                        customOptions: 'Ajustement de la traîne, Choix des manches',
                        isFeatured: false,
                      });
                    }}
                    className="text-xs text-rose-600 font-semibold hover:underline cursor-pointer"
                  >
                    Annuler l'édition
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveCreation} className="space-y-5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                      Nom de la Création *
                    </label>
                    <input
                      type="text"
                      required
                      value={creationForm.title}
                      onChange={(e) => setCreationForm({ ...creationForm, title: e.target.value })}
                      placeholder="Ex: Robe Impériale AURA"
                      className="w-full bg-[#FAF8F5] border border-[#E5DDD2] rounded-2xl px-4 py-3 text-xs text-[#181512] focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/20 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                      Sous-titre / Signature
                    </label>
                    <input
                      type="text"
                      value={creationForm.subtitle}
                      onChange={(e) => setCreationForm({ ...creationForm, subtitle: e.target.value })}
                      placeholder="Ex: Drapé sculptural & traîne majestueuse"
                      className="w-full bg-[#FAF8F5] border border-[#E5DDD2] rounded-2xl px-4 py-3 text-xs text-[#181512] focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/20 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                      Occasion / Collection
                    </label>
                    <select
                      value={creationForm.occasionName}
                      onChange={(e) => setCreationForm({ ...creationForm, occasionName: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#E5DDD2] rounded-2xl px-4 py-3 text-xs text-[#181512] focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/20 focus:outline-none"
                    >
                      {occasions.map(occ => (
                        <option key={occ.id} value={occ.name}>{occ.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                      Disponibilité
                    </label>
                    <select
                      value={creationForm.availabilityBadge}
                      onChange={(e) => setCreationForm({ 
                        ...creationForm, 
                        availabilityBadge: e.target.value as any,
                        isAvailable: e.target.value !== 'En confection'
                      })}
                      className="w-full bg-[#FAF8F5] border border-[#E5DDD2] rounded-2xl px-4 py-3 text-xs text-[#181512] focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/20 focus:outline-none"
                    >
                      <option value="Sur commande">Sur commande</option>
                      <option value="Pièce unique disponible">Pièce unique disponible</option>
                      <option value="En confection">En confection</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                      Silhouette / Coupe
                    </label>
                    <input
                      type="text"
                      value={creationForm.silhouette}
                      onChange={(e) => setCreationForm({ ...creationForm, silhouette: e.target.value })}
                      placeholder="Ex: Fourreau sirène avec fente"
                      className="w-full bg-[#FAF8F5] border border-[#E5DDD2] rounded-2xl px-4 py-3 text-xs text-[#181512] focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/20 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                      Tissus & Étoffes (séparés par des virgules)
                    </label>
                    <input
                      type="text"
                      value={creationForm.fabrics}
                      onChange={(e) => setCreationForm({ ...creationForm, fabrics: e.target.value })}
                      placeholder="Ex: Soie sauvage moirée, Organza plissé"
                      className="w-full bg-[#FAF8F5] border border-[#E5DDD2] rounded-2xl px-4 py-3 text-xs text-[#181512] focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/20 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                      Couleurs présentées (séparées par des virgules)
                    </label>
                    <input
                      type="text"
                      value={creationForm.colors}
                      onChange={(e) => setCreationForm({ ...creationForm, colors: e.target.value })}
                      placeholder="Ex: Noir Profond, Bleu Saphir"
                      className="w-full bg-[#FAF8F5] border border-[#E5DDD2] rounded-2xl px-4 py-3 text-xs text-[#181512] focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/20 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                    Description Courte
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={creationForm.description}
                    onChange={(e) => setCreationForm({ ...creationForm, description: e.target.value })}
                    placeholder="Description concise pour la carte de présentation..."
                    className="w-full bg-[#FAF8F5] border border-[#E5DDD2] rounded-2xl p-4 text-xs text-[#181512] focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/20 focus:outline-none"
                  />
                </div>

                {/* Photos & Image Upload */}
                <div className="space-y-3 pt-2">
                  <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                    Photos de la création (URLs ou Import Direct)
                  </label>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-[#FAF8F5] hover:bg-[#F0EAE1] text-[#181512] rounded-xl text-xs font-bold uppercase tracking-wider transition-colors border border-[#E5DDD2]">
                      <Upload className="w-4 h-4 text-[#C5A880]" />
                      <span>Charger une photo depuis mon appareil</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageFileUpload(e, (url) => {
                          setCreationForm(prev => ({
                            ...prev,
                            images: [url, ...prev.images.filter(Boolean)]
                          }));
                        })}
                      />
                    </label>
                  </div>

                  <div className="space-y-2">
                    {creationForm.images.map((img, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={img}
                          onChange={(e) => {
                            const next = [...creationForm.images];
                            next[idx] = e.target.value;
                            setCreationForm({ ...creationForm, images: next });
                          }}
                          placeholder="https://..."
                          className="flex-1 bg-[#FAF8F5] border border-[#E5DDD2] rounded-xl px-3.5 py-2 text-xs text-[#181512]"
                        />
                        {creationForm.images.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setCreationForm({
                                ...creationForm,
                                images: creationForm.images.filter((_, i) => i !== idx)
                              });
                            }}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setCreationForm({ ...creationForm, images: [...creationForm.images, ''] })}
                      className="text-xs text-[#C5A880] hover:text-[#181512] font-semibold cursor-pointer"
                    >
                      + Ajouter une autre photo (URL)
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="inline-flex items-center gap-2.5 cursor-pointer select-none bg-[#FAF8F5] px-4 py-2.5 rounded-2xl border border-[#E5DDD2]">
                    <input
                      type="checkbox"
                      checked={creationForm.isFeatured}
                      onChange={(e) => setCreationForm({ ...creationForm, isFeatured: e.target.checked })}
                      className="w-4 h-4 rounded border-[#E5DDD2] text-[#C5A880] focus:ring-[#C5A880]"
                    />
                    <span className="text-xs font-semibold text-[#181512] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>Mettre en avant comme Pièce Signature / Coup de Cœur</span>
                    </span>
                  </label>
                </div>

                <div className="pt-4 border-t border-[#F0EAE1]">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3.5 bg-[#181512] hover:bg-[#2C2621] text-[#FAF8F5] rounded-2xl text-xs font-bold uppercase tracking-[0.18em] shadow-md hover:shadow-xl transition-all cursor-pointer border border-[#3D352E]"
                  >
                    {editingCreationId ? 'Enregistrer les Modifications' : 'Publier cette Création'}
                  </button>
                </div>

              </form>
            </div>
            )}

            {/* List of existing creations */}
            <div className="bg-white p-6 sm:p-9 rounded-3xl border border-[#E5DDD2] shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-cinzel text-lg font-bold text-[#181512] tracking-wide">
                  Catalogue Actuel ({creations.length} pièces)
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {creations.map(c => {
                  const isFeaturedItem = Boolean(c.misEnAvant || c.isFeatured);
                  return (
                    <div
                      key={c.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isFeaturedItem 
                          ? 'border-[#C5A880]/60 bg-gradient-to-r from-amber-50/40 via-white to-[#FAF8F5] shadow-xs' 
                          : 'border-[#E5DDD2] bg-[#FAF8F5] hover:border-[#C5A880]/40'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={c.images[0]}
                          alt={c.title}
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 rounded-2xl object-cover border border-[#E5DDD2] shrink-0 shadow-xs"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-cinzel text-sm font-bold text-[#181512]">
                              {c.title}
                            </h4>
                            {isFeaturedItem && (
                              <span className="inline-flex items-center gap-1 text-[9.5px] font-bold px-2 py-0.5 bg-[#C5A880]/20 text-[#8C7A6B] rounded-full uppercase tracking-wider border border-[#C5A880]/30">
                                <Sparkles className="w-3 h-3 text-[#C5A880]" />
                                <span>À la une</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#8C7A6B] block">
                            {c.occasionName} • {c.silhouette}
                          </span>
                          <span className="inline-block text-[10.5px] text-[#9E7D53] font-semibold">
                            {c.availabilityBadge} • {c.priceEstimate || 'Sur devis'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#EAE3DA]">
                        <button
                          onClick={() => {
                            setFeaturedCreation(c.id);
                            triggerSuccess(`"${c.title}" est désormais le Projet Coup de Cœur à la une !`);
                          }}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isFeaturedItem 
                              ? 'bg-[#181512] text-[#D4AF37] shadow-xs border border-[#3D352E]' 
                              : 'bg-white hover:bg-[#FAF8F5] text-[#5C5248] border border-[#E5DDD2]'
                          }`}
                          title="Définir comme Coup de Cœur"
                        >
                          <Star className={`w-3.5 h-3.5 ${isFeaturedItem ? 'fill-current text-[#D4AF37]' : ''}`} />
                          <span>{isFeaturedItem ? '★ Coup de Cœur' : 'Mettre à la une'}</span>
                        </button>

                        <button
                          onClick={() => toggleCreationAvailability(c.id)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                            c.isAvailable ? 'bg-emerald-100/80 text-emerald-800 hover:bg-emerald-100' : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'
                          }`}
                        >
                          {c.isAvailable ? 'Disponible' : 'Indisponible'}
                        </button>

                        <button
                          onClick={() => setSelectedCreationForDetail(c)}
                          className="p-2 bg-white hover:bg-[#FAF8F5] text-[#8C7A6B] hover:text-[#181512] rounded-xl border border-[#E5DDD2] cursor-pointer"
                          title="Voir la fiche immersive"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleEditCreationClick(c)}
                          className="p-2 bg-white hover:bg-[#F5EFEB] text-[#181512] rounded-xl border border-[#E5DDD2] cursor-pointer"
                          title="Modifier"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Supprimer définitivement "${c.title}" ?`)) {
                              deleteCreation(c.id);
                              triggerSuccess('Création supprimée.');
                            }
                          }}
                          className="p-2 bg-white hover:bg-rose-50 text-rose-600 rounded-xl border border-rose-200 cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: INSPIRATIONS MANAGEMENT */}
        {activeAdminTab === 'inspirations' && (
          <div className="space-y-8">
            
            {/* Guide Sources d'Inspiration */}
            <div className="p-6 rounded-3xl bg-[#141210] text-[#FAF8F5] border border-[#2E2822] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
              <div className="space-y-1.5 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#C5A880]/20 text-[#D4AF37] text-[10.5px] font-bold uppercase tracking-[0.2em]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Cahier de Tendances</span>
                </div>
                <h3 className="font-cinzel text-base sm:text-lg font-bold text-[#FAF8F5]">
                  Où dénicher et poster vos modèles d'inspiration ?
                </h3>
                <p className="text-xs text-[#D8CFC4] max-w-2xl leading-relaxed">
                  Pinterest, défilés haute couture africains et parisiens, Instagram ou Vogue Runway. Vous pouvez répertorier ces inspirations pour les proposer à vos clientes sur-mesure !
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0 relative z-10">
                <span className="px-3.5 py-1.5 rounded-full bg-white/10 text-xs text-[#E5D5C3] border border-white/10 font-medium">📌 Pinterest</span>
                <span className="px-3.5 py-1.5 rounded-full bg-white/10 text-xs text-[#E5D5C3] border border-white/10 font-medium">📸 Instagram</span>
                <span className="px-3.5 py-1.5 rounded-full bg-white/10 text-xs text-[#E5D5C3] border border-white/10 font-medium">✨ Défilés</span>
              </div>
            </div>

            {/* Add Inspiration Form */}
            <div className="bg-white p-6 sm:p-9 rounded-3xl border border-[#E5DDD2] shadow-sm space-y-6">
              <h2 className="font-cinzel text-xl font-bold text-[#181512] flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-[#C5A880]" />
                <span>{editingInspirationId ? 'Modifier l’Inspiration' : 'Ajouter une Inspiration / Tendance'}</span>
              </h2>

              <form onSubmit={handleSaveInspiration} className="space-y-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                      Titre du Modèle *
                    </label>
                    <input
                      type="text"
                      required
                      value={inspirationForm.title}
                      onChange={(e) => setInspirationForm({ ...inspirationForm, title: e.target.value })}
                      placeholder="Ex: Drapé Sculptural Haute Couture"
                      className="w-full bg-[#FAF8F5] border border-[#E5DDD2] rounded-2xl px-4 py-3 text-xs text-[#181512] focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/20 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                      Occasion / Style
                    </label>
                    <select
                      value={inspirationForm.occasion}
                      onChange={(e) => setInspirationForm({ ...inspirationForm, occasion: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#E5DDD2] rounded-2xl px-4 py-3 text-xs text-[#181512] focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/20 focus:outline-none"
                    >
                      {occasions.map(occ => (
                        <option key={occ.id} value={occ.name}>{occ.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DDD2] space-y-2">
                  <label className="text-xs font-bold text-[#181512] block">
                    Statut du modèle (Transparence client) :
                  </label>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="originalStatus"
                        checked={inspirationForm.isOriginalCreation === true}
                        onChange={() => setInspirationForm({ ...inspirationForm, isOriginalCreation: true, sourceAuthor: "Atelier Maison Van's" })}
                        className="text-[#C5A880] focus:ring-[#C5A880]"
                      />
                      <span className="text-xs font-bold text-[#9E7D53]">
                        ✨ Création Originale de l'Atelier
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="originalStatus"
                        checked={inspirationForm.isOriginalCreation === false}
                        onChange={() => setInspirationForm({ ...inspirationForm, isOriginalCreation: false, sourceAuthor: 'Inspiration Défilé / Pinterest' })}
                        className="text-[#C5A880] focus:ring-[#C5A880]"
                      />
                      <span className="text-xs font-bold text-[#4A423A]">
                        💡 Inspiration Externe / Tendance Mode
                      </span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                      Source ou Auteur
                    </label>
                    <input
                      type="text"
                      value={inspirationForm.sourceAuthor}
                      onChange={(e) => setInspirationForm({ ...inspirationForm, sourceAuthor: e.target.value })}
                      placeholder="Ex: Pinterest / Défilé Milan"
                      className="w-full bg-[#FAF8F5] border border-[#E5DDD2] rounded-2xl px-4 py-3 text-xs text-[#181512]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                      Tags de Style
                    </label>
                    <input
                      type="text"
                      value={inspirationForm.styleTags}
                      onChange={(e) => setInspirationForm({ ...inspirationForm, styleTags: e.target.value })}
                      placeholder="Ex: Sculptural, Minimaliste, Dos Nu"
                      className="w-full bg-[#FAF8F5] border border-[#E5DDD2] rounded-2xl px-4 py-3 text-xs text-[#181512]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                    Description du Style
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={inspirationForm.description}
                    onChange={(e) => setInspirationForm({ ...inspirationForm, description: e.target.value })}
                    placeholder="Description de la coupe et des spécificités..."
                    className="w-full bg-[#FAF8F5] border border-[#E5DDD2] rounded-2xl p-4 text-xs text-[#181512]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                    Photo d'Inspiration
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-[#FAF8F5] hover:bg-[#F0EAE1] text-[#181512] rounded-xl text-xs font-bold uppercase tracking-wider transition-colors border border-[#E5DDD2] shrink-0">
                      <Upload className="w-4 h-4 text-[#C5A880]" />
                      <span>Uploader une photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageFileUpload(e, (url) => {
                          setInspirationForm(prev => ({ ...prev, imageUrl: url }));
                        })}
                      />
                    </label>
                    <input
                      type="text"
                      value={inspirationForm.imageUrl}
                      onChange={(e) => setInspirationForm({ ...inspirationForm, imageUrl: e.target.value })}
                      placeholder="https://..."
                      className="flex-1 w-full bg-[#FAF8F5] border border-[#E5DDD2] rounded-xl px-3.5 py-2.5 text-xs text-[#181512]"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-8 py-3.5 bg-[#181512] hover:bg-[#2C2621] text-[#FAF8F5] rounded-2xl text-xs font-bold uppercase tracking-[0.18em] shadow-md cursor-pointer border border-[#3D352E]"
                  >
                    {editingInspirationId ? 'Enregistrer l’Inspiration' : 'Ajouter au Carnet'}
                  </button>
                </div>

              </form>
            </div>

            {/* List of Inspirations */}
            <div className="bg-white p-6 sm:p-9 rounded-3xl border border-[#E5DDD2] shadow-sm space-y-6">
              <h3 className="font-cinzel text-lg font-bold text-[#181512]">
                Inspirations Actuelles ({inspirations.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {inspirations.map(item => (
                  <div key={item.id} className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#E5DDD2] flex items-center justify-between gap-3.5 luxury-card-hover">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-xl object-cover shrink-0 border border-[#E5DDD2]"
                    />
                    <div className="overflow-hidden flex-1">
                      <h4 className="font-cinzel text-xs font-bold truncate text-[#181512]">{item.title}</h4>
                      <span className="text-[10px] text-[#8C7A6B] block truncate">{item.occasion}</span>
                      <span className="text-[9.5px] font-bold text-[#9E7D53] block">
                        {item.isOriginalCreation ? '✨ Originale' : '💡 Externe'}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`Supprimer l’inspiration "${item.title}" ?`)) {
                          deleteInspiration(item.id);
                          triggerSuccess('Inspiration supprimée.');
                        }
                      }}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: OCCASIONS MANAGEMENT */}
        {activeAdminTab === 'occasions' && (
          <div className="space-y-8">
            <div className="bg-white p-6 sm:p-9 rounded-3xl border border-[#E5DDD2] shadow-sm space-y-6">
              <h2 className="font-cinzel text-xl font-bold text-[#181512] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#C5A880]" />
                <span>Gérer les Occasions & Catégories d'Événements</span>
              </h2>

              <form onSubmit={handleSaveOccasion} className="space-y-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                      Nom de l'Occasion *
                    </label>
                    <input
                      type="text"
                      required
                      value={occasionForm.name}
                      onChange={(e) => setOccasionForm({ ...occasionForm, name: e.target.value })}
                      placeholder="Ex: Cérémonies Religieuses"
                      className="w-full bg-[#FAF8F5] border border-[#E5DDD2] rounded-2xl px-4 py-3 text-xs text-[#181512]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                      Image de Couverture
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer px-3.5 py-3 bg-[#FAF8F5] hover:bg-[#F0EAE1] text-[#181512] rounded-xl text-xs font-bold border border-[#E5DDD2]">
                        <Upload className="w-4 h-4 text-[#C5A880]" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageFileUpload(e, (url) => {
                            setOccasionForm(prev => ({ ...prev, coverImage: url }));
                          })}
                        />
                      </label>
                      <input
                        type="text"
                        value={occasionForm.coverImage}
                        onChange={(e) => setOccasionForm({ ...occasionForm, coverImage: e.target.value })}
                        placeholder="https://..."
                        className="flex-1 bg-[#FAF8F5] border border-[#E5DDD2] rounded-2xl px-4 py-3 text-xs text-[#181512]"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                    Description de la Collection
                  </label>
                  <textarea
                    rows={2}
                    value={occasionForm.description}
                    onChange={(e) => setOccasionForm({ ...occasionForm, description: e.target.value })}
                    placeholder="Description courte de ce type d'événement..."
                    className="w-full bg-[#FAF8F5] border border-[#E5DDD2] rounded-2xl p-4 text-xs text-[#181512]"
                  />
                </div>

                <button
                  type="submit"
                  className="px-8 py-3.5 bg-[#181512] hover:bg-[#2C2621] text-white rounded-2xl text-xs font-bold uppercase tracking-[0.18em] cursor-pointer"
                >
                  {editingOccasionId ? 'Mettre à jour l’Occasion' : 'Créer l’Occasion'}
                </button>
              </form>

              {/* List */}
              <div className="pt-4 border-t border-[#F0EAE1] space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C7A6B]">
                  Occasions Actuellement Définies :
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {occasions.map(occ => (
                    <div key={occ.id} className="p-3.5 rounded-2xl border border-[#E5DDD2] bg-[#FAF8F5] flex items-center justify-between gap-3.5 luxury-card-hover">
                      <img
                        src={occ.coverImage}
                        alt={occ.name}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-[#E5DDD2]"
                      />
                      <div className="flex-1 overflow-hidden">
                        <span className="font-cinzel text-xs font-bold text-[#181512] block truncate">{occ.name}</span>
                        <span className="text-[10px] text-[#8C7A6B] line-clamp-1">{occ.description}</span>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm(`Supprimer l'occasion "${occ.name}" ?`)) {
                            deleteOccasion(occ.id);
                            triggerSuccess('Occasion supprimée.');
                          }
                        }}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TESTIMONIALS MANAGEMENT */}
        {activeAdminTab === 'testimonials' && (
          <div className="space-y-8">
            <div className="bg-white p-6 sm:p-9 rounded-3xl border border-[#E5DDD2] shadow-sm space-y-6">
              <h2 className="font-cinzel text-xl font-bold text-[#181512] flex items-center gap-2">
                <Star className="w-5 h-5 text-[#C5A880]" />
                <span>Gestion des Avis & Témoignages Clientes</span>
              </h2>

              <form onSubmit={handleSaveTestimonial} className="space-y-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                      Prénom de la Cliente *
                    </label>
                    <input
                      type="text"
                      required
                      value={testimonialForm.clientName}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, clientName: e.target.value })}
                      placeholder="Ex: Sarah M."
                      className="w-full bg-[#FAF8F5] border border-[#E5DDD2] rounded-2xl px-4 py-3 text-xs text-[#181512]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                      Événement / Pièce
                    </label>
                    <input
                      type="text"
                      value={testimonialForm.eventType}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, eventType: e.target.value })}
                      placeholder="Ex: Mariage (Robe Céleste)"
                      className="w-full bg-[#FAF8F5] border border-[#E5DDD2] rounded-2xl px-4 py-3 text-xs text-[#181512]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                      Note (Étoiles)
                    </label>
                    <select
                      value={testimonialForm.rating}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: Number(e.target.value) })}
                      className="w-full bg-[#FAF8F5] border border-[#E5DDD2] rounded-2xl px-4 py-3 text-xs text-[#181512]"
                    >
                      <option value="5">⭐⭐⭐⭐⭐ (5 étoiles)</option>
                      <option value="4">⭐⭐⭐⭐ (4 étoiles)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                    Témoignage de la Cliente *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={testimonialForm.feedback}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, feedback: e.target.value })}
                    placeholder="Ce que la cliente a exprimé sur la confection, les finitions, le confort..."
                    className="w-full bg-[#FAF8F5] border border-[#E5DDD2] rounded-2xl p-4 text-xs text-[#181512]"
                  />
                </div>

                <button
                  type="submit"
                  className="px-8 py-3.5 bg-[#181512] hover:bg-[#2C2621] text-white rounded-2xl text-xs font-bold uppercase tracking-[0.18em] cursor-pointer"
                >
                  {editingTestimonialId ? 'Enregistrer le Témoignage' : 'Publier le Témoignage'}
                </button>
              </form>

              {/* List */}
              <div className="pt-4 border-t border-[#F0EAE1] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C7A6B]">
                  Avis Publiés :
                </h4>
                <div className="space-y-2.5">
                  {testimonials.map(t => (
                    <div key={t.id} className="p-4 sm:p-5 rounded-2xl border border-[#E5DDD2] bg-[#FAF8F5] flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#181512]">{t.clientName}</span>
                          <span className="text-[11px] text-[#8C7A6B]">({t.eventType})</span>
                          <span className="text-[#D4AF37] text-xs">{'★'.repeat(t.rating)}</span>
                        </div>
                        <p className="text-xs text-[#5C5248] italic line-clamp-1 mt-0.5" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                          « {t.feedback} »
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleTestimonialVisibility(t.id)}
                          className={`p-2 rounded-xl text-xs font-semibold cursor-pointer ${
                            t.isVisible ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-600'
                          }`}
                          title={t.isVisible ? 'Masquer' : 'Afficher'}
                        >
                          {t.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Supprimer cet avis de ${t.clientName} ?`)) {
                              deleteTestimonial(t.id);
                              triggerSuccess('Avis supprimé.');
                            }
                          }}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: FAST SHARE TOOL FOR WHATSAPP */}
        {activeAdminTab === 'share-tool' && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-9 rounded-3xl border border-[#E5DDD2] shadow-sm space-y-6">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#25D366]/20 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>Partage WhatsApp Instantané</span>
                </div>
                <h2 className="font-cinzel text-xl font-bold text-[#181512]">
                  Partager une Création ou Inspiration en 1 Clic
                </h2>
                <p className="text-xs text-[#6B5F54]">
                  Générez un message WhatsApp soigné et prêt à l'envoi pour présenter une création à une cliente ou pour votre statut.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                    Type d'élément
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedShareItemType('creation');
                        setSelectedShareItemId(creations[0]?.id || '');
                      }}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all ${
                        selectedShareItemType === 'creation' ? 'bg-[#181512] text-white shadow-xs' : 'bg-[#FAF8F5] text-[#5C5248] border border-[#E5DDD2]'
                      }`}
                    >
                      Création Atelier
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedShareItemType('inspiration');
                        setSelectedShareItemId(inspirations[0]?.id || '');
                      }}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all ${
                        selectedShareItemType === 'inspiration' ? 'bg-[#181512] text-white shadow-xs' : 'bg-[#FAF8F5] text-[#5C5248] border border-[#E5DDD2]'
                      }`}
                    >
                      Inspiration Moodboard
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                    Choisir la Pièce
                  </label>
                  <select
                    value={selectedShareItemId}
                    onChange={(e) => setSelectedShareItemId(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E5DDD2] rounded-2xl px-4 py-3 text-xs text-[#181512]"
                  >
                    {selectedShareItemType === 'creation' 
                      ? creations.map(c => <option key={c.id} value={c.id}>{c.title} ({c.occasionName})</option>)
                      : inspirations.map(i => <option key={i.id} value={i.id}>{i.title} ({i.occasion})</option>)
                    }
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                  Prénom de la cliente destinataire (Optionnel)
                </label>
                <input
                  type="text"
                  value={customShareRecipient}
                  onChange={(e) => setCustomShareRecipient(e.target.value)}
                  placeholder="Ex: Sophie"
                  className="w-full sm:w-80 bg-[#FAF8F5] border border-[#E5DDD2] rounded-2xl px-4 py-3 text-xs text-[#181512]"
                />
              </div>

              {/* Message Preview Box */}
              <div className="p-5 rounded-3xl bg-[#141210] text-[#FAF8F5] space-y-3 border border-[#2E2822]">
                <span className="text-[10px] uppercase font-bold text-[#C5A880] tracking-[0.2em] block">
                  Aperçu du message WhatsApp généré :
                </span>
                <pre className="text-xs font-sans whitespace-pre-wrap text-[#D8CFC4] bg-[#221E1A] p-4 rounded-2xl border border-[#3A332C]">
                  {shareText}
                </pre>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleWhatsAppShare}
                  className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-6 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-md cursor-pointer transition-all active:scale-[0.98]"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Envoyer sur WhatsApp</span>
                </button>

                <button
                  onClick={handleCopyShare}
                  className="inline-flex items-center gap-2 bg-[#FAF8F5] hover:bg-[#F0EAE1] text-[#181512] border border-[#E5DDD2] px-6 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {copiedShareText ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                  <span>{copiedShareText ? 'Texte copié !' : 'Copier le texte'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SETTINGS & SECURITY */}
        {activeAdminTab === 'settings' && (
          <div className="space-y-8">
            <div className="bg-white p-6 sm:p-9 rounded-3xl border border-[#E5DDD2] shadow-sm space-y-6">
              <h2 className="font-cinzel text-xl font-bold text-[#181512] flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#C5A880]" />
                <span>Coordonnées & Textes Généraux de l'Atelier</span>
              </h2>

              <form onSubmit={handleSaveSettings} className="space-y-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                      Nom de la Maison *
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.studioName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, studioName: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#E5DDD2] rounded-2xl px-4 py-3 text-xs text-[#181512]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                      Nom de la Créatrice *
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.designerName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, designerName: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#E5DDD2] rounded-2xl px-4 py-3 text-xs text-[#181512]"
                    />
                  </div>
                </div>

                {/* WhatsApp Number Global Card */}
                <div className="p-5 bg-emerald-50/80 border border-emerald-300 rounded-3xl space-y-2">
                  <label className="text-xs font-bold text-emerald-950 block flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-700 fill-current" />
                    <span>Numéro WhatsApp de Conversion (Mise à jour globale de tous les boutons) *</span>
                  </label>
                  <p className="text-[11px] text-emerald-800">
                    Ce numéro reçoit automatiquement toutes les commandes, demandes d'essayages et de devis du site.
                  </p>
                  <input
                    type="text"
                    required
                    value={settingsForm.whatsappNumber}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                    placeholder="+33658921473"
                    className="w-full bg-white border border-emerald-300 rounded-2xl px-4 py-3 text-xs font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                      Années d'Expérience
                    </label>
                    <input
                      type="number"
                      value={settingsForm.experienceYears}
                      onChange={(e) => setSettingsForm({ ...settingsForm, experienceYears: Number(e.target.value) })}
                      className="w-full bg-[#FAF8F5] border border-[#E5DDD2] rounded-2xl px-4 py-3 text-xs text-[#181512]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                      Créations Réalisées
                    </label>
                    <input
                      type="number"
                      value={settingsForm.creationsCount}
                      onChange={(e) => setSettingsForm({ ...settingsForm, creationsCount: Number(e.target.value) })}
                      className="w-full bg-[#FAF8F5] border border-[#E5DDD2] rounded-2xl px-4 py-3 text-xs text-[#181512]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                      Instagram
                    </label>
                    <input
                      type="text"
                      value={settingsForm.instagram}
                      onChange={(e) => setSettingsForm({ ...settingsForm, instagram: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#E5DDD2] rounded-2xl px-4 py-3 text-xs text-[#181512]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                      Adresse de l'Atelier
                    </label>
                    <input
                      type="text"
                      value={settingsForm.address}
                      onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#E5DDD2] rounded-2xl px-4 py-3 text-xs text-[#181512]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                      Horaires d'Ouverture
                    </label>
                    <input
                      type="text"
                      value={settingsForm.openingHours}
                      onChange={(e) => setSettingsForm({ ...settingsForm, openingHours: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#E5DDD2] rounded-2xl px-4 py-3 text-xs text-[#181512]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                    Biographie de la Créatrice
                  </label>
                  <textarea
                    rows={3}
                    value={settingsForm.bio}
                    onChange={(e) => setSettingsForm({ ...settingsForm, bio: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#E5DDD2] rounded-2xl p-4 text-xs text-[#181512]"
                  />
                </div>

                <div className="pt-4 border-t border-[#F0EAE1]">
                  <button
                    type="submit"
                    className="px-8 py-3.5 bg-[#181512] hover:bg-[#2C2621] text-white rounded-2xl text-xs font-bold uppercase tracking-[0.18em] shadow-md cursor-pointer"
                  >
                    Enregistrer Tous les Paramètres
                  </button>
                </div>

              </form>
            </div>

            {/* SECURITY & ACCESS CONTROLS CARD */}
            <div className="bg-white p-6 sm:p-9 rounded-3xl border border-[#E5DDD2] shadow-sm space-y-6">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#C5A880]/20 text-[#8C7A6B] text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Sécurité Cryptographique SHA-256</span>
                </div>
                <h2 className="font-cinzel text-xl font-bold text-[#181512] flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-[#C5A880]" />
                  <span>Mot de Passe Confidentiel Atelier</span>
                </h2>
                <p className="text-xs text-[#6B5F54]">
                  Modifiez votre mot de passe d'accès sécurisé pour l'adresse <strong>{settingsForm.email || settings.email}</strong>.
                </p>
              </div>

              {securityMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-semibold flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{securityMessage}</span>
                </div>
              )}

              {securityError && (
                <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl text-rose-900 text-xs font-semibold flex items-center gap-2.5">
                  <X className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{securityError}</span>
                </div>
              )}

              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!currentAdminPassword || currentAdminPassword.length < 6) {
                    setSecurityError('Veuillez saisir votre mot de passe actuel.');
                    return;
                  }
                  if (newAdminPassword.length < 6) {
                    setSecurityError('Le nouveau mot de passe doit comporter au moins 6 caractères.');
                    return;
                  }
                  if (newAdminPassword !== confirmAdminPassword) {
                    setSecurityError('Les deux nouveaux mots de passe ne correspondent pas.');
                    return;
                  }

                  setIsUpdatingPassword(true);
                  setSecurityError(null);
                  setSecurityMessage(null);

                  try {
                    let currentConfig: AdminAuthConfig | null = null;
                    try {
                      const snap = await getDoc(doc(db, 'settings', 'admin_auth'));
                      if (snap.exists()) {
                        currentConfig = snap.data() as AdminAuthConfig;
                      }
                    } catch (err) {
                      console.warn('Firestore load notice:', err);
                    }

                    if (!currentConfig) {
                      const localSaved = localStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
                      if (localSaved) currentConfig = JSON.parse(localSaved);
                    }

                    if (currentConfig?.passwordHash && currentConfig?.salt) {
                      const isCurrentValid = await verifyPassword(currentAdminPassword, currentConfig.passwordHash, currentConfig.salt);
                      if (!isCurrentValid) {
                        setSecurityError('Le mot de passe actuel saisi est incorrect.');
                        setIsUpdatingPassword(false);
                        return;
                      }
                    }

                    const salt = `salt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
                    const passwordHash = await hashPassword(newAdminPassword, salt);

                    const updatedConfig: AdminAuthConfig = {
                      email: settingsForm.email || 'mutangilwaivan@gmail.com',
                      passwordHash,
                      salt,
                      updatedAt: new Date().toISOString(),
                      isConfigured: true,
                    };

                    try {
                      await setDoc(doc(db, 'settings', 'admin_auth'), updatedConfig);
                    } catch (err) {
                      console.warn('Firestore setDoc admin_auth notice:', err);
                    }

                    localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, JSON.stringify(updatedConfig));

                    setSecurityMessage('✅ Votre mot de passe administrateur a été mis à jour avec succès !');
                    setCurrentAdminPassword('');
                    setNewAdminPassword('');
                    setConfirmAdminPassword('');
                    setTimeout(() => setSecurityMessage(null), 5000);
                  } catch (err: any) {
                    setSecurityError(`Erreur lors de la mise à jour : ${err?.message || 'Vérifiez votre connexion internet.'}`);
                  } finally {
                    setIsUpdatingPassword(false);
                  }
                }}
                className="space-y-4 max-w-lg"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <div className="space-y-1">
                  <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                    Mot de Passe Actuel (Obligatoire)
                  </label>
                  <input
                    type="password"
                    required
                    value={currentAdminPassword}
                    onChange={(e) => {
                      setCurrentAdminPassword(e.target.value);
                      setSecurityError(null);
                    }}
                    placeholder="Votre mot de passe actuel"
                    className="w-full bg-[#FAF8F5] border border-[#E5DDD2] rounded-2xl px-4 py-3 text-xs text-[#181512]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                    Nouveau Mot de Passe (Min. 6 caractères)
                  </label>
                  <input
                    type="password"
                    required
                    value={newAdminPassword}
                    onChange={(e) => {
                      setNewAdminPassword(e.target.value);
                      setSecurityError(null);
                    }}
                    placeholder="Min. 6 caractères"
                    className="w-full bg-[#FAF8F5] border border-[#E5DDD2] rounded-2xl px-4 py-3 text-xs text-[#181512]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                    Confirmer le Nouveau Mot de Passe
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmAdminPassword}
                    onChange={(e) => {
                      setConfirmAdminPassword(e.target.value);
                      setSecurityError(null);
                    }}
                    placeholder="Retapez votre nouveau mot de passe"
                    className="w-full bg-[#FAF8F5] border border-[#E5DDD2] rounded-2xl px-4 py-3 text-xs text-[#181512]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="px-8 py-3.5 bg-[#181512] hover:bg-[#2C2621] text-white rounded-2xl text-xs font-bold uppercase tracking-[0.18em] shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isUpdatingPassword ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 7: BACKUP & RESTORE */}
        {activeAdminTab === 'backup' && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-9 rounded-3xl border border-[#E5DDD2] shadow-sm space-y-6">
              <h2 className="font-cinzel text-xl font-bold text-[#181512] flex items-center gap-2">
                <Save className="w-5 h-5 text-[#C5A880]" />
                <span>Sauvegarde & Restauration des Données</span>
              </h2>

              <p className="text-xs text-[#6B5F54] leading-relaxed">
                Exportez l'ensemble de votre catalogue, de vos créations et de vos réglages au format JSON pour conserver une copie locale sécurisée, ou restaurez le catalogue de démonstration.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-[#FAF8F5] border border-[#E5DDD2] space-y-3">
                  <h3 className="font-cinzel text-sm font-bold text-[#181512]">
                    Exporter la sauvegarde
                  </h3>
                  <p className="text-[11px] text-[#8C7A6B]">
                    Téléchargez un fichier JSON contenant tout votre contenu atelier.
                  </p>
                  <button
                    onClick={() => {
                      const dataStr = exportDataJson();
                      const blob = new Blob([dataStr], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `atelier-digital-backup-${new Date().toISOString().split('T')[0]}.json`;
                      a.click();
                      triggerSuccess('Sauvegarde téléchargée avec succès !');
                    }}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-[#181512] text-white rounded-2xl text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs"
                  >
                    <Download className="w-4 h-4 text-[#C5A880]" />
                    <span>Télécharger la Sauvegarde (.JSON)</span>
                  </button>
                </div>

                <div className="p-6 rounded-3xl bg-[#FAF8F5] border border-[#E5DDD2] space-y-3">
                  <h3 className="font-cinzel text-sm font-bold text-[#181512]">
                    Réinitialiser l'Atelier
                  </h3>
                  <p className="text-[11px] text-[#8C7A6B]">
                    Restaurer le catalogue haute couture d'origine par défaut.
                  </p>
                  <button
                    onClick={() => {
                      if (confirm('Attention : toutes les modifications personnalisées seront réinitialisées. Continuer ?')) {
                        resetToDefaults();
                        triggerSuccess('Catalogue haute couture d’origine restauré.');
                      }
                    }}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-rose-800 hover:bg-rose-900 text-white rounded-2xl text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Restaurer le Catalogue d'Origine</span>
                  </button>
                </div>
              </div>

              {/* Import JSON */}
              <div className="pt-4 border-t border-[#F0EAE1] space-y-3">
                <h3 className="font-cinzel text-sm font-bold text-[#181512]">
                  Importer une Sauvegarde JSON
                </h3>
                <textarea
                  rows={4}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder="Collez ici le contenu de votre fichier JSON de sauvegarde..."
                  className="w-full bg-[#FAF8F5] border border-[#E5DDD2] rounded-2xl p-4 text-xs text-[#181512] font-mono"
                />
                <button
                  onClick={() => {
                    if (importJsonText.trim()) {
                      const success = importDataJson(importJsonText);
                      if (success) {
                        triggerSuccess('Sauvegarde importée avec succès !');
                        setImportJsonText('');
                      } else {
                        alert('Erreur lors de la lecture du JSON. Vérifiez le format.');
                      }
                    }
                  }}
                  className="px-6 py-3 bg-[#181512] hover:bg-[#2C2621] text-white rounded-2xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Appliquer la Sauvegarde
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
