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
  Play
} from 'lucide-react';
import { generateWhatsAppLink } from '../data/initialData';
import { VanessaQuickAddModal } from './VanessaQuickAddModal';
import { AdminAuthScreen } from './AdminAuthScreen';
import { auth, signOut } from '../lib/firebase';

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
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [securityMessage, setSecurityMessage] = useState<string | null>(null);
  const [securityError, setSecurityError] = useState<string | null>(null);

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

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Firebase sign out note:', e);
    }
    localStorage.removeItem('maison_vans_admin_session');
    localStorage.removeItem('maison_vans_admin_auth');
    localStorage.removeItem('maison_vans_atelier_data_v1_admin_auth');
    setAdminAuthenticated(false);
    setActiveTab('home');
  };

  // Helper for image upload (Base64 Data URL)
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          callback(reader.result);
          triggerSuccess('Image chargée avec succès !');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Creation Submit Handler
  const handleSaveCreation = (e: React.FormEvent) => {
    e.preventDefault();
    const targetOccasion = occasions.find(o => o.name === creationForm.occasionName) || occasions[0];

    const creationData = {
      title: creationForm.title,
      subtitle: creationForm.subtitle,
      description: creationForm.description,
      longDescription: creationForm.longDescription || creationForm.description,
      categories: creationForm.categories.split(',').map(s => s.trim()).filter(Boolean),
      occasionId: targetOccasion?.id || 'occ-custom',
      occasionName: targetOccasion?.name || creationForm.occasionName,
      colors: creationForm.colors.split(',').map(s => s.trim()).filter(Boolean),
      fabrics: creationForm.fabrics.split(',').map(s => s.trim()).filter(Boolean),
      silhouette: creationForm.silhouette,
      coutureLine: creationForm.coutureLine,
      fittingDetails: creationForm.fittingDetails,
      images: creationForm.images.filter(Boolean),
      videoUrl: creationForm.videoUrl.trim() || undefined,
      priceEstimate: creationForm.priceEstimate,
      preparationTime: creationForm.preparationTime,
      isAvailable: creationForm.isAvailable,
      availabilityBadge: creationForm.availabilityBadge,
      customOptions: creationForm.customOptions.split(',').map(s => s.trim()).filter(Boolean),
      isFeatured: creationForm.isFeatured,
      misEnAvant: creationForm.isFeatured,
    };

    if (editingCreationId) {
      updateCreation(editingCreationId, creationData);
      triggerSuccess(`La création "${creationForm.title}" a été mise à jour.`);
    } else {
      addCreation(creationData);
      triggerSuccess(`Nouvelle création "${creationForm.title}" ajoutée au catalogue !`);
    }

    setEditingCreationId(null);
    // Reset form
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

  const handleEditCreationClick = (creation: Creation) => {
    setEditingCreationId(creation.id);
    setCreationForm({
      title: creation.title,
      subtitle: creation.subtitle || '',
      description: creation.description,
      longDescription: creation.longDescription || creation.description,
      occasionName: creation.occasionName,
      categories: creation.categories.join(', '),
      colors: creation.colors.join(', '),
      fabrics: creation.fabrics.join(', '),
      silhouette: creation.silhouette,
      coutureLine: creation.coutureLine || 'Ligne Gala & Tapis Rouge',
      fittingDetails: creation.fittingDetails || '2 séances privées d’essayage à l’Atelier de Kinshasa ou visioconférence guidée pour la Diaspora',
      images: creation.images.length > 0 ? creation.images : [''],
      videoUrl: creation.videoUrl || '',
      priceEstimate: creation.priceEstimate || '',
      preparationTime: creation.preparationTime || '',
      isAvailable: creation.isAvailable,
      availabilityBadge: creation.availabilityBadge,
      customOptions: creation.customOptions?.join(', ') || '',
      isFeatured: creation.isFeatured || false,
    });
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Inspiration Submit Handler
  const handleSaveInspiration = (e: React.FormEvent) => {
    e.preventDefault();
    const inspData = {
      title: inspirationForm.title,
      description: inspirationForm.description,
      imageUrl: inspirationForm.imageUrl,
      category: inspirationForm.category,
      occasion: inspirationForm.occasion,
      colors: inspirationForm.colors.split(',').map(s => s.trim()).filter(Boolean),
      styleTags: inspirationForm.styleTags.split(',').map(s => s.trim()).filter(Boolean),
      isOriginalCreation: inspirationForm.isOriginalCreation,
      sourceAuthor: inspirationForm.sourceAuthor,
      sourceNotes: inspirationForm.sourceNotes,
    };

    if (editingInspirationId) {
      updateInspiration(editingInspirationId, inspData);
      triggerSuccess('Inspiration mise à jour avec succès !');
    } else {
      addInspiration(inspData);
      triggerSuccess('Nouvelle inspiration ajoutée au carnet !');
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
    const occData = {
      name: occasionForm.name,
      description: occasionForm.description,
      coverImage: occasionForm.coverImage,
      displayOrder: Number(occasionForm.displayOrder) || 1,
    };

    if (editingOccasionId) {
      updateOccasion(editingOccasionId, occData);
      triggerSuccess('Occasion mise à jour !');
    } else {
      addOccasion(occData);
      triggerSuccess(`Nouvelle occasion "${occasionForm.name}" ajoutée !`);
    }

    setEditingOccasionId(null);
    setOccasionForm({
      name: '',
      description: '',
      coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
      displayOrder: 1,
    });
  };

  // Testimonial Submit Handler
  const handleSaveTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    const testData = {
      clientName: testimonialForm.clientName,
      eventType: testimonialForm.eventType,
      feedback: testimonialForm.feedback,
      rating: Number(testimonialForm.rating) || 5,
      date: testimonialForm.date,
      creationName: testimonialForm.creationName,
      clientPhotoUrl: testimonialForm.clientPhotoUrl,
      isVisible: testimonialForm.isVisible,
    };

    if (editingTestimonialId) {
      updateTestimonial(editingTestimonialId, testData);
      triggerSuccess('Avis client mis à jour !');
    } else {
      addTestimonial(testData);
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

  return (
    <section id="admin-panel-dashboard" className="py-16 sm:py-20 bg-[#FAF8F5] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Bar with Active Admin Session Badge */}
        <div className="bg-[#181512] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-[#2E2822]">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A880]/20 text-[#E5D5C3] text-xs font-bold uppercase tracking-wider border border-[#C5A880]/30">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Back-Office Couturière Sécurisé</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h1 className="font-cinzel text-2xl sm:text-3xl font-bold tracking-wide text-[#FAF8F5]">
              Gestion de l'Atelier Digital
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-[#D8CFC4]">
              <span className="flex items-center gap-1 text-[#C5A880]">
                <UserCheck className="w-3.5 h-3.5" />
                <span>{settings.designerName || 'Vanessa Kaniki'}</span>
              </span>
              <span className="text-[#6A5E52]">•</span>
              <span className="text-[#A89C8F]">{settings.email || 'mutangilwaivan@gmail.com'}</span>
              <span className="text-[#6A5E52]">•</span>
              <span className="text-emerald-400 font-medium">Session Active (Standards 2026)</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('home')}
              className="px-4 py-2.5 rounded-xl bg-[#2C2723] hover:bg-[#3D3630] text-xs font-bold uppercase tracking-wider text-[#FAF8F5] transition-colors border border-[#3D352E] cursor-pointer"
            >
              Voir le Site Public
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-200 border border-rose-800/60 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Fermer la session d'administration"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in">
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-white rounded-2xl border border-[#E8E1D7] shadow-sm">
          <button
            onClick={() => setActiveAdminTab('creations')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeAdminTab === 'creations' ? 'bg-[#181512] text-white shadow-sm' : 'text-[#5C5248] hover:bg-[#FAF8F5]'
            }`}
          >
            <Shirt className="w-4 h-4 text-[#C5A880]" />
            <span>Créations ({creations.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('inspirations')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeAdminTab === 'inspirations' ? 'bg-[#181512] text-white shadow-sm' : 'text-[#5C5248] hover:bg-[#FAF8F5]'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-[#C5A880]" />
            <span>Inspirations ({inspirations.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('occasions')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeAdminTab === 'occasions' ? 'bg-[#181512] text-white shadow-sm' : 'text-[#5C5248] hover:bg-[#FAF8F5]'
            }`}
          >
            <Calendar className="w-4 h-4 text-[#C5A880]" />
            <span>Occasions ({occasions.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('testimonials')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeAdminTab === 'testimonials' ? 'bg-[#181512] text-white shadow-sm' : 'text-[#5C5248] hover:bg-[#FAF8F5]'
            }`}
          >
            <Star className="w-4 h-4 text-[#C5A880]" />
            <span>Avis Clientes ({testimonials.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('share-tool')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeAdminTab === 'share-tool' ? 'bg-[#181512] text-white shadow-sm' : 'text-[#5C5248] hover:bg-[#FAF8F5]'
            }`}
          >
            <Share2 className="w-4 h-4 text-[#25D366]" />
            <span>Outil Partage WhatsApp</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('settings')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeAdminTab === 'settings' ? 'bg-[#181512] text-white shadow-sm' : 'text-[#5C5248] hover:bg-[#FAF8F5]'
            }`}
          >
            <Settings className="w-4 h-4 text-[#C5A880]" />
            <span>Paramètres Atelier</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('backup')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeAdminTab === 'backup' ? 'bg-[#181512] text-white shadow-sm' : 'text-[#5C5248] hover:bg-[#FAF8F5]'
            }`}
          >
            <Save className="w-4 h-4 text-[#C5A880]" />
            <span>Sauvegarde</span>
          </button>
        </div>

        {/* TAB 1: CREATIONS MANAGEMENT */}
        {activeAdminTab === 'creations' && (
          <div className="space-y-8">
            
            {/* Mode Switcher for Creation Form: Simple Mode (Default for Vanessa) vs Full Form */}
            {!editingCreationId && (
              <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-[#E8E1D7] shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#181512]">Mode d'ajout :</span>
                  <span className="text-[11px] text-[#8C7A6B]">
                    {creationFormMode === 'simple' ? '✨ Mode Simple Vanessa (3 étapes rapides)' : '🛠️ Mode Complet Détaillé'}
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-[#E0D7CC]">
                  <button
                    type="button"
                    onClick={() => setCreationFormMode('simple')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
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
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E1D7] shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-[#F2ECE4] pb-4">
                <h2 className="font-cinzel text-xl font-bold text-[#1E1B18] flex items-center gap-2">
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
                        images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85'],
                        priceEstimate: 'Sur devis (Dès 750€)',
                        preparationTime: '3 à 5 semaines',
                        isAvailable: true,
                        availabilityBadge: 'Sur commande',
                        customOptions: 'Ajustement de la traîne, Choix des manches',
                        isFeatured: false,
                      });
                    }}
                    className="text-xs text-rose-600 font-semibold"
                  >
                    Annuler l'édition
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveCreation} className="space-y-5">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                      Nom de la Création *
                    </label>
                    <input
                      type="text"
                      required
                      value={creationForm.title}
                      onChange={(e) => setCreationForm({ ...creationForm, title: e.target.value })}
                      placeholder="Ex: Robe Impériale AURA"
                      className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2 text-xs text-[#1E1B18] focus:border-[#C5A880] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                      Sous-titre / Signature
                    </label>
                    <input
                      type="text"
                      value={creationForm.subtitle}
                      onChange={(e) => setCreationForm({ ...creationForm, subtitle: e.target.value })}
                      placeholder="Ex: Drapé sculptural & traîne majestueuse"
                      className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2 text-xs text-[#1E1B18] focus:border-[#C5A880] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                      Occasion / Collection
                    </label>
                    <select
                      value={creationForm.occasionName}
                      onChange={(e) => setCreationForm({ ...creationForm, occasionName: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3 py-2 text-xs text-[#1E1B18] focus:border-[#C5A880] focus:outline-none"
                    >
                      {occasions.map(occ => (
                        <option key={occ.id} value={occ.name}>{occ.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                      Disponibilité
                    </label>
                    <select
                      value={creationForm.availabilityBadge}
                      onChange={(e) => setCreationForm({ 
                        ...creationForm, 
                        availabilityBadge: e.target.value as any,
                        isAvailable: e.target.value !== 'En confection'
                      })}
                      className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3 py-2 text-xs text-[#1E1B18] focus:border-[#C5A880] focus:outline-none"
                    >
                      <option value="Sur commande">Sur commande</option>
                      <option value="Pièce unique disponible">Pièce unique disponible</option>
                      <option value="En confection">En confection</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                      Silhouette / Coupe
                    </label>
                    <input
                      type="text"
                      value={creationForm.silhouette}
                      onChange={(e) => setCreationForm({ ...creationForm, silhouette: e.target.value })}
                      placeholder="Ex: Fourreau sirène avec fente"
                      className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2 text-xs text-[#1E1B18] focus:border-[#C5A880] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                      Tissus & Étoffes (séparés par des virgules)
                    </label>
                    <input
                      type="text"
                      value={creationForm.fabrics}
                      onChange={(e) => setCreationForm({ ...creationForm, fabrics: e.target.value })}
                      placeholder="Ex: Soie sauvage moirée, Organza plissé"
                      className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2 text-xs text-[#1E1B18] focus:border-[#C5A880] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                      Couleurs présentées (séparées par des virgules)
                    </label>
                    <input
                      type="text"
                      value={creationForm.colors}
                      onChange={(e) => setCreationForm({ ...creationForm, colors: e.target.value })}
                      placeholder="Ex: Noir Profond, Bleu Saphir"
                      className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2 text-xs text-[#1E1B18] focus:border-[#C5A880] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                      Estimation Tarifaire (Optionnel)
                    </label>
                    <input
                      type="text"
                      value={creationForm.priceEstimate}
                      onChange={(e) => setCreationForm({ ...creationForm, priceEstimate: e.target.value })}
                      placeholder="Ex: Sur devis (Dès 850€)"
                      className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2 text-xs text-[#1E1B18] focus:border-[#C5A880] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                      Délai de Confection estimé
                    </label>
                    <input
                      type="text"
                      value={creationForm.preparationTime}
                      onChange={(e) => setCreationForm({ ...creationForm, preparationTime: e.target.value })}
                      placeholder="Ex: 4 à 6 semaines"
                      className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2 text-xs text-[#1E1B18] focus:border-[#C5A880] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                      Ligne & Prestige Haute Couture
                    </label>
                    <input
                      type="text"
                      value={creationForm.coutureLine}
                      onChange={(e) => setCreationForm({ ...creationForm, coutureLine: e.target.value })}
                      placeholder="Ex: Ligne Gala & Tapis Rouge / Ligne Mariée Royale"
                      className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2 text-xs text-[#1E1B18] focus:border-[#C5A880] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                      Protocole d'Essayages & Accompagnement
                    </label>
                    <input
                      type="text"
                      value={creationForm.fittingDetails}
                      onChange={(e) => setCreationForm({ ...creationForm, fittingDetails: e.target.value })}
                      placeholder="Ex: 2 séances privées d’essayage à l’Atelier de Kinshasa ou visio"
                      className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2 text-xs text-[#1E1B18] focus:border-[#C5A880] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                    Description Courte (Catalogue)
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={creationForm.description}
                    onChange={(e) => setCreationForm({ ...creationForm, description: e.target.value })}
                    placeholder="Description concise pour la carte..."
                    className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl p-3 text-xs text-[#1E1B18] focus:border-[#C5A880] focus:outline-none"
                  />
                </div>

                {/* Photos & Image Upload */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                    Photos de la création (URLs ou Import depuis votre appareil)
                  </label>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-[#EFEAE2] hover:bg-[#E4DCCF] text-[#1E1B18] rounded-xl text-xs font-bold uppercase tracking-wider transition-colors">
                      <Upload className="w-4 h-4 text-[#C5A880]" />
                      <span>Charger une photo depuis votre appareil</span>
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

                  {/* Image URLs input */}
                  <div className="space-y-2 pt-2">
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
                          className="flex-1 bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3 py-1.5 text-xs text-[#1E1B18]"
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
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setCreationForm({ ...creationForm, images: [...creationForm.images, ''] })}
                      className="text-xs text-[#9E7D53] hover:underline font-semibold"
                    >
                      + Ajouter une URL de photo supplémentaire
                    </button>
                  </div>
                </div>

                {/* Video URL or Upload */}
                <div className="space-y-2 pt-2 border-t border-[#F2ECE4]">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                      🎬 Vidéo / Défilé de la création (Optionnel)
                    </label>
                    <span className="text-[10px] text-[#8C7A6B] bg-[#FAF8F5] px-2 py-0.5 rounded-full border border-[#E0D7CC]">
                      WhatsApp Status / Vidéo HD
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <input
                      type="text"
                      value={creationForm.videoUrl}
                      onChange={(e) => setCreationForm({ ...creationForm, videoUrl: e.target.value })}
                      placeholder="URL vidéo directe (.mp4) ou laissez vide"
                      className="flex-1 w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3 py-2 text-xs text-[#1E1B18]"
                    />
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#EFEAE2] hover:bg-[#E4DCCF] text-[#1E1B18] rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shrink-0">
                      <Upload className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>Fichier Vidéo</span>
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
                                setCreationForm({ ...creationForm, videoUrl: reader.result });
                                triggerSuccess('Vidéo chargée avec succès !');
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                  {creationForm.videoUrl && (
                    <div className="flex items-center justify-between p-2.5 bg-[#FAF8F5] rounded-xl border border-[#E0D7CC] text-xs">
                      <span className="text-emerald-700 font-medium truncate">✓ Vidéo configurée</span>
                      <button
                        type="button"
                        onClick={() => setCreationForm({ ...creationForm, videoUrl: '' })}
                        className="text-rose-600 font-bold hover:underline"
                      >
                        Retirer
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="feat-checkbox"
                    checked={creationForm.isFeatured}
                    onChange={(e) => setCreationForm({ ...creationForm, isFeatured: e.target.checked })}
                    className="rounded border-[#E0D7CC] text-[#C5A880] focus:ring-[#C5A880]"
                  />
                  <label htmlFor="feat-checkbox" className="text-xs font-semibold text-[#1E1B18]">
                    Mettre en avant comme pièce signature / phare
                  </label>
                </div>

                <div className="pt-4 border-t border-[#F2ECE4]">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3 bg-[#181512] hover:bg-[#2C2723] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-colors"
                  >
                    {editingCreationId ? 'Enregistrer les Modifications' : 'Publier cette Création'}
                  </button>
                </div>

              </form>
            </div>
            )}

            {/* List of existing creations */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E1D7] shadow-sm space-y-4">
              <h3 className="font-cinzel text-lg font-bold text-[#1E1B18]">
                Catalogue Actuel ({creations.length} pièces)
              </h3>

              <div className="grid grid-cols-1 gap-3">
                {creations.map(c => (
                  <div
                    key={c.id}
                    className="p-4 rounded-2xl border border-[#EAE3DA] bg-[#FAF8F5] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={c.images[0]}
                        alt={c.title}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-xl object-cover border border-[#E0D7CC] shrink-0"
                      />
                      <div>
                        <h4 className="font-cinzel text-sm font-bold text-[#1E1B18]">
                          {c.title}
                        </h4>
                        <span className="text-[11px] text-[#8C7A6B] block">
                          {c.occasionName} • {c.silhouette}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-[#9E7D53] font-semibold">
                            Statut : {c.availabilityBadge}
                          </span>
                          {c.videoUrl && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 bg-[#6E2333] text-white rounded-sm uppercase">
                              <Play className="w-2 h-2 fill-current" />
                              <span>Vidéo</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setFeaturedCreation(c.id);
                          triggerSuccess(`"${c.title}" est maintenant le Projet à la une (misEnAvant: true).`);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          (c.misEnAvant || c.isFeatured) 
                            ? 'bg-[#6E2333] text-white shadow-xs' 
                            : 'bg-white hover:bg-[#FAF8F5] text-[#5C5248] border border-[#E0D7CC]'
                        }`}
                        title="Définir comme Projet à la une (misEnAvant: true)"
                      >
                        <Star className={`w-3.5 h-3.5 ${(c.misEnAvant || c.isFeatured) ? 'fill-current text-[#C5A880]' : ''}`} />
                        <span>{(c.misEnAvant || c.isFeatured) ? 'À la une (Firestore)' : 'Mettre à la une'}</span>
                      </button>

                      <button
                        onClick={() => toggleCreationAvailability(c.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          c.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-700'
                        }`}
                        title="Activer ou désactiver"
                      >
                        {c.isAvailable ? 'Disponible' : 'Indisponible'}
                      </button>

                      <button
                        onClick={() => setSelectedCreationForDetail(c)}
                        className="p-2 bg-white hover:bg-[#FAF8F5] text-[#8C7A6B] hover:text-[#1E1B18] rounded-lg border border-[#E0D7CC]"
                        title="Ouvrir la fiche produit immersive"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleEditCreationClick(c)}
                        className="p-2 bg-white hover:bg-[#EFEAE2] text-[#1E1B18] rounded-lg border border-[#E0D7CC]"
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
                        className="p-2 bg-white hover:bg-rose-50 text-rose-600 rounded-lg border border-rose-200"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: INSPIRATIONS MANAGEMENT */}
        {activeAdminTab === 'inspirations' && (
          <div className="space-y-8">
            
            {/* Guide Plateformes & Sources d'Inspiration */}
            <div className="p-5 rounded-3xl bg-gradient-to-r from-[#181512] to-[#2C2723] text-white border border-[#3D352E] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A880]/20 text-[#C5A880] text-[11px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Sources & Plateformes de Modèles</span>
                </div>
                <h3 className="font-cinzel text-base font-bold text-[#FAF8F5]">
                  Où dénicher et poster vos modèles d'inspiration ?
                </h3>
                <p className="text-xs text-[#D8CFC4] max-w-2xl leading-relaxed">
                  <strong>Pinterest</strong> (recherche de coupes et traînes), <strong>Instagram</strong> (comptes de défilés & créateurs africains/internationaux), <strong>Vogue Runway</strong> (haute couture) ou <strong>TikTok</strong> (vidéos de tombé de tissus). Vous pouvez importer ces modèles ici pour proposer des réinterprétations sur-mesure à vos clientes !
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-[#E5D5C3] border border-white/10 font-medium">📌 Pinterest</span>
                <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-[#E5D5C3] border border-white/10 font-medium">📸 Instagram</span>
                <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-[#E5D5C3] border border-white/10 font-medium">✨ Défilés</span>
              </div>
            </div>

            {/* Add Inspiration Form */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E1D7] shadow-sm space-y-6">
              <h2 className="font-cinzel text-xl font-bold text-[#1E1B18] flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-[#C5A880]" />
                <span>{editingInspirationId ? 'Modifier l’Inspiration' : 'Ajouter une Inspiration / Tendance'}</span>
              </h2>

              <form onSubmit={handleSaveInspiration} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                      Titre du Style / Modèle *
                    </label>
                    <input
                      type="text"
                      required
                      value={inspirationForm.title}
                      onChange={(e) => setInspirationForm({ ...inspirationForm, title: e.target.value })}
                      placeholder="Ex: Drapé Sculptural Haute Couture"
                      className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2 text-xs text-[#1E1B18] focus:border-[#C5A880] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                      Occasion / Style
                    </label>
                    <select
                      value={inspirationForm.occasion}
                      onChange={(e) => setInspirationForm({ ...inspirationForm, occasion: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3 py-2 text-xs text-[#1E1B18] focus:border-[#C5A880] focus:outline-none"
                    >
                      {occasions.map(occ => (
                        <option key={occ.id} value={occ.name}>{occ.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* MANDATORY BADGE SELECTOR: Original vs External */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E0D7CC] space-y-2">
                  <label className="text-xs font-bold text-[#1E1B18] block">
                    Statut de l'image (Obligatoire pour la transparence client) :
                  </label>
                  <div className="flex flex-wrap gap-3">
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
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                      Source ou Auteur
                    </label>
                    <input
                      type="text"
                      value={inspirationForm.sourceAuthor}
                      onChange={(e) => setInspirationForm({ ...inspirationForm, sourceAuthor: e.target.value })}
                      placeholder="Ex: Pinterest / Défilé Milan 2026"
                      className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2 text-xs text-[#1E1B18] focus:border-[#C5A880] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                      Tags de Style (séparés par des virgules)
                    </label>
                    <input
                      type="text"
                      value={inspirationForm.styleTags}
                      onChange={(e) => setInspirationForm({ ...inspirationForm, styleTags: e.target.value })}
                      placeholder="Ex: Sculptural, Dos Nu, Minimaliste"
                      className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2 text-xs text-[#1E1B18] focus:border-[#C5A880] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                    Description du Style
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={inspirationForm.description}
                    onChange={(e) => setInspirationForm({ ...inspirationForm, description: e.target.value })}
                    placeholder="Description de la coupe et des spécificités..."
                    className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl p-3 text-xs text-[#1E1B18] focus:border-[#C5A880] focus:outline-none"
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                    Photo d'Inspiration
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-[#EFEAE2] hover:bg-[#E4DCCF] text-[#1E1B18] rounded-xl text-xs font-bold uppercase tracking-wider">
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
                      className="flex-1 bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3 py-2 text-xs text-[#1E1B18]"
                    />
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#181512] hover:bg-[#2C2723] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md"
                  >
                    {editingInspirationId ? 'Enregistrer l’Inspiration' : 'Ajouter au Carnet'}
                  </button>
                </div>

              </form>
            </div>

            {/* List of Inspirations */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E1D7] shadow-sm space-y-4">
              <h3 className="font-cinzel text-lg font-bold text-[#1E1B18]">
                Inspirations Actuelles ({inspirations.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {inspirations.map(item => (
                  <div key={item.id} className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#EAE3DA] flex items-center justify-between gap-3">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                    <div className="overflow-hidden flex-1">
                      <h4 className="font-cinzel text-xs font-bold truncate text-[#1E1B18]">{item.title}</h4>
                      <span className="text-[10px] text-[#8C7A6B] block truncate">{item.occasion}</span>
                      <span className="text-[9px] font-bold text-[#9E7D53] block">
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
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
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
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E1D7] shadow-sm space-y-6">
              <h2 className="font-cinzel text-xl font-bold text-[#1E1B18] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#C5A880]" />
                <span>Gérer les Occasions & Catégories d'Événements</span>
              </h2>

              <form onSubmit={handleSaveOccasion} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                      Nom de l'Occasion (Ex: Mariages, Baptêmes, Galas...) *
                    </label>
                    <input
                      type="text"
                      required
                      value={occasionForm.name}
                      onChange={(e) => setOccasionForm({ ...occasionForm, name: e.target.value })}
                      placeholder="Ex: Cérémonies Religieuses"
                      className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2 text-xs text-[#1E1B18]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                      Image de Couverture (URL ou Upload)
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer px-3 py-2 bg-[#EFEAE2] hover:bg-[#E4DCCF] text-[#1E1B18] rounded-xl text-xs font-bold">
                        <Upload className="w-3.5 h-3.5" />
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
                        className="flex-1 bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3 py-2 text-xs text-[#1E1B18]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                    Description de la Collection
                  </label>
                  <textarea
                    rows={2}
                    value={occasionForm.description}
                    onChange={(e) => setOccasionForm({ ...occasionForm, description: e.target.value })}
                    placeholder="Description courte de ce type d'événement..."
                    className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl p-3 text-xs text-[#1E1B18]"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#181512] hover:bg-[#2C2723] text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  {editingOccasionId ? 'Mettre à jour l’Occasion' : 'Créer l’Occasion'}
                </button>
              </form>

              {/* List */}
              <div className="pt-4 border-t border-[#F2ECE4] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C7A6B]">
                  Occasions Actuellement Définies :
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {occasions.map(occ => (
                    <div key={occ.id} className="p-3 rounded-2xl border border-[#EAE3DA] bg-[#FAF8F5] flex items-center justify-between gap-3">
                      <img
                        src={occ.coverImage}
                        alt={occ.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1">
                        <span className="font-cinzel text-xs font-bold text-[#1E1B18] block">{occ.name}</span>
                        <span className="text-[10px] text-[#8C7A6B] line-clamp-1">{occ.description}</span>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm(`Supprimer l'occasion "${occ.name}" ?`)) {
                            deleteOccasion(occ.id);
                            triggerSuccess('Occasion supprimée.');
                          }
                        }}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
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
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E1D7] shadow-sm space-y-6">
              <h2 className="font-cinzel text-xl font-bold text-[#1E1B18] flex items-center gap-2">
                <Star className="w-5 h-5 text-[#C5A880]" />
                <span>Gestion des Avis & Témoignages Clientes</span>
              </h2>

              <form onSubmit={handleSaveTestimonial} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                      Prénom ou Nom de la Cliente *
                    </label>
                    <input
                      type="text"
                      required
                      value={testimonialForm.clientName}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, clientName: e.target.value })}
                      placeholder="Ex: Sarah M."
                      className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2 text-xs text-[#1E1B18]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                      Événement / Pièce Confectionnée
                    </label>
                    <input
                      type="text"
                      value={testimonialForm.eventType}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, eventType: e.target.value })}
                      placeholder="Ex: Mariage (Robe Céleste)"
                      className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2 text-xs text-[#1E1B18]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                      Note (Étoiles)
                    </label>
                    <select
                      value={testimonialForm.rating}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: Number(e.target.value) })}
                      className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3 py-2 text-xs text-[#1E1B18]"
                    >
                      <option value="5">⭐⭐⭐⭐⭐ (5 étoiles)</option>
                      <option value="4">⭐⭐⭐⭐ (4 étoiles)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                    Témoignage de la Cliente *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={testimonialForm.feedback}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, feedback: e.target.value })}
                    placeholder="Ce que la cliente a dit sur la confection, le confort, les essayages..."
                    className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl p-3 text-xs text-[#1E1B18]"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#181512] hover:bg-[#2C2723] text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  {editingTestimonialId ? 'Enregistrer le Témoignage' : 'Publier le Témoignage'}
                </button>
              </form>

              {/* List */}
              <div className="pt-4 border-t border-[#F2ECE4] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C7A6B]">
                  Avis Existants :
                </h4>
                <div className="space-y-2">
                  {testimonials.map(t => (
                    <div key={t.id} className="p-4 rounded-2xl border border-[#EAE3DA] bg-[#FAF8F5] flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#1E1B18]">{t.clientName}</span>
                          <span className="text-[11px] text-[#8C7A6B]">({t.eventType})</span>
                          <span className="text-amber-500 text-xs">{'★'.repeat(t.rating)}</span>
                        </div>
                        <p className="text-xs text-[#5C5248] italic line-clamp-1 mt-0.5">« {t.feedback} »</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleTestimonialVisibility(t.id)}
                          className={`p-2 rounded-lg text-xs font-semibold ${
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
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
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

        {/* TAB 5: FAST SHARE TOOL FOR WHATSAPP (PERSONA REQUIREMENT) */}
        {activeAdminTab === 'share-tool' && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E1D7] shadow-sm space-y-6">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#25D366]/20 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>Générateur de Partage Express WhatsApp</span>
                </div>
                <h2 className="font-cinzel text-xl font-bold text-[#1E1B18]">
                  Partager une Création ou Inspiration en 1 Clic
                </h2>
                <p className="text-xs text-[#6B5F54]">
                  Cet outil vous permet de générer un message WhatsApp professionnel et prêt à l'envoi pour présenter une pièce à une cliente ou la poster sur votre statut WhatsApp.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                    Que souhaitez-vous partager ?
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedShareItemType('creation');
                        setSelectedShareItemId(creations[0]?.id || '');
                      }}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase ${
                        selectedShareItemType === 'creation' ? 'bg-[#181512] text-white' : 'bg-[#FAF8F5] text-[#5C5248]'
                      }`}
                    >
                      Une Création de l'Atelier
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedShareItemType('inspiration');
                        setSelectedShareItemId(inspirations[0]?.id || '');
                      }}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase ${
                        selectedShareItemType === 'inspiration' ? 'bg-[#181512] text-white' : 'bg-[#FAF8F5] text-[#5C5248]'
                      }`}
                    >
                      Une Inspiration Moodboard
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                    Choisir le modèle
                  </label>
                  <select
                    value={selectedShareItemId}
                    onChange={(e) => setSelectedShareItemId(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3 py-2 text-xs text-[#1E1B18]"
                  >
                    {selectedShareItemType === 'creation' 
                      ? creations.map(c => <option key={c.id} value={c.id}>{c.title} ({c.occasionName})</option>)
                      : inspirations.map(i => <option key={i.id} value={i.id}>{i.title} ({i.occasion})</option>)
                    }
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                  Prénom de la cliente destinataire (Optionnel)
                </label>
                <input
                  type="text"
                  value={customShareRecipient}
                  onChange={(e) => setCustomShareRecipient(e.target.value)}
                  placeholder="Ex: Sophie"
                  className="w-full sm:w-80 bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2 text-xs text-[#1E1B18]"
                />
              </div>

              {/* Message Preview Box */}
              <div className="p-4 rounded-2xl bg-[#181512] text-[#FAF8F5] space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#C5A880] tracking-wider block">
                  Aperçu du message WhatsApp généré :
                </span>
                <pre className="text-xs font-sans whitespace-pre-wrap text-[#D8CFC4] bg-[#221E1A] p-4 rounded-xl border border-[#3A332C]">
                  {shareText}
                </pre>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleWhatsAppShare}
                  className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Envoyer sur WhatsApp</span>
                </button>

                <button
                  onClick={handleCopyShare}
                  className="inline-flex items-center gap-2 bg-[#EFEAE2] hover:bg-[#E4DCCF] text-[#1E1B18] px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  {copiedShareText ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                  <span>{copiedShareText ? 'Texte copié !' : 'Copier le texte'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SETTINGS & HERO SLIDER CUSTOMIZER */}
        {activeAdminTab === 'settings' && (
          <div className="space-y-8">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E1D7] shadow-sm space-y-6">
              <h2 className="font-cinzel text-xl font-bold text-[#1E1B18] flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#C5A880]" />
                <span>Coordonnées & Textes Généraux de l'Atelier</span>
              </h2>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                      Nom de la Maison / Atelier *
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.studioName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, studioName: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2 text-xs text-[#1E1B18]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                      Nom de la Modéliste-Couturière *
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.designerName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, designerName: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2 text-xs text-[#1E1B18]"
                    />
                  </div>
                </div>

                {/* CRITICAL: WhatsApp Number */}
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-2">
                  <label className="text-xs font-bold text-emerald-950 block flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-700 fill-current" />
                    <span>Numéro WhatsApp de Conversion (Mise à jour globale) *</span>
                  </label>
                  <p className="text-[11px] text-emerald-800">
                    Ce numéro est utilisé pour tous les boutons "Commander sur WhatsApp", le bouton flottant et les demandes d'inspirations.
                  </p>
                  <input
                    type="text"
                    required
                    value={settingsForm.whatsappNumber}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                    placeholder="+33658921473"
                    className="w-full bg-white border border-emerald-300 rounded-xl px-4 py-2 text-xs font-bold text-emerald-950"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                      Années d'Expérience
                    </label>
                    <input
                      type="number"
                      value={settingsForm.experienceYears}
                      onChange={(e) => setSettingsForm({ ...settingsForm, experienceYears: Number(e.target.value) })}
                      className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3 py-2 text-xs text-[#1E1B18]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                      Créations Réalisées
                    </label>
                    <input
                      type="number"
                      value={settingsForm.creationsCount}
                      onChange={(e) => setSettingsForm({ ...settingsForm, creationsCount: Number(e.target.value) })}
                      className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3 py-2 text-xs text-[#1E1B18]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                      Instagram
                    </label>
                    <input
                      type="text"
                      value={settingsForm.instagram}
                      onChange={(e) => setSettingsForm({ ...settingsForm, instagram: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3 py-2 text-xs text-[#1E1B18]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                      Adresse de l'Atelier
                    </label>
                    <input
                      type="text"
                      value={settingsForm.address}
                      onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2 text-xs text-[#1E1B18]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                      Horaires d'Ouverture
                    </label>
                    <input
                      type="text"
                      value={settingsForm.openingHours}
                      onChange={(e) => setSettingsForm({ ...settingsForm, openingHours: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2 text-xs text-[#1E1B18]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                    Biographie de la Couturière
                  </label>
                  <textarea
                    rows={3}
                    value={settingsForm.bio}
                    onChange={(e) => setSettingsForm({ ...settingsForm, bio: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl p-3 text-xs text-[#1E1B18]"
                  />
                </div>

                {/* Hero Slides Management */}
                <div className="pt-4 border-t border-[#F2ECE4] space-y-4">
                  <h3 className="font-cinzel text-base font-bold text-[#1E1B18] flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#C5A880]" />
                    <span>Images & Textes du Défilement Hero (Première Section)</span>
                  </h3>

                  <div className="space-y-4">
                    {settingsForm.heroSlides.map((slide, idx) => (
                      <div key={slide.id} className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E0D7CC] space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#1E1B18]">Slide {idx + 1}</span>
                          <span className="text-[10px] text-[#8C7A6B] uppercase">{slide.editionTag}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] uppercase font-bold text-[#8C7A6B] block mb-0.5">Titre</label>
                            <input
                              type="text"
                              value={slide.title}
                              onChange={(e) => {
                                const next = [...settingsForm.heroSlides];
                                next[idx] = { ...slide, title: e.target.value };
                                setSettingsForm({ ...settingsForm, heroSlides: next });
                              }}
                              className="w-full bg-white border border-[#E0D7CC] rounded-lg px-2.5 py-1.5 text-xs"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] uppercase font-bold text-[#8C7A6B] block mb-0.5">Sous-titre</label>
                            <input
                              type="text"
                              value={slide.subtitle}
                              onChange={(e) => {
                                const next = [...settingsForm.heroSlides];
                                next[idx] = { ...slide, subtitle: e.target.value };
                                setSettingsForm({ ...settingsForm, heroSlides: next });
                              }}
                              className="w-full bg-white border border-[#E0D7CC] rounded-lg px-2.5 py-1.5 text-xs"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={slide.imageUrl}
                            onChange={(e) => {
                              const next = [...settingsForm.heroSlides];
                              next[idx] = { ...slide, imageUrl: e.target.value };
                              setSettingsForm({ ...settingsForm, heroSlides: next });
                            }}
                            placeholder="URL de l'image de fond..."
                            className="flex-1 bg-white border border-[#E0D7CC] rounded-lg px-2.5 py-1.5 text-xs"
                          />
                          <label className="cursor-pointer px-3 py-1.5 bg-[#EFEAE2] hover:bg-[#E4DCCF] text-xs font-bold rounded-lg shrink-0">
                            Upload
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageFileUpload(e, (url) => {
                                const next = [...settingsForm.heroSlides];
                                next[idx] = { ...slide, imageUrl: url };
                                setSettingsForm({ ...settingsForm, heroSlides: next });
                              })}
                            />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#F2ECE4]">
                  <button
                    type="submit"
                    className="px-8 py-3 bg-[#181512] hover:bg-[#2C2723] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md"
                  >
                    Enregistrer Tous les Paramètres
                  </button>
                </div>

              </form>
            </div>

            {/* SECURITY & ACCESS CONTROLS CARD */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E1D7] shadow-sm space-y-6">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#C5A880]/20 text-[#8C7A6B] text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Sécurité & Standards 2026</span>
                </div>
                <h2 className="font-cinzel text-xl font-bold text-[#1E1B18] flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-[#C5A880]" />
                  <span>Sécurité des Accès & Mot de Passe Atelier</span>
                </h2>
                <p className="text-xs text-[#6B5F54]">
                  Personnalisez votre mot de passe d'accès confidentiel ou utilisez l'authentification par code sécurisé à 6 chiffres envoyé sur <strong>{settingsForm.email || settings.email}</strong>.
                </p>
              </div>

              {securityMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{securityMessage}</span>
                </div>
              )}

              {securityError && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 text-xs font-semibold flex items-center gap-2">
                  <X className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{securityError}</span>
                </div>
              )}

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newAdminPassword.length < 6) {
                    setSecurityError('Le mot de passe doit comporter au moins 6 caractères.');
                    return;
                  }
                  if (newAdminPassword !== confirmAdminPassword) {
                    setSecurityError('Les deux mots de passe ne correspondent pas.');
                    return;
                  }
                  localStorage.setItem('maison_vans_custom_admin_password', newAdminPassword);
                  setSecurityError(null);
                  setSecurityMessage('Votre nouveau mot de passe Atelier a été enregistré avec succès !');
                  setNewAdminPassword('');
                  setConfirmAdminPassword('');
                  setTimeout(() => setSecurityMessage(null), 4000);
                }}
                className="space-y-4 max-w-lg"
              >
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                    Nouveau Mot de Passe Atelier
                  </label>
                  <input
                    type="password"
                    value={newAdminPassword}
                    onChange={(e) => {
                      setNewAdminPassword(e.target.value);
                      setSecurityError(null);
                    }}
                    placeholder="Min. 6 caractères (ex: MaisonVans2026!)"
                    className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-4 py-2 text-xs text-[#1E1B18]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                    Confirmer le Nouveau Mot de Passe
                  </label>
                  <input
                    type="password"
                    value={confirmAdminPassword}
                    onChange={(e) => {
                      setConfirmAdminPassword(e.target.value);
                      setSecurityError(null);
                    }}
                    placeholder="Retapez votre mot de passe"
                    className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-4 py-2 text-xs text-[#1E1B18]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#181512] hover:bg-[#2C2723] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm cursor-pointer"
                  >
                    Mettre à jour le mot de passe
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 7: BACKUP & RESTORE */}
        {activeAdminTab === 'backup' && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E1D7] shadow-sm space-y-6">
              <h2 className="font-cinzel text-xl font-bold text-[#1E1B18] flex items-center gap-2">
                <Save className="w-5 h-5 text-[#C5A880]" />
                <span>Sauvegarde & Restauration des Données</span>
              </h2>

              <p className="text-xs text-[#6B5F54]">
                Exportez l'ensemble de votre catalogue, de vos photos et de vos réglages au format JSON pour conserver une sauvegarde sécurisée sur votre ordinateur, ou réinitialisez les données d'exemple.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#E0D7CC] space-y-3">
                  <h3 className="font-cinzel text-sm font-bold text-[#1E1B18]">
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
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#181512] text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                  >
                    <Download className="w-4 h-4 text-[#C5A880]" />
                    <span>Télécharger la Sauvegarde (.JSON)</span>
                  </button>
                </div>

                <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#E0D7CC] space-y-3">
                  <h3 className="font-cinzel text-sm font-bold text-[#1E1B18]">
                    Réinitialiser l'Atelier
                  </h3>
                  <p className="text-[11px] text-[#8C7A6B]">
                    Restaurer le catalogue haute couture d'origine par défaut.
                  </p>
                  <button
                    onClick={() => {
                      if (confirm('Attention : toutes les modifications personnalisées non sauvegardées seront réinitialisées au catalogue par défaut. Continuer ?')) {
                        resetToDefaults();
                        triggerSuccess('Données réinitialisées au catalogue haute couture par défaut.');
                      }
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Restaurer le Catalogue d'Origine</span>
                  </button>
                </div>
              </div>

              {/* Import JSON */}
              <div className="pt-4 border-t border-[#F2ECE4] space-y-3">
                <h3 className="font-cinzel text-sm font-bold text-[#1E1B18]">
                  Importer une Sauvegarde JSON
                </h3>
                <textarea
                  rows={4}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder="Collez ici le contenu de votre fichier JSON de sauvegarde..."
                  className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl p-3 text-xs text-[#1E1B18] font-mono"
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
                  className="px-5 py-2.5 bg-[#181512] text-white rounded-xl text-xs font-bold uppercase tracking-wider"
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
