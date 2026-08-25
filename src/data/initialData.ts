import { Creation, Inspiration, Occasion, Testimonial, StudioSettings } from '../types';

export const INITIAL_STUDIO_SETTINGS: StudioSettings = {
  studioName: "Van's Creation",
  designerName: "Vanessa Kaniki",
  tagline: "Modélisme Architectural & Haute Couture Sur-Mesure",
  subTagline: "L'art du vêtement sculpté pour magnifier votre silhouette lors de vos moments inoubliables.",
  bio: "Modéliste-couturière diplômée, Vanessa Kaniki conçoit chaque pièce comme une œuvre sculpturale unique. De la première esquisse au point d'ourlet invisible, votre vêtement est pensé, patronné et confectionné exclusivement pour vous.",
  atelierStory: "Fondé par Vanessa Kaniki à Kinshasa avec la passion des belles matières et du patronage d'exception, notre atelier digital Van's Creation allie la tradition des grandes maisons de couture à une approche contemporaine et personnalisée. Nous transformons vos désirs et vos inspirations en créations couture parfaitement ajustées à votre morphologie.",
  experienceYears: 8,
  creationsCount: 220,
  satisfactionRate: 100,
  whatsappNumber: "+243842732367",
  email: "mutangilwaivan@gmail.com",
  instagram: "@vans.creation",
  pinterest: "vanscreation_atelier",
  address: "Quartier Kimbwala, Commune de Mont-Ngafula",
  city: "Kinshasa, RDC",
  openingHours: "Lundi au Samedi : 09h00 - 18h30 (Sur rendez-vous)",
  heroSlides: [
    {
      id: 'slide-1',
      title: 'AURA — DYNASTIE BLEU NUIT & NOIR',
      subtitle: 'Drapé sculptural d’exception & tombé majestueux',
      editionTag: 'COLLECTION SIGNATURE 2026',
      imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=85',
      techniqueTag: 'Drapé, Pliage Architectural, Sculpture Textile',
      compositionTag: 'Soie métallique, Crêpe satiné lourd, Fils de saphir',
      ctaText: 'Explorer la Collection',
      ctaAction: 'creations',
    },
    {
      id: 'slide-2',
      title: 'DIGITAL COUTURE — ÉCHO ÉLÉGANCE',
      subtitle: 'Quand l’innovation rencontre la pureté du patronage',
      editionTag: 'MODÉLISME CONTEMPORAIN',
      imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=85',
      techniqueTag: 'Plissé accordéon, Col corolle rigide, Baleinage d’art',
      compositionTag: 'Mousseline noire d’art, Organza structuré',
      ctaText: 'Découvrir nos Réalisations',
      ctaAction: 'creations',
    },
    {
      id: 'slide-3',
      title: 'L’ÉCLAT INTEMPOREL — ROBE DE MARIÉE',
      subtitle: 'La robe de vos rêves façonnée à vos mesures exactes',
      editionTag: 'MARIAGES D’EXCEPTION',
      imageUrl: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=1600&q=85',
      techniqueTag: 'Dentelle perlée main, Bustier corset sur-mesure, Traîne amovible',
      compositionTag: 'Mikado de soie blanc pur, Tulle illusion, Perles nacrées',
      ctaText: 'Commander sur WhatsApp',
      ctaAction: 'whatsapp',
    },
    {
      id: 'slide-4',
      title: 'GALA & SOIRÉES PRESTIGIEUSES',
      subtitle: 'Allure audacieuse et finitions artisanales haute précision',
      editionTag: 'ÉDITION GALA PRIVÉ',
      imageUrl: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1600&q=85',
      techniqueTag: 'Coupe en biais fluide, Fente sculptée, Dos nu plongeant',
      compositionTag: 'Velours de soie moiré, Doublure en pongé de soie',
      ctaText: 'Carnet d’Inspirations',
      ctaAction: 'inspirations',
    }
  ]
};

