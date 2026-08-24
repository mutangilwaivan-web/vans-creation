export interface Creation {
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  description: string;
  longDescription: string;
  categories: string[]; // e.g. ["Robe de Mariée", "Haute Couture"]
  occasionId: string; // references Occasion.id
  occasionName: string;
  colors: string[]; // e.g. ["Noir Profond", "Bleu Saphir", "Doré"]
  fabrics: string[]; // e.g. ["Soie Sauvage", "Organza Métallisé", "Dentelle de Calais"]
  silhouette: string; // e.g. "Sculpturale & Évasée", "Fourreau Sirène"
  images: string[];
  videoUrl?: string; // MP4 link, web video or stream url
  videoThumbnail?: string; // Optional custom thumbnail for video
  priceEstimate?: string; // e.g. "Sur devis (à partir de 650€)"
  preparationTime?: string; // e.g. "3 à 5 semaines"
  isAvailable: boolean;
  availabilityBadge: 'Sur commande' | 'Pièce unique disponible' | 'En confection';
  customOptions: string[]; // e.g. ["Choix du décolleté", "Longueur de traîne ajustable", "Ajout de manches"]
  isFeatured: boolean;
  misEnAvant?: boolean; // Alias Firestore supporté (misEnAvant: true)
  createdAt: string;
}

export interface Inspiration {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  videoUrl?: string;
  category: string;
  occasion: string;
  colors: string[];
  styleTags: string[];
  isOriginalCreation: boolean; // True = "Création originale de l'Atelier", False = "Inspiration externe"
  sourceAuthor?: string; // e.g. "Pinterest / Vogue Runway", "Atelier Van's Archives"
  sourceNotes?: string;
  createdAt: string;
}

export interface Occasion {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  iconName?: string;
  displayOrder: number;
}

export interface Testimonial {
  id: string;
  clientName: string;
  eventType: string;
  feedback: string;
  rating: number;
  date: string;
  creationName?: string;
  clientPhotoUrl?: string;
  isVisible: boolean;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  editionTag: string;
  imageUrl: string;
  techniqueTag: string;
  compositionTag: string;
  ctaText: string;
  ctaAction: 'creations' | 'inspirations' | 'whatsapp' | 'contact';
}

export interface StudioSettings {
  studioName: string;
  designerName: string;
  tagline: string;
  subTagline: string;
  bio: string;
  atelierStory: string;
  experienceYears: number;
  creationsCount: number;
  satisfactionRate: number;
  whatsappNumber: string; // e.g. "+33612345678"
  email: string;
  instagram: string;
  pinterest: string;
  address: string;
  city: string;
  openingHours: string;
  heroSlides: HeroSlide[];
}

export type ActiveTab = 'home' | 'creations' | 'inspirations' | 'occasions' | 'about' | 'testimonials' | 'contact' | 'admin';
