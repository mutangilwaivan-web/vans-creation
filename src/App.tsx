import React, { useEffect } from 'react';
import { StudioProvider, useStudio } from './context/StudioContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CreationsSection } from './components/CreationsSection';
import { CreationDetailModal } from './components/CreationDetailModal';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { AdminPanel } from './components/AdminPanel';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Footer } from './components/Footer';

const AppContent: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    creations, 
    selectedCreationForDetail, 
    setSelectedCreationForDetail 
  } = useStudio();

  // Handle URL deep-linking on initial load or URL change (e.g. shared WhatsApp/Instagram links)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const creationId = params.get('robe') || params.get('creation') || params.get('modele') || params.get('model');
      const tabParam = params.get('tab');

      if (creationId && creations.length > 0) {
        const found = creations.find(c => c.id === creationId || c.slug === creationId || c.title.toLowerCase().replace(/\s+/g, '-') === creationId);
        if (found) {
          setActiveTab('creations');
          setSelectedCreationForDetail(found);
          return;
        }
      }

      if (tabParam && ['home', 'creations', 'about', 'contact', 'admin'].includes(tabParam)) {
        setActiveTab(tabParam as any);
      }
    } catch (e) {
      // Ignore URL parsing errors
    }
  }, [creations, setActiveTab, setSelectedCreationForDetail]);

  // Scroll to top on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E1B18] antialiased flex flex-col justify-between" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}>
      
      {/* Sticky Navigation: Strictly hidden on the Home page */}
      {activeTab !== 'home' && <Navbar />}

      {/* Main Content Sections */}
      <main className="flex-grow">
        
        {/* PAGE 1: Accueil Héroïque Format Poster Haute Couture */}
        {activeTab === 'home' && (
          <HeroSection />
        )}

        {/* PAGE 2: Galerie des Pièces d'Exception & Catalogue Sur-Mesure */}
        {(activeTab === 'creations' || activeTab === 'occasions' || activeTab === 'inspirations') && (
          <div className="pt-14 sm:pt-20">
            <CreationsSection />
          </div>
        )}

        {/* PAGE 3: L'Atelier & Savoir-Faire de Vanessa Kaniki */}
        {(activeTab === 'about' || activeTab === 'testimonials') && (
          <div className="pt-14 sm:pt-20">
            <AboutSection />
          </div>
        )}

        {/* PAGE 4: Contact & Rendez-Vous */}
        {activeTab === 'contact' && (
          <div className="pt-16 sm:pt-20">
            <ContactSection />
          </div>
        )}

        {/* Espace Privé Atelier Admin */}
        {activeTab === 'admin' && (
          <div className="pt-16 sm:pt-20">
            <AdminPanel />
          </div>
        )}
      </main>

      {/* Quick View / Fiche Couture Modal for Creations */}
      {selectedCreationForDetail && <CreationDetailModal />}

      {/* Floating WhatsApp Action Button (discreet & clean) */}
      {activeTab !== 'admin' && activeTab !== 'home' && <FloatingWhatsApp />}

      {/* Global Footer (shown on inner pages) */}
      {activeTab !== 'home' && <Footer />}
      
    </div>
  );
};

export function App() {
  return (
    <StudioProvider>
      <AppContent />
    </StudioProvider>
  );
}

export default App;
