import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db, auth, onAuthStateChanged } from '../lib/firebase';
import { Creation, CreationComment, Inspiration, Occasion, Testimonial, StudioSettings, ActiveTab } from '../types';
import { 
  INITIAL_CREATIONS, 
  INITIAL_INSPIRATIONS, 
  INITIAL_OCCASIONS, 
  INITIAL_TESTIMONIALS, 
  INITIAL_STUDIO_SETTINGS 
} from '../data/initialData';

interface StudioContextType {
  creations: Creation[];
  inspirations: Inspiration[];
  occasions: Occasion[];
  testimonials: Testimonial[];
  settings: StudioSettings;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedOccasionFilter: string | null;
  setSelectedOccasionFilter: (occ: string | null) => void;
  selectedCreationForDetail: Creation | null;
  setSelectedCreationForDetail: (c: Creation | null) => void;
  selectedInspirationForDetail: Inspiration | null;
  setSelectedInspirationForDetail: (i: Inspiration | null) => void;
  adminAuthenticated: boolean;
  setAdminAuthenticated: (auth: boolean) => void;
  isFirebaseConnected: boolean;
  
  // Likes & Comments
  likedCreationIds: string[];
  toggleLikeCreation: (creationId: string) => Promise<void>;
  addCreationComment: (creationId: string, comment: Omit<CreationComment, 'id' | 'createdAt'>) => Promise<void>;

  // CRUD Actions
  addCreation: (creation: Omit<Creation, 'id' | 'createdAt' | 'slug'>) => Promise<void>;
  updateCreation: (id: string, data: Partial<Creation>) => Promise<void>;
  deleteCreation: (id: string) => Promise<void>;
  toggleCreationAvailability: (id: string) => Promise<void>;
  setFeaturedCreation: (id: string) => Promise<void>;
  
  addInspiration: (insp: Omit<Inspiration, 'id' | 'createdAt'>) => Promise<void>;
  updateInspiration: (id: string, data: Partial<Inspiration>) => Promise<void>;
  deleteInspiration: (id: string) => Promise<void>;
  
  addOccasion: (occ: Omit<Occasion, 'id' | 'slug'>) => Promise<void>;
  updateOccasion: (id: string, data: Partial<Occasion>) => Promise<void>;
  deleteOccasion: (id: string) => Promise<void>;
  
  addTestimonial: (test: Omit<Testimonial, 'id'>) => Promise<void>;
  updateTestimonial: (id: string, data: Partial<Testimonial>) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  toggleTestimonialVisibility: (id: string) => Promise<void>;
  