export const INITIAL_OCCASIONS: Occasion[] = [
  {
    id: 'occ-mariage',
    name: 'Mariages & Cérémonies',
    slug: 'mariages',
    description: 'Robes de mariée d’exception, tenues civiles modernes, demoiselles d’honneur et mères des mariés.',
    coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    displayOrder: 1,
  },
  {
    id: 'occ-gala',
    name: 'Galas & Soirées Mondaines',
    slug: 'galas-soirees',
    description: 'Robes fourreaux, silhouettes de tapis rouge, bustiers architecturaux et finitions haute voltige.',
    coverImage: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=80',
    displayOrder: 2,
  },
  {
    id: 'occ-tailleur',
    name: 'Tailleurs & Ensembles Couture',
    slug: 'tailleurs-couture',
    description: 'Lignes épurées, vestes structurées à épaules marquées, pantalons palazzo et ensembles en soie.',
    coverImage: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80',
    displayOrder: 3,
  },
  {
    id: 'occ-cocktail',
    name: 'Cocktails & Réceptions',
    slug: 'cocktails-receptions',
    description: 'Robes midi fluides, drapés asymétriques et pièces chics prêtes à marquer les esprits.',
    coverImage: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1200&q=80',
    displayOrder: 4,
  },
  {
    id: 'occ-bapteme',
    name: 'Baptêmes & Fêtes de Famille',
    slug: 'fetes-famille',
    description: 'Tenues douces et raffinées en teintes poudrées pour célébrer vos plus beaux souvenirs.',
    coverImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
    displayOrder: 5,
  }
];

