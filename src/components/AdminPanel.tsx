import React, { useState } from 'react';
import { useStudio } from '../context/StudioContext';
import { Creation, Inspiration, Occasion, Testimonial } from '../types';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
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
  Eye, 
  EyeOff, 
  MessageCircle,
  KeyRound,
  LogOut,
  Crown,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { generateWhatsAppLink } from '../data/initialData';
import { AdminAuthScreen } from './AdminAuthScreen';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { hashPassword, verifyPassword, AdminAuthConfig, ADMIN_AUTH_STORAGE_KEY } from '../lib/security';

type AdminTab = 'creations' | 'inspirations' | 'occasions' | 'testimonials' | 'share-tool' | 'settings' | 'backup';

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
  const [editingCreationId, setEditingCreationId] = useState<string | null>(null);
  const [creationForm, setCreationForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    occasionName: occasions[0]?.name || 'Mariages & Cérémonies',
    silhouette: 'Coupe Sirène & Traîne',
    fabrics: 'Mikado de Soie',
    colors: 'Noir Impérial',
    priceEstimate: 'Sur devis',
    preparationTime: '3 à 4 semaines',
    images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=750&q=75'],
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
    styleTags: 'Sculptural, Élégant',
    isOriginalCreation: true,
    sourceAuthor: "Atelier Maison Van's",
  });

  // Occasion Form State
  const [editingOccasionId, setEditingOccasionId] = useState<string | null>(null);
  const [occasionForm, setOccasionForm] = useState({
    name: '',
    description: '',
    coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
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

  // Settings State
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
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('maison_vans_admin_session');
    localStorage.removeItem('maison_vans_admin_auth');
    localStorage.removeItem('maison_vans_atelier_data_v1_admin_auth');
    setAdminAuthenticated(false);
    setActiveTab('home');
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image supérieure à 2 Mo.");
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
      description: creationForm.description.trim() || `Création sur-mesure confectionnée en ${creationForm.fabrics}.`,
      longDescription: creationForm.description.trim() || `Modèle exclusif façonné par Vanessa Kaniki.`,
      categories: ['Haute Couture', 'Sur-Mesure'],
      occasionId: targetOccasion?.id || 'occ-mariage',
      occasionName: targetOccasion?.name || creationForm.occasionName,
      colors: creationForm.colors.split(',').map(c => c.trim()).filter(Boolean),
      fabrics: creationForm.fabrics.split(',').map(f => f.trim()).filter(Boolean),
      silhouette: creationForm.silhouette.trim() || 'Coupe Sirène',
      coutureLine: `Ligne ${creationForm.occasionName}`,
      fittingDetails: 'Séances d’essayage privées à l’Atelier de Kinshasa ou guidées en visioconférence.',
      images: creationForm.images.filter(img => img.trim() !== ''),
      priceEstimate: creationForm.priceEstimate.trim() || 'Sur devis',
      preparationTime: creationForm.preparationTime.trim() || '3 à 4 semaines',
      isAvailable: true,
      availabilityBadge: 'Sur commande' as const,
      customOptions: ['Ajustement sur-mesure', 'Choix des finitions'],
      isFeatured: creationForm.isFeatured,
      misEnAvant: creationForm.isFeatured
    };

    if (editingCreationId) {
      updateCreation(editingCreationId, creationData);
      triggerSuccess('Création mise à jour.');
    } else {
      addCreation(creationData);
      triggerSuccess('Création publiée au catalogue.');
    }

    setEditingCreationId(null);
    setCreationForm({
      title: '',
      subtitle: '',
      description: '',
      occasionName: occasions[0]?.name || 'Mariages & Cérémonies',
      silhouette: 'Coupe Sirène & Traîne',
      fabrics: 'Mikado de Soie',
      colors: 'Noir Impérial',
      priceEstimate: 'Sur devis',
      preparationTime: '3 à 4 semaines',
      images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=750&q=75'],
      isFeatured: false,
    });
  };

  const handleEditCreationClick = (c: Creation) => {
    setEditingCreationId(c.id);
    setCreationForm({
      title: c.title,
      subtitle: c.subtitle || '',
      description: c.description,
      occasionName: c.occasionName,
      silhouette: c.silhouette || '',
      fabrics: c.fabrics.join(', '),
      colors: c.colors.join(', '),
      priceEstimate: c.priceEstimate || 'Sur devis',
      preparationTime: c.preparationTime || '3 à 4 semaines',
      images: c.images.length > 0 ? c.images : [''],
      isFeatured: Boolean(c.isFeatured || c.misEnAvant),
    });
    window.scrollTo({ top: 150, behavior: 'smooth' });
  };

  // Inspiration Handler
  const handleSaveInspiration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspirationForm.title.trim() || !inspirationForm.imageUrl.trim()) return;

    const data = {
      title: inspirationForm.title.trim(),
      description: inspirationForm.description.trim() || 'Modèle d’inspiration haute couture.',
      imageUrl: inspirationForm.imageUrl.trim(),
      category: inspirationForm.category.trim(),
      occasion: inspirationForm.occasion,
      colors: inspirationForm.colors.split(',').map(c => c.trim()).filter(Boolean),
      styleTags: inspirationForm.styleTags.split(',').map(t => t.trim()).filter(Boolean),
      isOriginalCreation: inspirationForm.isOriginalCreation,
      sourceAuthor: inspirationForm.sourceAuthor.trim() || "Atelier Maison Van's",
      sourceNotes: '',
    };

    if (editingInspirationId) {
      updateInspiration(editingInspirationId, data);
      triggerSuccess('Inspiration mise à jour.');
    } else {
      addInspiration(data);
      triggerSuccess('Inspiration ajoutée.');
    }

    setEditingInspirationId(null);
    setInspirationForm({
      title: '',
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=85',
      category: 'Haute Couture',
      occasion: occasions[0]?.name || 'Galas & Soirées Mondaines',
      colors: 'Bleu, Noir',
      styleTags: 'Sculptural, Élégant',
      isOriginalCreation: true,
      sourceAuthor: "Atelier Maison Van's",
    });
  };

  // Occasion Handler
  const handleSaveOccasion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!occasionForm.name.trim()) return;

    const data = {
      name: occasionForm.name.trim(),
      description: occasionForm.description.trim(),
      coverImage: occasionForm.coverImage.trim() || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
      displayOrder: occasions.length + 1,
    };

    if (editingOccasionId) {
      updateOccasion(editingOccasionId, data);
      triggerSuccess('Occasion mise à jour.');
    } else {
      addOccasion(data);
      triggerSuccess('Occasion créée.');
    }

    setEditingOccasionId(null);
    setOccasionForm({
      name: '',
      description: '',
      coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    });
  };

  // Testimonial Handler
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
      triggerSuccess('Avis mis à jour.');
    } else {
      addTestimonial(data);
      triggerSuccess('Avis publié.');
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

  // Share Generator
  const selectedCreation = creations.find(c => c.id === selectedShareItemId) || creations[0];
  const selectedInspiration = inspirations.find(i => i.id === selectedShareItemId) || inspirations[0];

  const shareText = selectedShareItemType === 'creation' && selectedCreation
    ? `Bonjour ${customShareRecipient || ''} ✨\nJe voulais te partager cette création de l'Atelier :\n👗 *${selectedCreation.title}*\n${selectedCreation.description}\n\nDécouvre plus de détails sur notre Atelier :\n${window.location.origin}/#creation-${selectedCreation.slug}`
    : `Bonjour ${customShareRecipient || ''} ✨\nVoici une inspiration couture :\n💡 *${selectedInspiration?.title}*\n${selectedInspiration?.description}\n\nRéalisable sur-mesure à l'Atelier !`;

  const handleCopyShare = () => {
    navigator.clipboard.writeText(shareText);
    setCopiedShareText(true);
    setTimeout(() => setCopiedShareText(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const url = generateWhatsAppLink('', shareText);
    window.open(url, '_blank');
  };

  if (!adminAuthenticated) {
    return (
      <AdminAuthScreen
        onSuccess={() => triggerSuccess('Bienvenue dans votre Atelier.')}
        onCancel={() => setActiveTab('home')}
      />
    );
  }

  return (
    <section id="admin-panel-dashboard" className="py-8 sm:py-12 bg-[#FAF8F5] min-h-screen select-none">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* 1. SLEEK MINIMALIST HEADER */}
        <div className="bg-[#181512] text-[#FAF8F5] p-5 sm:p-7 rounded-3xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#2E2822]">
          
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#25201A] border border-[#C5A880]/40 text-[#D4AF37] flex items-center justify-center font-bold text-lg" style={{ fontFamily: "'Cinzel', serif" }}>
              VK
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-wide text-[#FAF8F5]" style={{ fontFamily: "'Cinzel', serif" }}>
                  Atelier Vanessa Kaniki
                </h1>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="En ligne" />
              </div>
              <p className="text-xs text-[#A89C8F]">{settings.email || 'mutangilwaivan@gmail.com'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              onClick={() => setActiveTab('home')}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-[#FAF8F5] transition-all cursor-pointer"
            >
              Voir la Vitrine
            </button>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Quitter</span>
            </button>
          </div>
        </div>

        {/* 2. MINIMALIST METRICS ROW */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-[#EAE3DA] shadow-xs text-center sm:text-left">
            <span className="text-[10.5px] font-semibold text-[#8C7A6B] uppercase tracking-wider block">Créations</span>
            <span className="text-2xl font-bold text-[#181512]" style={{ fontFamily: "'Cinzel', serif" }}>
              {creations.length}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#EAE3DA] shadow-xs text-center sm:text-left">
            <span className="text-[10.5px] font-semibold text-[#8C7A6B] uppercase tracking-wider block">Inspirations</span>
            <span className="text-2xl font-bold text-[#181512]" style={{ fontFamily: "'Cinzel', serif" }}>
              {inspirations.length}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#EAE3DA] shadow-xs text-center sm:text-left">
            <span className="text-[10.5px] font-semibold text-[#8C7A6B] uppercase tracking-wider block">Avis Clientes</span>
            <span className="text-2xl font-bold text-[#181512]" style={{ fontFamily: "'Cinzel', serif" }}>
              {testimonials.length}
            </span>
          </div>
        </div>

        {/* Toast Notification */}
        {successMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-semibold flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 3. TABS NAVIGATION */}
        <div className="overflow-x-auto no-scrollbar">
          <div className="inline-flex gap-1.5 p-1 bg-white rounded-2xl border border-[#EAE3DA] shadow-xs min-w-full sm:min-w-0">
            
            <button
              onClick={() => setActiveAdminTab('creations')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeAdminTab === 'creations' ? 'bg-[#181512] text-white shadow-xs' : 'text-[#6B5F54] hover:bg-[#FAF8F5]'
              }`}
            >
              Créations ({creations.length})
            </button>

            <button
              onClick={() => setActiveAdminTab('inspirations')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeAdminTab === 'inspirations' ? 'bg-[#181512] text-white shadow-xs' : 'text-[#6B5F54] hover:bg-[#FAF8F5]'
              }`}
            >
              Inspirations ({inspirations.length})
            </button>

            <button
              onClick={() => setActiveAdminTab('occasions')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeAdminTab === 'occasions' ? 'bg-[#181512] text-white shadow-xs' : 'text-[#6B5F54] hover:bg-[#FAF8F5]'
              }`}
            >
              Occasions ({occasions.length})
            </button>

            <button
              onClick={() => setActiveAdminTab('testimonials')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeAdminTab === 'testimonials' ? 'bg-[#181512] text-white shadow-xs' : 'text-[#6B5F54] hover:bg-[#FAF8F5]'
              }`}
            >
              Avis ({testimonials.length})
            </button>

            <button
              onClick={() => setActiveAdminTab('share-tool')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeAdminTab === 'share-tool' ? 'bg-[#181512] text-white shadow-xs' : 'text-[#6B5F54] hover:bg-[#FAF8F5]'
              }`}
            >
              Partage WhatsApp
            </button>

            <button
              onClick={() => setActiveAdminTab('settings')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeAdminTab === 'settings' ? 'bg-[#181512] text-white shadow-xs' : 'text-[#6B5F54] hover:bg-[#FAF8F5]'
              }`}
            >
              Paramètres & Sécurité
            </button>

            <button
              onClick={() => setActiveAdminTab('backup')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeAdminTab === 'backup' ? 'bg-[#181512] text-white shadow-xs' : 'text-[#6B5F54] hover:bg-[#FAF8F5]'
              }`}
            >
              Sauvegarde
            </button>

          </div>
        </div>

        {/* TAB 1: CREATIONS */}
        {activeAdminTab === 'creations' && (
          <div className="space-y-6">
            
            {/* Minimalist Creation Form */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EAE3DA] shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-cinzel text-base font-bold text-[#181512]">
                  {editingCreationId ? 'Modifier la Création' : 'Nouvelle Création'}
                </h2>
                {editingCreationId && (
                  <button
                    onClick={() => {
                      setEditingCreationId(null);
                      setCreationForm({
                        title: '',
                        subtitle: '',
                        description: '',
                        occasionName: occasions[0]?.name || 'Mariages & Cérémonies',
                        silhouette: 'Coupe Sirène & Traîne',
                        fabrics: 'Mikado de Soie',
                        colors: 'Noir Impérial',
                        priceEstimate: 'Sur devis',
                        preparationTime: '3 à 4 semaines',
                        images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=750&q=75'],
                        isFeatured: false,
                      });
                    }}
                    className="text-xs text-rose-600 hover:underline cursor-pointer"
                  >
                    Annuler
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveCreation} className="space-y-4 text-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="font-semibold text-[#8C7A6B]">Nom de la Robe / Tenue *</label>
                    <input
                      type="text"
                      required
                      value={creationForm.title}
                      onChange={(e) => setCreationForm({ ...creationForm, title: e.target.value })}
                      placeholder="Ex: Robe Royale AURA"
                      className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2.5 text-xs text-[#181512] focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[#8C7A6B]">Occasion</label>
                    <select
                      value={creationForm.occasionName}
                      onChange={(e) => setCreationForm({ ...creationForm, occasionName: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2.5 text-xs text-[#181512] focus:outline-none focus:border-[#C5A880]"
                    >
                      {occasions.map(occ => (
                        <option key={occ.id} value={occ.name}>{occ.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="space-y-1">
                    <label className="font-semibold text-[#8C7A6B]">Coupe / Silhouette</label>
                    <input
                      type="text"
                      value={creationForm.silhouette}
                      onChange={(e) => setCreationForm({ ...creationForm, silhouette: e.target.value })}
                      placeholder="Coupe Sirène, Princesse, Fourreau..."
                      className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2.5 text-xs text-[#181512] focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[#8C7A6B]">Tissus</label>
                    <input
                      type="text"
                      value={creationForm.fabrics}
                      onChange={(e) => setCreationForm({ ...creationForm, fabrics: e.target.value })}
                      placeholder="Mikado, Soie, Dentelle..."
                      className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2.5 text-xs text-[#181512] focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[#8C7A6B]">Estimation Tarif</label>
                    <input
                      type="text"
                      value={creationForm.priceEstimate}
                      onChange={(e) => setCreationForm({ ...creationForm, priceEstimate: e.target.value })}
                      placeholder="Sur devis (ou Dès 750$)"
                      className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2.5 text-xs text-[#181512] focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#8C7A6B]">Description</label>
                  <textarea
                    rows={2}
                    value={creationForm.description}
                    onChange={(e) => setCreationForm({ ...creationForm, description: e.target.value })}
                    placeholder="Description des détails, du drapé et des finitions..."
                    className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl p-3 text-xs text-[#181512] focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                {/* Photos */}
                <div className="space-y-2 pt-1">
                  <label className="font-semibold text-[#8C7A6B] block">Photos de la Création</label>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer px-4 py-2 bg-[#FAF8F5] hover:bg-[#F0EAE1] text-[#181512] rounded-xl text-xs font-semibold border border-[#E0D7CC] shrink-0">
                      <Upload className="w-3.5 h-3.5 inline mr-1 text-[#C5A880]" />
                      <span>Uploader une photo</span>
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
                    <input
                      type="text"
                      value={creationForm.images[0] || ''}
                      onChange={(e) => {
                        const next = [...creationForm.images];
                        next[0] = e.target.value;
                        setCreationForm({ ...creationForm, images: next });
                      }}
                      placeholder="Ou collez une URL d'image..."
                      className="flex-1 bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2 text-xs text-[#181512]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#181512]">
                    <input
                      type="checkbox"
                      checked={creationForm.isFeatured}
                      onChange={(e) => setCreationForm({ ...creationForm, isFeatured: e.target.checked })}
                      className="rounded border-[#E0D7CC] text-[#181512] focus:ring-[#C5A880]"
                    />
                    <span>★ Pièce Coup de Cœur (en tête d’accueil)</span>
                  </label>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#181512] hover:bg-[#2C2621] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                  >
                    {editingCreationId ? 'Enregistrer' : 'Publier'}
                  </button>
                </div>

              </form>
            </div>

            {/* Creations List */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EAE3DA] shadow-xs space-y-4">
              <h3 className="font-cinzel text-base font-bold text-[#181512]">
                Vitrine ({creations.length} pièces)
              </h3>

              <div className="divide-y divide-[#F0EAE1]">
                {creations.map(c => {
                  const isFeaturedItem = Boolean(c.misEnAvant || c.isFeatured);
                  return (
                    <div key={c.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={c.images[0]}
                          alt={c.title}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-xl object-cover border border-[#EAE3DA] shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-cinzel text-xs font-bold text-[#181512] truncate">{c.title}</h4>
                            {isFeaturedItem && <span className="text-[10px] text-[#C5A880] font-bold">★ À la une</span>}
                          </div>
                          <span className="text-[11px] text-[#8C7A6B] block truncate">
                            {c.occasionName} • {c.priceEstimate || 'Sur devis'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            setFeaturedCreation(c.id);
                            triggerSuccess(`"${c.title}" mis à la une.`);
                          }}
                          className={`p-2 rounded-xl text-xs cursor-pointer ${
                            isFeaturedItem ? 'text-[#D4AF37] bg-amber-50' : 'text-[#8C7A6B] hover:bg-[#FAF8F5]'
                          }`}
                          title="Coup de Cœur"
                        >
                          <Star className={`w-4 h-4 ${isFeaturedItem ? 'fill-current' : ''}`} />
                        </button>

                        <button
                          onClick={() => toggleCreationAvailability(c.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
                            c.isAvailable ? 'bg-emerald-50 text-emerald-800' : 'bg-zinc-100 text-zinc-600'
                          }`}
                        >
                          {c.isAvailable ? 'Dispo' : 'Off'}
                        </button>

                        <button
                          onClick={() => handleEditCreationClick(c)}
                          className="p-2 text-[#8C7A6B] hover:text-[#181512] hover:bg-[#FAF8F5] rounded-xl cursor-pointer"
                          title="Modifier"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Supprimer "${c.title}" ?`)) {
                              deleteCreation(c.id);
                              triggerSuccess('Supprimé.');
                            }
                          }}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl cursor-pointer"
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

        {/* TAB 2: INSPIRATIONS */}
        {activeAdminTab === 'inspirations' && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EAE3DA] shadow-xs space-y-4">
              <h2 className="font-cinzel text-base font-bold text-[#181512]">
                Ajouter une Inspiration
              </h2>

              <form onSubmit={handleSaveInspiration} className="space-y-3.5 text-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="font-semibold text-[#8C7A6B]">Titre du Modèle *</label>
                    <input
                      type="text"
                      required
                      value={inspirationForm.title}
                      onChange={(e) => setInspirationForm({ ...inspirationForm, title: e.target.value })}
                      placeholder="Ex: Drapé Haute Couture"
                      className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2.5 text-xs text-[#181512]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[#8C7A6B]">Occasion</label>
                    <select
                      value={inspirationForm.occasion}
                      onChange={(e) => setInspirationForm({ ...inspirationForm, occasion: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2.5 text-xs text-[#181512]"
                    >
                      {occasions.map(occ => (
                        <option key={occ.id} value={occ.name}>{occ.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#8C7A6B]">Photo du Modèle</label>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer px-4 py-2 bg-[#FAF8F5] hover:bg-[#F0EAE1] text-[#181512] rounded-xl text-xs font-semibold border border-[#E0D7CC] shrink-0">
                      <Upload className="w-3.5 h-3.5 inline mr-1 text-[#C5A880]" />
                      <span>Uploader</span>
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
                      placeholder="URL de l'image..."
                      className="flex-1 bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2 text-xs text-[#181512]"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#181512] hover:bg-[#2C2621] text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Ajouter au Moodboard
                  </button>
                </div>
              </form>
            </div>

            {/* Inspirations Grid */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EAE3DA] shadow-xs space-y-4">
              <h3 className="font-cinzel text-base font-bold text-[#181512]">
                Inspirations ({inspirations.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {inspirations.map(item => (
                  <div key={item.id} className="group relative rounded-2xl overflow-hidden border border-[#EAE3DA] aspect-[3/4] bg-[#FAF8F5]">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end text-white">
                      <span className="font-cinzel text-xs font-bold line-clamp-1">{item.title}</span>
                      <span className="text-[10px] text-[#D8CFC4]">{item.occasion}</span>
                      <button
                        onClick={() => {
                          if (confirm(`Supprimer "${item.title}" ?`)) {
                            deleteInspiration(item.id);
                            triggerSuccess('Supprimé.');
                          }
                        }}
                        className="mt-2 text-[10px] text-rose-400 hover:underline text-left cursor-pointer"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: OCCASIONS */}
        {activeAdminTab === 'occasions' && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EAE3DA] shadow-xs space-y-4">
              <h2 className="font-cinzel text-base font-bold text-[#181512]">
                Ajouter une Occasion
              </h2>

              <form onSubmit={handleSaveOccasion} className="space-y-3.5 text-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="font-semibold text-[#8C7A6B]">Nom *</label>
                    <input
                      type="text"
                      required
                      value={occasionForm.name}
                      onChange={(e) => setOccasionForm({ ...occasionForm, name: e.target.value })}
                      placeholder="Ex: Cérémonies Religieuses"
                      className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2.5 text-xs text-[#181512]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[#8C7A6B]">Description</label>
                    <input
                      type="text"
                      value={occasionForm.description}
                      onChange={(e) => setOccasionForm({ ...occasionForm, description: e.target.value })}
                      placeholder="Courte description de l'événement..."
                      className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2.5 text-xs text-[#181512]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#181512] text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Enregistrer l'Occasion
                </button>
              </form>

              <div className="pt-4 border-t border-[#F0EAE1] space-y-2">
                {occasions.map(occ => (
                  <div key={occ.id} className="p-3 bg-[#FAF8F5] rounded-xl flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#181512]">{occ.name}</span>
                    <button
                      onClick={() => {
                        if (confirm(`Supprimer "${occ.name}" ?`)) {
                          deleteOccasion(occ.id);
                          triggerSuccess('Supprimé.');
                        }
                      }}
                      className="text-rose-500 hover:underline cursor-pointer"
                    >
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TESTIMONIALS */}
        {activeAdminTab === 'testimonials' && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EAE3DA] shadow-xs space-y-4">
              <h2 className="font-cinzel text-base font-bold text-[#181512]">
                Ajouter un Avis Client
              </h2>

              <form onSubmit={handleSaveTestimonial} className="space-y-3.5 text-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="font-semibold text-[#8C7A6B]">Nom de la Cliente *</label>
                    <input
                      type="text"
                      required
                      value={testimonialForm.clientName}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, clientName: e.target.value })}
                      placeholder="Ex: Sarah M."
                      className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2.5 text-xs text-[#181512]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[#8C7A6B]">Événement / Robe</label>
                    <input
                      type="text"
                      value={testimonialForm.eventType}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, eventType: e.target.value })}
                      placeholder="Ex: Mariage"
                      className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2.5 text-xs text-[#181512]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#8C7A6B]">Commentaire *</label>
                  <textarea
                    rows={2}
                    required
                    value={testimonialForm.feedback}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, feedback: e.target.value })}
                    placeholder="Retour d'expérience de la cliente..."
                    className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl p-3 text-xs text-[#181512]"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#181512] text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Publier l'Avis
                </button>
              </form>

              <div className="pt-4 border-t border-[#F0EAE1] space-y-2.5">
                {testimonials.map(t => (
                  <div key={t.id} className="p-3.5 bg-[#FAF8F5] rounded-2xl flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#181512]">{t.clientName}</span>
                        <span className="text-[#D4AF37]">{'★'.repeat(t.rating)}</span>
                      </div>
                      <p className="text-[11px] text-[#5C5248] italic mt-0.5">« {t.feedback} »</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => toggleTestimonialVisibility(t.id)}
                        className={`p-1.5 rounded-lg text-xs cursor-pointer ${t.isVisible ? 'text-emerald-700 bg-emerald-50' : 'text-zinc-500 bg-zinc-100'}`}
                      >
                        {t.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Supprimer l'avis de ${t.clientName} ?`)) {
                            deleteTestimonial(t.id);
                            triggerSuccess('Supprimé.');
                          }
                        }}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SHARE TOOL */}
        {activeAdminTab === 'share-tool' && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EAE3DA] shadow-xs space-y-4">
              <h2 className="font-cinzel text-base font-bold text-[#181512] flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#25D366]" />
                <span>Partage WhatsApp</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-[#8C7A6B]">Sélectionner une création</label>
                  <select
                    value={selectedShareItemId}
                    onChange={(e) => setSelectedShareItemId(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2.5 text-xs text-[#181512]"
                  >
                    {creations.map(c => <option key={c.id} value={c.id}>{c.title} ({c.occasionName})</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#8C7A6B]">Prénom destinataire (optionnel)</label>
                  <input
                    type="text"
                    value={customShareRecipient}
                    onChange={(e) => setCustomShareRecipient(e.target.value)}
                    placeholder="Ex: Sophie"
                    className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2.5 text-xs text-[#181512]"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#181512] text-[#D8CFC4] text-xs font-mono whitespace-pre-wrap">
                {shareText}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleWhatsAppShare}
                  className="px-5 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Ouvrir WhatsApp
                </button>
                <button
                  onClick={handleCopyShare}
                  className="px-4 py-2.5 bg-[#FAF8F5] hover:bg-[#F0EAE1] text-[#181512] border border-[#E0D7CC] rounded-xl text-xs font-semibold cursor-pointer"
                >
                  {copiedShareText ? 'Copié !' : 'Copier le texte'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SETTINGS & SECURITY */}
        {activeAdminTab === 'settings' && (
          <div className="space-y-6">
            
            {/* General Settings */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EAE3DA] shadow-xs space-y-4">
              <h2 className="font-cinzel text-base font-bold text-[#181512]">
                Coordonnées de l'Atelier
              </h2>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  updateSettings(settingsForm);
                  triggerSuccess('Paramètres enregistrés.');
                }} 
                className="space-y-3.5 text-xs"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="font-semibold text-[#8C7A6B]">Numéro WhatsApp de Conversion *</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.whatsappNumber}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                      placeholder="+33658921473"
                      className="w-full bg-[#FAF8F5] border border-emerald-300 rounded-xl px-3.5 py-2.5 text-xs text-[#181512] font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[#8C7A6B]">Nom de la Modéliste</label>
                    <input
                      type="text"
                      value={settingsForm.designerName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, designerName: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2.5 text-xs text-[#181512]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="font-semibold text-[#8C7A6B]">Adresse de l'Atelier</label>
                    <input
                      type="text"
                      value={settingsForm.address}
                      onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2.5 text-xs text-[#181512]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[#8C7A6B]">Horaires</label>
                    <input
                      type="text"
                      value={settingsForm.openingHours}
                      onChange={(e) => setSettingsForm({ ...settingsForm, openingHours: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2.5 text-xs text-[#181512]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#181512] text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Enregistrer les Coordonnées
                </button>
              </form>
            </div>

            {/* Security Password Change */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EAE3DA] shadow-xs space-y-4">
              <h2 className="font-cinzel text-base font-bold text-[#181512] flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#C5A880]" />
                <span>Modifier le Mot de Passe</span>
              </h2>

              {securityMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold">
                  {securityMessage}
                </div>
              )}

              {securityError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                  {securityError}
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
                    setSecurityError('Les mots de passe ne correspondent pas.');
                    return;
                  }

                  setIsUpdatingPassword(true);
                  setSecurityError(null);

                  try {
                    let currentConfig: AdminAuthConfig | null = null;
                    try {
                      const snap = await getDoc(doc(db, 'settings', 'admin_auth'));
                      if (snap.exists()) currentConfig = snap.data() as AdminAuthConfig;
                    } catch {
                      // offline
                    }

                    if (!currentConfig) {
                      const localSaved = localStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
                      if (localSaved) currentConfig = JSON.parse(localSaved);
                    }

                    if (currentConfig?.passwordHash && currentConfig?.salt) {
                      const isCurrentValid = await verifyPassword(currentAdminPassword, currentConfig.passwordHash, currentConfig.salt);
                      if (!isCurrentValid) {
                        setSecurityError('Mot de passe actuel incorrect.');
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
                      console.warn('Firestore notice:', err);
                    }

                    localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, JSON.stringify(updatedConfig));
                    setSecurityMessage('✅ Mot de passe mis à jour avec succès.');
                    setCurrentAdminPassword('');
                    setNewAdminPassword('');
                    setConfirmAdminPassword('');
                    setTimeout(() => setSecurityMessage(null), 4000);
                  } catch (err: any) {
                    setSecurityError(`Erreur : ${err?.message || 'Réessayez.'}`);
                  } finally {
                    setIsUpdatingPassword(false);
                  }
                }}
                className="space-y-3 text-xs max-w-sm"
              >
                <div className="space-y-1">
                  <label className="font-semibold text-[#8C7A6B]">Mot de passe actuel</label>
                  <input
                    type="password"
                    required
                    value={currentAdminPassword}
                    onChange={(e) => setCurrentAdminPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2 text-xs text-[#181512]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#8C7A6B]">Nouveau mot de passe</label>
                  <input
                    type="password"
                    required
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="Min. 6 caractères"
                    className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2 text-xs text-[#181512]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#8C7A6B]">Confirmer</label>
                  <input
                    type="password"
                    required
                    value={confirmAdminPassword}
                    onChange={(e) => setConfirmAdminPassword(e.target.value)}
                    placeholder="Retapez le nouveau mot de passe"
                    className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2 text-xs text-[#181512]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="px-5 py-2.5 bg-[#181512] text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingPassword ? 'Mise à jour...' : 'Mettre à jour'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 7: BACKUP */}
        {activeAdminTab === 'backup' && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EAE3DA] shadow-xs space-y-4 text-xs">
              <h2 className="font-cinzel text-base font-bold text-[#181512]">
                Sauvegarde des Données
              </h2>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    const dataStr = exportDataJson();
                    const blob = new Blob([dataStr], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `atelier-backup-${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                    triggerSuccess('Sauvegarde téléchargée.');
                  }}
                  className="px-4 py-2.5 bg-[#181512] text-white rounded-xl font-semibold cursor-pointer"
                >
                  Télécharger la Sauvegarde (.JSON)
                </button>

                <button
                  onClick={() => {
                    if (confirm('Restaurer le catalogue par défaut ?')) {
                      resetToDefaults();
                      triggerSuccess('Catalogue par défaut restauré.');
                    }
                  }}
                  className="px-4 py-2.5 bg-rose-800 text-white rounded-xl font-semibold cursor-pointer"
                >
                  Restaurer les données d'origine
                </button>
              </div>

              <div className="pt-3 border-t border-[#F0EAE1] space-y-2">
                <label className="font-semibold text-[#8C7A6B] block">Importer un fichier JSON</label>
                <textarea
                  rows={3}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder="Collez ici le JSON de sauvegarde..."
                  className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl p-3 text-xs font-mono"
                />
                <button
                  onClick={() => {
                    if (importJsonText.trim()) {
                      if (importDataJson(importJsonText)) {
                        triggerSuccess('Import réussi.');
                        setImportJsonText('');
                      } else {
                        alert('Format JSON invalide.');
                      }
                    }
                  }}
                  className="px-4 py-2 bg-[#181512] text-white rounded-xl font-semibold cursor-pointer"
                >
                  Importer
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