  updateSettings: (data: Partial<StudioSettings>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  exportDataJson: () => string;
  importDataJson: (json: string) => Promise<boolean>;
}

const STORAGE_KEY = 'maison_vans_atelier_data_v1';

// Helper to normalize creation documents (handles misEnAvant, isFeatured, likes, comments, etc.)
export const normalizeCreation = (id: string, data: any): Creation => {
  const isFeaturedValue = Boolean(
    data.misEnAvant === true || 
    data.misEnAvant === 'true' || 
    data.isFeatured === true ||
    data.mis_en_avant === true
  );

  return {
    id: id || data.id || `creat-${Date.now()}`,
    title: data.title || data.titre || 'Création Sans Titre',
    subtitle: data.subtitle || data.sousTitre || '',
    slug: data.slug || `creation-${id}`,
    description: data.description || '',
    longDescription: data.longDescription || data.descriptionLongue || data.description || '',
    categories: Array.isArray(data.categories) 
      ? data.categories 
      : (data.categorie ? [data.categorie] : ['Haute Couture']),
    occasionId: data.occasionId || data.occasion_id || 'occ-gala',
    occasionName: data.occasionName || data.occasion || 'Gala & Réception',
    colors: Array.isArray(data.colors) ? data.colors : (data.couleurs || ['Noir Profond']),
    fabrics: Array.isArray(data.fabrics) ? data.fabrics : (data.tissus || ['Soie Sauvage']),
    silhouette: data.silhouette || 'Sculpturale & Évasée',
    images: Array.isArray(data.images) && data.images.length > 0 
      ? data.images 
      : (data.imageUrl || data.image ? [data.imageUrl || data.image] : ['https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=85']),
    priceEstimate: data.priceEstimate || data.prix || 'Sur devis',
    coutureLine: data.coutureLine || data.ligne || 'Ligne Haute Couture Sur-Mesure',
    fittingDetails: data.fittingDetails || data.essayages || '2 séances privées à l’Atelier de Kinshasa ou visioconférence Diaspora',
    preparationTime: data.preparationTime || data.delai || '3 à 5 semaines',
    isAvailable: data.isAvailable !== undefined ? Boolean(data.isAvailable) : true,
    availabilityBadge: data.availabilityBadge || (data.disponible ? 'Sur commande' : 'Sur commande'),
    customOptions: Array.isArray(data.customOptions) ? data.customOptions : ['Ajustements sur-mesure'],
    isFeatured: isFeaturedValue,
    misEnAvant: isFeaturedValue,
    likesCount: typeof data.likesCount === 'number' ? data.likesCount : (data.likes || 18),
    comments: Array.isArray(data.comments) ? data.comments : [],
    createdAt: data.createdAt || data.dateCreation || new Date().toISOString().split('T')[0],
  };
};

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export const StudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [creations, setCreations] = useState<Creation[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_creations`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_CREATIONS;
  });

  const [inspirations, setInspirations] = useState<Inspiration[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_inspirations`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_INSPIRATIONS;
  });

  const [occasions, setOccasions] = useState<Occasion[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_occasions`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_OCCASIONS;
  });

  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_testimonials`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_TESTIMONIALS;
  });

  const [settings, setSettings] = useState<StudioSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.whatsappNumber === '+243890000000' || parsed.whatsappNumber === '+243842732362' || !parsed.whatsappNumber) {
          parsed.whatsappNumber = INITIAL_STUDIO_SETTINGS.whatsappNumber;
        }
        if (parsed.address?.includes('Quartier Résidentiel') || !parsed.address) {
          parsed.address = INITIAL_STUDIO_SETTINGS.address;
          parsed.city = INITIAL_STUDIO_SETTINGS.city;
        }
        if (!parsed.email || parsed.email === 'contact@vans-creation.com' || parsed.email === 'recherche42544@gmail.com') {
          parsed.email = INITIAL_STUDIO_SETTINGS.email;
        }
        return { ...INITIAL_STUDIO_SETTINGS, ...parsed };
      } catch (e) { console.error(e); }
    }
    return INITIAL_STUDIO_SETTINGS;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedOccasionFilter, setSelectedOccasionFilter] = useState<string | null>(null);
  const [selectedCreationForDetail, setSelectedCreationForDetail] = useState<Creation | null>(null);
  const [selectedInspirationForDetail, setSelectedInspirationForDetail] = useState<Inspiration | null>(null);
  const [adminAuthenticated, setAdminAuthenticated] = useState<boolean>(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);
  const [likedCreationIds, setLikedCreationIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_liked_creations`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Monitor Firebase Auth state securely — this is the ONLY source of truth for admin access
  const ADMIN_EMAIL = 'mutangilwaivan@gmail.com';

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user && !user.isAnonymous && user.email?.toLowerCase() === ADMIN_EMAIL) {
        setAdminAuthenticated(true);
        localStorage.setItem(`${STORAGE_KEY}_admin_auth`, 'true');
      } else {
        setAdminAuthenticated(false);
        localStorage.removeItem(`${STORAGE_KEY}_admin_auth`);
        localStorage.removeItem('maison_vans_admin_auth');
        localStorage.removeItem('maison_vans_admin_session');
      }
    });
    return () => unsubAuth();
  }, []);

  // Real-time Firestore Subscriptions with local cache resilience
  useEffect(() => {
    let unsubCreations: () => void = () => {};
    let unsubInspirations: () => void = () => {};
    let unsubOccasions: () => void = () => {};
    let unsubTestimonials: () => void = () => {};
    let unsubSettings: () => void = () => {};

    let hasSeeded = false;

    try {
      // 1. Subscribe to Creations collection
      const creationsRef = collection(db, 'creations');
      unsubCreations = onSnapshot(creationsRef, (snapshot) => {
        setIsFirebaseConnected(true);
        if (!snapshot.empty) {
          const list: Creation[] = [];
          snapshot.forEach((docSnap) => {
            list.push(normalizeCreation(docSnap.id, docSnap.data()));
          });
          setCreations(list);
          localStorage.setItem(`${STORAGE_KEY}_creations`, JSON.stringify(list));
        } else if (!hasSeeded) {
          hasSeeded = true;
          // Efficient batch seed
          const batch = writeBatch(db);
          INITIAL_CREATIONS.forEach((initItem) => {
            const itemRef = doc(db, 'creations', initItem.id);
            batch.set(itemRef, {
              ...initItem,
              misEnAvant: initItem.isFeatured || false,
            });
          });
          batch.commit().catch((err) => {
            console.warn('Seeding initial creations notice (cached locally):', err);
          });
        }
      }, (error) => {
        console.warn('Firestore creations notice (using offline cache):', error?.message || error);
      });

      // 2. Subscribe to Inspirations
      const inspirationsRef = collection(db, 'inspirations');
      unsubInspirations = onSnapshot(inspirationsRef, (snapshot) => {
        if (!snapshot.empty) {
          const list: Inspiration[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...docSnap.data() } as Inspiration);
          });
          setInspirations(list);
          localStorage.setItem(`${STORAGE_KEY}_inspirations`, JSON.stringify(list));
        }
      }, (err) => console.warn('Inspirations notice (using offline cache):', err?.message || err));

      // 3. Subscribe to Occasions
      const occasionsRef = collection(db, 'occasions');
      unsubOccasions = onSnapshot(occasionsRef, (snapshot) => {
        if (!snapshot.empty) {
          const list: Occasion[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...docSnap.data() } as Occasion);
          });
          setOccasions(list);
          localStorage.setItem(`${STORAGE_KEY}_occasions`, JSON.stringify(list));
        }
      }, (err) => console.warn('Occasions notice (using offline cache):', err?.message || err));

      // 4. Subscribe to Testimonials
      const testimonialsRef = collection(db, 'testimonials');
      unsubTestimonials = onSnapshot(testimonialsRef, (snapshot) => {
        if (!snapshot.empty) {
          const list: Testimonial[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...docSnap.data() } as Testimonial);
          });
          setTestimonials(list);
          localStorage.setItem(`${STORAGE_KEY}_testimonials`, JSON.stringify(list));
        }
      }, (err) => console.warn('Testimonials notice (using offline cache):', err?.message || err));

      // 5. Subscribe to Settings document
      const settingsRef = collection(db, 'settings');
      unsubSettings = onSnapshot(settingsRef, (snapshot) => {
        if (!snapshot.empty) {
          const firstDoc = snapshot.docs[0];
          if (firstDoc) {
            const data = firstDoc.data() as StudioSettings;
            setSettings(prev => ({ ...prev, ...data }));
            localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify({ ...INITIAL_STUDIO_SETTINGS, ...data }));
          }
        }
      }, (err) => console.warn('Settings notice (using offline cache):', err?.message || err));

    } catch (e) {
      console.warn('Firestore initialization fallback to local state:', e);
    }

    return () => {
      unsubCreations();
      unsubInspirations();
      unsubOccasions();
      unsubTestimonials();
      unsubSettings();
    };
  }, []);

  // Save changes to localStorage as fallback
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_creations`, JSON.stringify(creations));
  }, [creations]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_inspirations`, JSON.stringify(inspirations));
  }, [inspirations]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_occasions`, JSON.stringify(occasions));
  }, [occasions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_testimonials`, JSON.stringify(testimonials));
  }, [testimonials]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_admin_auth`, adminAuthenticated ? 'true' : 'false');
  }, [adminAuthenticated]);

  // Actions
  const addCreation = async (item: Omit<Creation, 'id' | 'createdAt' | 'slug'>) => {
    const slug = item.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const newId = `creat-${Date.now()}`;
    const newCreation: Creation = {
      ...item,
      id: newId,
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString().split('T')[0],
      isFeatured: Boolean(item.isFeatured || item.misEnAvant),
      misEnAvant: Boolean(item.isFeatured || item.misEnAvant),
    };

    setCreations(prev => [newCreation, ...prev]);

    try {
      await setDoc(doc(db, 'creations', newId), {
        ...newCreation,
        misEnAvant: newCreation.isFeatured,
      });
    } catch (e) {
      console.warn('Firestore add creation error (saved locally):', e);
    }
  };

  const updateCreation = async (id: string, data: Partial<Creation>) => {
    const updatedData = { ...data };
    if (updatedData.misEnAvant !== undefined) {
      updatedData.isFeatured = Boolean(updatedData.misEnAvant);
    } else if (updatedData.isFeatured !== undefined) {
      updatedData.misEnAvant = Boolean(updatedData.isFeatured);
    }

    setCreations(prev => prev.map(item => item.id === id ? { ...item, ...updatedData } : item));
    if (selectedCreationForDetail?.id === id) {
      setSelectedCreationForDetail(prev => prev ? { ...prev, ...updatedData } : null);
    }

    try {
      await setDoc(doc(db, 'creations', id), updatedData, { merge: true });
    } catch (e) {
      console.warn('Firestore update creation error:', e);
    }
  };

  const setFeaturedCreation = async (id: string) => {
    // Set this creation as featured/misEnAvant: true, and others to false
    setCreations(prev => prev.map(item => ({
      ...item,
      isFeatured: item.id === id,
      misEnAvant: item.id === id,
    })));

    try {
      const batch = writeBatch(db);
      creations.forEach((c) => {
        const cRef = doc(db, 'creations', c.id);
        batch.update(cRef, {
          isFeatured: c.id === id,
          misEnAvant: c.id === id,
        });
      });
      await batch.commit();
    } catch (e) {
      console.warn('Firestore batch update featured error:', e);
      try {
        await setDoc(doc(db, 'creations', id), { isFeatured: true, misEnAvant: true }, { merge: true });
      } catch (err) {
        console.warn('Firestore direct set featured error:', err);
      }
    }
  };

  const deleteCreation = async (id: string) => {
    setCreations(prev => prev.filter(item => item.id !== id));
    if (selectedCreationForDetail?.id === id) {
      setSelectedCreationForDetail(null);
    }

    try {
      await deleteDoc(doc(db, 'creations', id));
    } catch (e) {
      console.warn('Firestore delete creation error:', e);
    }
  };

  const toggleCreationAvailability = async (id: string) => {
    let nextAvailability = true;
    let nextBadge: 'Sur commande' | 'Pièce unique disponible' | 'En confection' = 'Sur commande';

    setCreations(prev => prev.map(item => {
      if (item.id === id) {
        nextAvailability = !item.isAvailable;
        nextBadge = nextAvailability ? 'Sur commande' : 'En confection';
        return {
          ...item,
          isAvailable: nextAvailability,
          availabilityBadge: nextBadge,
        };
      }
      return item;
    }));

    try {
      await setDoc(doc(db, 'creations', id), {
        isAvailable: nextAvailability,
        availabilityBadge: nextBadge,
      }, { merge: true });
    } catch (e) {
      console.warn('Firestore toggle availability error:', e);
    }
  };

  // Client-side rate limiter for likes
  const [lastLikeTimestamp, setLastLikeTimestamp] = useState<number>(0);
  const LIKE_COOLDOWN_MS = 2000; // 2 seconds between likes

  const toggleLikeCreation = async (creationId: string) => {
    const now = Date.now();
    if (now - lastLikeTimestamp < LIKE_COOLDOWN_MS) {
      return; // Rate limited — ignore rapid clicks
    }
    setLastLikeTimestamp(now);
    const isLiked = likedCreationIds.includes(creationId);
    const nextLikedIds = isLiked
      ? likedCreationIds.filter(id => id !== creationId)
      : [...likedCreationIds, creationId];
    
    setLikedCreationIds(nextLikedIds);
    localStorage.setItem(`${STORAGE_KEY}_liked_creations`, JSON.stringify(nextLikedIds));

    // Update creations in local state optimistically
    let updatedLikesCount = 0;
    setCreations(prev => prev.map(c => {
      if (c.id === creationId) {
        const currentLikes = c.likesCount || 0;
        updatedLikesCount = isLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;
        return { ...c, likesCount: updatedLikesCount };
      }
      return c;
    }));

    if (selectedCreationForDetail?.id === creationId) {
      setSelectedCreationForDetail(prev => prev ? {
        ...prev,
        likesCount: updatedLikesCount
      } : null);
    }

    try {
      await setDoc(doc(db, 'creations', creationId), { likesCount: updatedLikesCount }, { merge: true });
    } catch (e) {
      console.warn('Firestore like update note (saved locally):', e);
    }
  };

  // Sanitize text to prevent XSS injection
  const sanitizeText = (text: string): string => {
    return text
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  };

  const addCreationComment = async (creationId: string, commentData: Omit<CreationComment, 'id' | 'createdAt'>) => {
    // Sanitize and validate inputs
    const cleanName = sanitizeText(commentData.authorName || '').substring(0, 50) || 'Visiteuse de l\'Atelier';
    const cleanLocation = sanitizeText(commentData.authorLocation || '').substring(0, 50) || 'Kinshasa';
    const cleanContent = sanitizeText(commentData.content || '').substring(0, 500);

    if (!cleanContent || cleanContent.length < 3) {
      console.warn('Comment rejected: content too short or empty after sanitization.');
      return;
    }

    const newComment: CreationComment = {
      id: `comm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      authorName: cleanName,
      authorLocation: cleanLocation,
      content: cleanContent,
      rating: Math.min(5, Math.max(1, Math.round(commentData.rating || 5))),
      createdAt: new Date().toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
      isApproved: false, // Requires admin approval before display
    };

    let updatedComments: CreationComment[] = [];

    setCreations(prev => prev.map(c => {
      if (c.id === creationId) {
        updatedComments = [newComment, ...(c.comments || [])];
        return { ...c, comments: updatedComments };
      }
      return c;
    }));

    if (selectedCreationForDetail?.id === creationId) {
      setSelectedCreationForDetail(prev => prev ? {
        ...prev,
        comments: updatedComments
      } : null);
    }

    try {
      await setDoc(doc(db, 'creations', creationId), { comments: updatedComments }, { merge: true });
    } catch (e) {
      console.warn('Firestore comment sync note (saved locally):', e);
    }
  };

  const addInspiration = async (item: Omit<Inspiration, 'id' | 'createdAt'>) => {
    const newId = `insp-${Date.now()}`;
    const newInsp: Inspiration = {
      ...item,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setInspirations(prev => [newInsp, ...prev]);

    try {
      await setDoc(doc(db, 'inspirations', newId), newInsp);
    } catch (e) {
      console.warn('Firestore add inspiration error:', e);
    }
  };

  const updateInspiration = async (id: string, data: Partial<Inspiration>) => {
    setInspirations(prev => prev.map(item => item.id === id ? { ...item, ...data } : item));
    if (selectedInspirationForDetail?.id === id) {
      setSelectedInspirationForDetail(prev => prev ? { ...prev, ...data } : null);
    }

    try {
      await setDoc(doc(db, 'inspirations', id), data, { merge: true });
    } catch (e) {
      console.warn('Firestore update inspiration error:', e);
    }
  };

  const deleteInspiration = async (id: string) => {
    setInspirations(prev => prev.filter(item => item.id !== id));
    if (selectedInspirationForDetail?.id === id) {
      setSelectedInspirationForDetail(null);
    }

    try {
      await deleteDoc(doc(db, 'inspirations', id));
    } catch (e) {
      console.warn('Firestore delete inspiration error:', e);
    }
  };

  const addOccasion = async (item: Omit<Occasion, 'id' | 'slug'>) => {
    const slug = item.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const newId = `occ-${Date.now()}`;
    const newOcc: Occasion = {
      ...item,
      id: newId,
      slug: slug || `occ-${Date.now()}`,
    };
    setOccasions(prev => [...prev, newOcc]);

    try {
      await setDoc(doc(db, 'occasions', newId), newOcc);
    } catch (e) {
      console.warn('Firestore add occasion error:', e);
    }
  };

  const updateOccasion = async (id: string, data: Partial<Occasion>) => {
    setOccasions(prev => prev.map(item => item.id === id ? { ...item, ...data } : item));
    try {
      await setDoc(doc(db, 'occasions', id), data, { merge: true });
    } catch (e) {
      console.warn('Firestore update occasion error:', e);
    }
  };

  const deleteOccasion = async (id: string) => {
    setOccasions(prev => prev.filter(item => item.id !== id));
    try {
      await deleteDoc(doc(db, 'occasions', id));
    } catch (e) {
      console.warn('Firestore delete occasion error:', e);
    }
  };

  const addTestimonial = async (item: Omit<Testimonial, 'id'>) => {
    const newId = `test-${Date.now()}`;
    const newTest: Testimonial = {
      ...item,
      id: newId,
    };
    setTestimonials(prev => [newTest, ...prev]);
    try {
      await setDoc(doc(db, 'testimonials', newId), newTest);
    } catch (e) {
      console.warn('Firestore add testimonial error:', e);
    }
  };

  const updateTestimonial = async (id: string, data: Partial<Testimonial>) => {
    setTestimonials(prev => prev.map(item => item.id === id ? { ...item, ...data } : item));
    try {
      await setDoc(doc(db, 'testimonials', id), data, { merge: true });
    } catch (e) {
      console.warn('Firestore update testimonial error:', e);
    }
  };

  const deleteTestimonial = async (id: string) => {
    setTestimonials(prev => prev.filter(item => item.id !== id));
    try {
      await deleteDoc(doc(db, 'testimonials', id));
    } catch (e) {
      console.warn('Firestore delete testimonial error:', e);
    }
  };

  const toggleTestimonialVisibility = async (id: string) => {
    let nextVisibility = true;
    setTestimonials(prev => prev.map(item => {
      if (item.id === id) {
        nextVisibility = !item.isVisible;
        return { ...item, isVisible: nextVisibility };
      }
      return item;
    }));

    try {
      await setDoc(doc(db, 'testimonials', id), { isVisible: nextVisibility }, { merge: true });
    } catch (e) {
      console.warn('Firestore toggle testimonial error:', e);
    }
  };

  const updateSettings = async (data: Partial<StudioSettings>) => {
    setSettings(prev => ({ ...prev, ...data }));
    try {
      await setDoc(doc(db, 'settings', 'studio_config'), data, { merge: true });
    } catch (e) {
      console.warn('Firestore update settings error:', e);
    }
  };

  const resetToDefaults = async () => {
    setCreations(INITIAL_CREATIONS);
    setInspirations(INITIAL_INSPIRATIONS);
    setOccasions(INITIAL_OCCASIONS);
    setTestimonials(INITIAL_TESTIMONIALS);
    setSettings(INITIAL_STUDIO_SETTINGS);
    localStorage.removeItem(`${STORAGE_KEY}_creations`);
    localStorage.removeItem(`${STORAGE_KEY}_inspirations`);
    localStorage.removeItem(`${STORAGE_KEY}_occasions`);
    localStorage.removeItem(`${STORAGE_KEY}_testimonials`);
    localStorage.removeItem(`${STORAGE_KEY}_settings`);

    try {
      // Sync defaults to Firestore
      for (const c of INITIAL_CREATIONS) {
        await setDoc(doc(db, 'creations', c.id), {
          ...c,
          misEnAvant: c.isFeatured || false,
        });
      }
    } catch (e) {
      console.warn('Firestore reset error:', e);
    }
  };

  const exportDataJson = () => {
    return JSON.stringify({
      creations,
      inspirations,
      occasions,
      testimonials,
      settings,
      exportedAt: new Date().toISOString(),
    }, null, 2);
  };

  const importDataJson = async (jsonString: string): Promise<boolean> => {
    try {
      const data = JSON.parse(jsonString);
      if (data.creations) {
        setCreations(data.creations);
        for (const c of data.creations) {
          await setDoc(doc(db, 'creations', c.id), {
            ...c,
            misEnAvant: c.isFeatured || c.misEnAvant || false,
          });
        }
      }
      if (data.inspirations) {
        setInspirations(data.inspirations);
        for (const i of data.inspirations) {
          await setDoc(doc(db, 'inspirations', i.id), i);
        }
      }
      if (data.occasions) {
        setOccasions(data.occasions);
        for (const o of data.occasions) {
          await setDoc(doc(db, 'occasions', o.id), o);
        }
      }
      if (data.testimonials) {
        setTestimonials(data.testimonials);
        for (const t of data.testimonials) {
          await setDoc(doc(db, 'testimonials', t.id), t);
        }
      }
      if (data.settings) {
        setSettings(data.settings);
        await setDoc(doc(db, 'settings', 'studio_config'), data.settings);
      }
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  };

  return (
    <StudioContext.Provider
      value={{
        creations,
        inspirations,
        occasions,
        testimonials,
        settings,
        activeTab,
        setActiveTab,
        selectedOccasionFilter,
        setSelectedOccasionFilter,
        selectedCreationForDetail,
        setSelectedCreationForDetail,
        selectedInspirationForDetail,
        setSelectedInspirationForDetail,
        adminAuthenticated,
        setAdminAuthenticated,
        isFirebaseConnected,
        likedCreationIds,
        toggleLikeCreation,
        addCreationComment,
        addCreation,
        updateCreation,
        deleteCreation,
        toggleCreationAvailability,
        setFeaturedCreation,
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
        updateSettings,
        resetToDefaults,
        exportDataJson,
        importDataJson,
      }}
    >
      {children}
    </StudioContext.Provider>
  );
};

export const useStudio = () => {
  const context = useContext(StudioContext);
  if (!context) {
    throw new Error('useStudio must be used within a StudioProvider');
  }
  return context;
};