export const INITIAL_CREATIONS: Creation[] = [
  {
    id: 'creat-1',
    title: 'Robe Impériale "AURA Saphir"',
    subtitle: 'Création Signature 2026',
    slug: 'robe-imperiale-aura-saphir',
    description: 'Robe sculpturale en soie moirée avec cascade de plissés bicolores noir ébène et bleu saphir métallisé.',
    longDescription: 'Inspirée de la majesté des lignes architecturales contemporaines, cette création phare de l’Atelier propose un décolleté bateau à épaules architecturées, un buste gainant minutieusement baleiné et une double cascade de drapés au tombé lourd et étincelant. Conçue pour sublimer la démarche lors des galas et grandes réceptions.',
    categories: ['Haute Couture', 'Gala & Soirée', 'Création Signature'],
    occasionId: 'occ-gala',
    occasionName: 'Galas & Soirées Mondaines',
    colors: ['Bleu Saphir', 'Noir Ébène', 'Nuances Métalliques'],
    fabrics: ['Soie sauvage moirée', 'Organza plissé métallisé', 'Doublure satin duchesse', 'Baleinage couturier'],
    silhouette: 'Sculpturale & Évasée avec traîne impériale et bustier gainant',
    images: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=85', // Vue de Face
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1400&q=85', // Vue de Profil
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1400&q=85', // Vue de Dos / Traîne
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1400&q=85'  // Détail Tissage & Plissé
    ],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-black-dress-41584-large.mp4',
    priceEstimate: 'Sur devis (Confection sur-mesure dès 850$)',
    preparationTime: '4 à 6 semaines (2 séances d’essayage)',
    isAvailable: true,
    availabilityBadge: 'Sur commande',
    customOptions: [
      'Ajustement de l’amplitude et de la longueur de la traîne',
      'Déclinaison en velours de soie ou crêpe lourd',
      'Adaptation du décolleté (droit, bateau ou plongeant)',
      'Corset intérieur sculpté adapté à votre morphologie',
      'Choix des teintes parmi notre nuancier de soies'
    ],
    isFeatured: true,
    misEnAvant: true,
    createdAt: '2026-01-15',
  },
  {
    id: 'creat-2',
    title: 'Robe de Mariée "Céleste"',
    subtitle: 'Élégance Puriste & Traîne Royale',
    slug: 'robe-mariee-celeste',
    description: 'Robe de mariée en mikado de soie d’un blanc ivoire lumineux avec découpe princesse et boutonnage d’art au dos.',
    longDescription: 'Conçue pour une mariée qui recherche l’alliance absolue de la pureté des lignes et de la noblesse textile. La structure intérieure assure un maintien parfait sans aucune gêne tout au long de la journée de célébration, avec une traîne cathédrale majestueuse et des poches couture dissimulées.',
    categories: ['Mariage', 'Robe de Mariée', 'Sur-Mesure'],
    occasionId: 'occ-mariage',
    occasionName: 'Mariages & Cérémonies',
    colors: ['Blanc Ivoire', 'Blanc Pur', 'Blanc Cassé'],
    fabrics: ['Mikado de soie italien', 'Dentelle perlée artisanale', 'Tulle illusion', 'Doublure pongé de soie'],
    silhouette: 'Princesse épurée avec découpe princesse, corset intégré et traîne cathédrale',
    images: [
      'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=1400&q=85', // Vue de Face
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=85', // Vue d’ensemble
      'https://images.unsplash.com/photo-1546804784-896d0dca3805?auto=format&fit=crop&w=1400&q=85', // Vue de Dos & Traîne
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=85'  // Détail Dentelle & Perles
    ],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-in-a-white-dress-walking-on-a-beach-41484-large.mp4',
    priceEstimate: 'Sur devis (Confection sur-mesure dès 1 200$)',
    preparationTime: '6 à 8 semaines (avec 3 essayages dédiés)',
    isAvailable: true,
    availabilityBadge: 'Sur commande',
    customOptions: [
      'Traîne détachable ou relevable avec boutons d’ancrage pour la soirée',
      'Option manches longues amovibles en dentelle perlée',
      'Broderie personnalisée des initiales ou date au fil d’or sur la doublure',
      'Profondeur de dos nu ajustable selon vos souhaits'
    ],
    isFeatured: true,
    misEnAvant: true,
    createdAt: '2026-02-01',
  },
  {
    id: 'creat-3',
    title: 'Ensemble Tailleur "Olympe"',
    subtitle: 'Chic Intemporel & Lignes Tailleur Architecturées',
    slug: 'ensemble-tailleur-olympe',
    description: 'Veste cintrée à revers smoking satiné et pantalon palazzo à taille haute en crêpe de laine fluide.',
    longDescription: 'Une déclaration de pouvoir et de grâce féminine. Parfait pour un mariage civil audacieux ou un événement professionnel de prestige. Confectionné selon les méthodes traditionnelles de patronage tailleur avec entoilage traditionnel et finitions main.',
    categories: ['Tailleur', 'Mariage Civil', 'Sur-Mesure'],
    occasionId: 'occ-tailleur',
    occasionName: 'Tailleurs & Ensembles Couture',
    colors: ['Blanc Crème', 'Noir Profond', 'Vert Émeraude'],
    fabrics: ['Crêpe de laine fin', 'Satin de soie duchesse pour revers', 'Doublure jacquard respirante'],
    silhouette: 'Veste structurée à épaules tailleur & Pantalon palazzo taille haute',
    images: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1400&q=85', // Vue de Face
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1400&q=85', // Vue de Profil
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=85', // Vue d’ensemble
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1400&q=85'  // Détail Revers Satin
    ],
    priceEstimate: 'Sur devis (Dès 690$)',
    preparationTime: '3 à 4 semaines (2 essayages)',
    isAvailable: true,
    availabilityBadge: 'Pièce unique disponible',
    customOptions: [
      'Choix des boutons (dorés brossés, recouverts de tissu couture, ou nacre)',
      'Possibilité de jupe crayon taille haute à la place du pantalon palazzo',
      'Longueur de veste personnalisée (courte cropped ou longue redingote)',
      'Ajout d’une ceinture bijou amovible assortie'
    ],
    isFeatured: true,
    misEnAvant: true,
    createdAt: '2026-02-10',
  },
  {
    id: 'creat-4',
    title: 'Fourreau Drapé "Étoile Noire"',
    subtitle: 'Sculpture Haute Couture & Plissé Éventail',
    slug: 'fourreau-drape-etoile-noire',
    description: 'Robe de soirée asymétrique avec col sculpté corolle en plissé accordéon et fente haute galbante.',
    longDescription: 'Une création audacieuse qui capte la lumière à chaque mouvement. Le col architectural encadre le port de tête avec une élégance théâtrale, tandis que la coupe fourreau affine et galbe la silhouette.',
    categories: ['Gala & Soirée', 'Haute Couture'],
    occasionId: 'occ-gala',
    occasionName: 'Galas & Soirées Mondaines',
    colors: ['Noir Onyx', 'Bleu Nuit', 'Bordeaux Impérial'],
    fabrics: ['Mousseline plissée soleil', 'Crêpe envers satin lourd', 'Doublure stretch gainante'],
    silhouette: 'Fourreau sculptant le corps avec fente latérale haute et col corolle',
    images: [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1400&q=85', // Vue de Face
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=85', // Vue de Profil
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1400&q=85', // Vue de Dos
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1400&q=85'  // Détail Plissé Soleil
    ],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-model-posing-in-a-fashion-dress-41588-large.mp4',
    priceEstimate: 'Sur devis (Dès 750$)',
    preparationTime: '3 à 5 semaines',
    isAvailable: true,
    availabilityBadge: 'Sur commande',
    customOptions: [
      'Hauteur de la fente réglable selon vos préférences de confort',
      'Version avec ou sans traîne asymétrique de côté',
      'Option couleur Bordeaux Impérial, Vert Bouteille ou Champagne'
    ],
    isFeatured: false,
    misEnAvant: false,
    createdAt: '2026-02-12',
  },
  {
    id: 'creat-5',
    title: 'Robe Cérémonie "Aurore Poudrée"',
    subtitle: 'Douceur, Poésie & Romantisme Flou',
    slug: 'robe-ceremonie-aurore-poudree',
    description: 'Robe midi vaporeuse en mousseline de soie rose poudré avec manches lanternes transparentes et taille marquée.',
    longDescription: 'Idéale pour un baptême, un cocktail de printemps ou en tant que témoin de mariage. Légère comme un souffle, le volume aérien de la jupe danse à chaque pas avec une grâce naturelle.',
    categories: ['Cocktail', 'Cérémonie', 'Romantique'],
    occasionId: 'occ-cocktail',
    occasionName: 'Cocktails & Réceptions',
    colors: ['Rose Poudré', 'Nude', 'Lavande Douce', 'Bleu Ciel'],
    fabrics: ['Mousseline de soie vaporeuse', 'Doublure viscose respirante', 'Biais en satin'],
    silhouette: 'Évasée taille haute avec jeu de transparence aux manches lanternes',
    images: [
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1400&q=85', // Vue de Face
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=85', // Vue de Profil
      'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=1400&q=85', // Vue de Dos
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1400&q=85'  // Détail Mousseline & Transparence
    ],
    priceEstimate: 'Sur devis (Dès 480$)',
    preparationTime: '2 à 3 semaines',
    isAvailable: true,
    availabilityBadge: 'En confection',
    customOptions: [
      'Choix de la longueur (midi sous le genou, chevilles ou longue)',
      'Manches courtes bouffantes, 3/4 ou longues avec poignets boutonnés',
      'Ceinture amovible avec boucle dorée ou ruban noué'
    ],
    isFeatured: false,
    misEnAvant: false,
    createdAt: '2026-02-18',
  },
  {
    id: 'creat-6',
    title: 'Robe de Gala "Reine de Saba"',
    subtitle: 'Majesté Africaine & Broderies Fil d’Or',
    slug: 'robe-gala-reine-de-saba',
    description: 'Robe fourreau magistrale en velours de soie noir profond réhaussée de plastrons brodés au fil d’or et perles de rocaille.',
    longDescription: 'Inspirée de la puissance et de la noblesse des parures royales africaines, cette création d’exception allie le velours de soie impérial à un col officier sculpté et une fente arrière boutonnée d’or. Chaque perle et fil métallique est posé patiemment à la main dans notre atelier de Kinshasa.',
    categories: ['Haute Couture', 'Gala & Soirée', 'Création Signature'],
    occasionId: 'occ-gala',
    occasionName: 'Galas & Soirées Mondaines',
    colors: ['Noir Impérial', 'Or Antique', 'Bronze Solaire'],
    fabrics: ['Velours de soie lourd', 'Plastron brodé or fait main', 'Doublure satin duchesse champagne'],
    silhouette: 'Fourreau royal avec col officier et fente arrière bordée d’or',
    images: [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1400&q=85', // Vue de Face
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1400&q=85', // Vue de Profil
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=85', // Vue de Dos
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1400&q=85'  // Détail Broderie Fil d’Or
    ],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-glittering-dress-41590-large.mp4',
    priceEstimate: 'Sur devis (Confection sur-mesure dès 950$)',
    preparationTime: '4 à 6 semaines (3 essayages)',
    isAvailable: true,
    availabilityBadge: 'Sur commande',
    customOptions: [
      'Personnalisation du motif des broderies d’or',
      'Option traîne impériale en velours assortie',
      'Déclinaison en vert émeraude impérial ou bordeaux royal',
      'Doublure thermique ou légère selon la saison'
    ],
    isFeatured: true,
    misEnAvant: true,
    createdAt: '2026-02-20',
  },
  {
    id: 'creat-7',
    title: 'Ensemble Capeline "Kinshasa Prestige"',
    subtitle: 'Élégance Événementielle & Lignes Souveraines',
    slug: 'ensemble-capeline-kinshasa-prestige',
    description: 'Ensemble deux pièces avec cape asymétrique amovible et pantalon fuseau en satin de soie ivoire nacré.',
    longDescription: 'Conçu pour faire sensation lors des réceptions mondaines, mariages civils ou cérémonies d’apparat. La cape drapée flotte avec légèreté sur l’épaule tandis que le pantalon gainant allonge majestueusement la silhouette.',
    categories: ['Tailleur', 'Cérémonie', 'Mariage Civil'],
    occasionId: 'occ-tailleur',
    occasionName: 'Tailleurs & Ensembles Couture',
    colors: ['Ivoire Nacré', 'Champagne Doré', 'Bleu Cobalt'],
    fabrics: ['Satin de soie lourd nacré', 'Crêpe envers satin', 'Boutons bijou cristaux'],
    silhouette: 'Cape drapée asymétrique & Pantalon fuseau taille haute',
    images: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1400&q=85', // Vue de Face
      'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=1400&q=85', // Vue d’ensemble
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1400&q=85', // Vue de Dos
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=85'  // Détail Cape & Satin
    ],
    priceEstimate: 'Sur devis (Dès 720$)',
    preparationTime: '3 à 4 semaines',
    isAvailable: true,
    availabilityBadge: 'Pièce unique disponible',
    customOptions: [
      'Cape amovible avec système de pression invisible',
      'Version avec jupe droite fendue à la place du pantalon',
      'Choix des fermoirs bijou ouvragés'
    ],
    isFeatured: false,
    misEnAvant: false,
    createdAt: '2026-02-21',
  },
  {
    id: 'creat-8',
    title: 'Robe Cocktail "Orchidée Noire"',
    subtitle: 'Graphisme Épuré & Décolleté Origami',
    slug: 'robe-cocktail-orchidee-noire',
    description: 'Robe courte sculptée à découpes origami au buste, en gazar de soie noir intense avec dos géométrique.',
    longDescription: 'Une création moderne, ultra-chic et affirmée. Le gazar de soie confère une tenue structurelle impeccable aux plis origami, idéale pour les vernissages, cocktails et soirées de distinction.',
    categories: ['Cocktail', 'Haute Couture', 'Contemporain'],
    occasionId: 'occ-cocktail',
    occasionName: 'Cocktails & Réceptions',
    colors: ['Noir Intense', 'Rouge Carmin', 'Bleu Nuit'],
    fabrics: ['Gazar de soie texturé', 'Taffetas de soie', 'Doublure stretch'],
    silhouette: 'Trapèze structuré avec plastron origami et dos nu géométrique',
    images: [
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1400&q=85', // Vue de Face
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1400&q=85', // Vue de Profil
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=85', // Vue de Dos
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1400&q=85'  // Détail Découpe Origami
    ],
    priceEstimate: 'Sur devis (Dès 540$)',
    preparationTime: '2 à 3 semaines',
    isAvailable: true,
    availabilityBadge: 'Sur commande',
    customOptions: [
      'Longueur réglable (mi-cuisse, dessus du genou ou genou)',
      'Décolleté dos plus ou moins plongeant selon demande',
      'Doublure contrastée en soie rouge ou or'
    ],
    isFeatured: false,
    misEnAvant: false,
    createdAt: '2026-02-22',
  }
];

export const INITIAL_INSPIRATIONS: Inspiration[] = [
  {
    id: 'insp-1',
    title: 'Drapé Sculptural Haute Couture',
    description: 'Volume architectural asymétrique, dégradé bleu nuit et texture métallique étincelante.',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85',
    category: 'Haute Couture',
    occasion: 'Galas & Soirées Mondaines',
    colors: ['Bleu Saphir', 'Noir', 'Argenté'],
    styleTags: ['Sculptural', 'Avant-Garde', 'Drapé'],
    isOriginalCreation: true,
    sourceAuthor: "Atelier Maison Van's — Pièce Signature",
    sourceNotes: 'Modèle original conçu et réalisé dans notre atelier parisien.',
    createdAt: '2026-02-01',
  },
  {
    id: 'insp-2',
    title: 'Col Corolle Plissé Accordéon',
    description: 'Encolure graphique inspirée de la fleur d’arum, contrastée par un buste minimaliste épuré.',
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=85',
    category: 'Modélisme Contemporain',
    occasion: 'Galas & Soirées Mondaines',
    colors: ['Noir Onyx', 'Blanc Crème'],
    styleTags: ['Minimaliste', 'Architecture', 'Plissé'],
    isOriginalCreation: true,
    sourceAuthor: "Atelier Maison Van's — Collection Écho",
    sourceNotes: 'Technique exclusive de plissage manuel sur mesure.',
    createdAt: '2026-02-05',
  },
  {
    id: 'insp-3',
    title: 'Robe de Mariée Minimaliste en Crêpe Lourd',
    description: 'Ligne fluide avec dos nu géométrique, fente subtile et petite traîne fluide.',
    imageUrl: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=1000&q=85',
    category: 'Mariage Moderne',
    occasion: 'Mariages & Cérémonies',
    colors: ['Blanc Ivoire', 'Blanc Neige'],
    styleTags: ['Épuré', 'Moderne', 'Dos Nu'],
    isOriginalCreation: false,
    sourceAuthor: 'Tendance Internationale / Pinterest Runway',
    sourceNotes: 'Inspiration réalisable sur mesure avec vos tissus et mensurations préférés.',
    createdAt: '2026-02-10',
  },
  {
    id: 'insp-4',
    title: 'Tailleur Pantalon Satiné Vert Émeraude',
    description: 'Veste smoking oversize ceinturée et pantalon à pinces tombé fluide.',
    imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=85',
    category: 'Tailleur Chic',
    occasion: 'Tailleurs & Ensembles Couture',
    colors: ['Vert Émeraude', 'Or Brossé'],
    styleTags: ['Power Dressing', 'Satin', 'Élégance'],
    isOriginalCreation: false,
    sourceAuthor: 'Inspiration Runway Milan 2026',
    sourceNotes: 'Reproduisible et personnalisable avec coupe ajustée à votre morphologie.',
    createdAt: '2026-02-12',
  },
  {
    id: 'insp-5',
    title: 'Robe Fourreau Mousseline & Fente Haute',
    description: 'Jeu de drapé fluide au niveau des hanches pour allonger la silhouette avec sensualité.',
    imageUrl: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=85',
    category: 'Soirée de Gala',
    occasion: 'Galas & Soirées Mondaines',
    colors: ['Noir Profond', 'Or'],
    styleTags: ['Fourreau', 'Glamour', 'Fente'],
    isOriginalCreation: true,
    sourceAuthor: "Atelier Maison Van's — Archives Soirée",
    sourceNotes: 'Pièce originale réalisée sur mesure pour le Festival de Cannes.',
    createdAt: '2026-02-14',
  },
  {
    id: 'insp-6',
    title: 'Robe de Cocktail Plumes & Organza Délicat',
    description: 'Silhouette cocktail courte aux finitions féériques pour fêtes et fiançailles.',
    imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=85',
    category: 'Cocktail & Fiançailles',
    occasion: 'Cocktails & Réceptions',
    colors: ['Champagne', 'Pêche Nude'],
    styleTags: ['Festif', 'Romantique', 'Court'],
    isOriginalCreation: false,
    sourceAuthor: 'Inspiration Moodboard Haute Joaillerie & Couture',
    sourceNotes: 'Conception adaptable en version longue ou courte.',
    createdAt: '2026-02-15',
  }
];

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    clientName: 'Camille D.',
    eventType: 'Mariage en Provence (Robe Céleste)',
    feedback: 'Vanessa a su comprendre immédiatement ce que je voulais avant même que je sache l’exprimer. Ma robe était d’un confort absolu et a fait sensation auprès de tous nos invités. Une véritable fée du sur-mesure !',
    rating: 5,
    date: 'Janvier 2026',
    creationName: 'Robe de Mariée "Céleste"',
    clientPhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    isVisible: true,
  },
  {
    id: 'test-2',
    clientName: 'Sarah B.',
    eventType: 'Gala de Bienfaisance (Robe AURA)',
    feedback: 'Le drapé était digne des plus grands défilés parisiens. La coupe mettait ma silhouette en valeur avec une élégance folle. La communication sur WhatsApp pour les essayages a été ultra fluide.',
    rating: 5,
    date: 'Décembre 2025',
    creationName: 'Robe Impériale "AURA Saphir"',
    clientPhotoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    isVisible: true,
  },
  {
    id: 'test-3',
    clientName: 'Éléonore L.',
    eventType: 'Mariage Civil (Tailleur Olympe)',
    feedback: 'Je voulais fuir la robe classique pour mon mariage civil. Le tailleur blanc confectionné par Vanessa était d’une coupe magistrale. Les tissus sont d’une qualité rare. Merci mille fois !',
    rating: 5,
    date: 'Novembre 2025',
    creationName: 'Ensemble Tailleur "Olympe"',
    clientPhotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    isVisible: true,
  }
];

// Helper functions for WhatsApp Conversion & Sharing
export function cleanWhatsAppNumber(phone: string): string {
  return phone.replace(/[^\d+]/g, '').replace('+', '');
}

export function generateWhatsAppLink(phoneNumber: string, message: string): string {
  const cleanPhone = cleanWhatsAppNumber(phoneNumber);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

export function buildCreationOrderMessage(
  creationOrStudio: Creation | string,
  studioOrTitle?: string,
  priceEstimate?: string,
  silhouette?: string
): string {
  if (typeof creationOrStudio === 'object') {
    const creation = creationOrStudio;
    const studioName = studioOrTitle || "Maison Van's";
    return `Bonjour ${studioName},
Je souhaite échanger avec vous au sujet de votre création :
*${creation.title}*
Référence : ${creation.slug || creation.id}
Occasion : ${creation.occasionName || (creation.categories && creation.categories[0]) || 'Haute Couture'}
Silhouette : ${creation.silhouette || 'Sur-mesure'}

J’aimerais connaître les modalités de confection sur-mesure, les délais et convenir d'un rendez-vous d'essayage privé à l'atelier.

Merci d'avance.`;
  } else {
    const studioName = creationOrStudio;
    const title = studioOrTitle || 'Création Sur-Mesure';
    const sil = silhouette ? `\nSilhouette : ${silhouette}` : '';
    const price = priceEstimate ? `\nEstimation : ${priceEstimate}` : '';
    return `Bonjour ${studioName},\nJe suis vivement intéressée par votre création « *${title}* »${sil}${price}.\n\nJ'aimerais échanger sur la confection sur-mesure et convenir d'un rendez-vous d'essayage. Merci.`;
  }
}

export function buildInspirationOrderMessage(inspiration: Inspiration, studioName: string): string {
  const originTag = inspiration.isOriginalCreation 
    ? "votre création originale" 
    : "l’inspiration de style";

  return `Bonjour ${studioName},
J’ai particulièrement apprécié ${originTag} présentée sur votre Atelier Digital :
*${inspiration.title}* (${inspiration.category})
Occasion : ${inspiration.occasion}

Serait-il possible de concevoir une pièce sur-mesure adaptée à ma morphologie et à mes mensurations ?

J’aimerais échanger avec vous sur les étoffes et convenir d'une consultation. Merci.`;
}

export function buildCreationShareMessage(creation: Creation, studioName: string, shareUrl: string, phone: string): string {
  const fabricsText = creation.fabrics && creation.fabrics.length > 0 ? creation.fabrics.join(', ') : 'Étoffes nobles';
  const videoMention = creation.videoUrl ? "\nVidéo du défilé disponible sur la fiche officielle." : "";
  return `${creation.title.toUpperCase()}
Maison Van's • Haute Couture & Patronage Sur-Mesure
Direction de création : Vanessa Kaniki (Kinshasa)

Caractéristiques du modèle :
- Occasion : ${creation.occasionName}
- Silhouette : ${creation.silhouette}
- Étoffes : ${fabricsText}
- Confection : 100% sur-mesure${videoMention}

Consulter la fiche détaillée et le catalogue :
${shareUrl}

Consultation et essayage privé : ${phone || '+243 842 732 367'}`;
}

export function buildInspirationShareMessage(inspiration: Inspiration, studioName: string, shareUrl: string): string {
  return `${inspiration.title.toUpperCase()} — Carnet d'Inspirations | ${studioName}
Catégorie : ${inspiration.category} • Occasion : ${inspiration.occasion}

Création et réinterprétation sur-mesure par l'Atelier Vanessa Kaniki.
Découvrir la fiche du modèle et le catalogue :
${shareUrl}`;
}

export function buildGeneralContactMessage(studioName: string, clientName?: string, eventType?: string, eventDate?: string): string {
  let msg = `Bonjour ${studioName},\nJe souhaite échanger avec vous pour un projet de création sur-mesure.`;
  if (clientName) msg += `\nNom : ${clientName}`;
  if (eventType) msg += `\nÉvénement : ${eventType}`;
  if (eventDate) msg += `\nDate prévue : ${eventDate}`;
  msg += `\nPouvons-nous convenir d'un rendez-vous ou d'un premier échange ? Merci.`;
  return msg;
}
