import React from 'react';
import { useStudio } from '../context/StudioContext';
import { Star, MessageCircle, Quote } from 'lucide-react';
import { generateWhatsAppLink, buildGeneralContactMessage } from '../data/initialData';

export const TestimonialsSection: React.FC = () => {
  const { testimonials, settings } = useStudio();
  const visibleTestimonials = testimonials.filter(t => t.isVisible);

  const whatsappUrl = generateWhatsAppLink(
    settings.whatsappNumber,
    buildGeneralContactMessage(settings.studioName, undefined, 'Partager mon avis / Demande sur-mesure')
  );

  return (
    <section id="testimonials-section" className="py-16 sm:py-24 bg-[#FAF8F5] border-b border-[#EAE3DA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div 
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F0EBE3] border border-[#D8CFC4] text-[#8C7A6B] text-[10px] sm:text-[11px] font-bold tracking-[0.20em] uppercase shadow-xs"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <Star className="w-3.5 h-3.5 text-[#C5A880] fill-current" />
            <span>Témoignages & Émotions</span>
          </div>
          <h2 
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#181512]"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Ce Que Disent Nos Clientes
          </h2>
          <p 
            className="italic text-base sm:text-xl text-[#6B5F54] leading-relaxed"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            « La plus belle des récompenses est l'émotion d'une cliente lors de son dernier essayage. »
          </p>
        </div>

        {/* Testimonials Grid with 3D Elevation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {visibleTestimonials.map((item) => (
            <div
              key={item.id}
              id={`testimonial-card-${item.id}`}
              className="bg-white p-8 rounded-[32px] border border-[#E8E1D7]/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_rgba(27,67,50,0.12)] hover:border-[#C5A880]/60 transition-all duration-400 flex flex-col justify-between space-y-6 relative transform hover:-translate-y-1"
            >
              <Quote className="w-9 h-9 text-[#C5A880]/25 absolute top-6 right-6" />

              <div className="space-y-4">
                {/* Rating Stars */}
                <div className="flex items-center gap-1 text-[#C5A880]">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                {/* Feedback Text */}
                <p 
                  className="text-[13px] sm:text-sm text-[#4A423A] leading-relaxed italic"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                >
                  « {item.feedback} »
                </p>

                {item.creationName && (
                  <span 
                    className="inline-block px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#EAE3DA] text-[10.5px] font-bold tracking-wider text-[#1B4332]"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    ✨ {item.creationName}
                  </span>
                )}
              </div>

              {/* Author Info */}
              <div className="pt-4 border-t border-[#F2ECE4] flex items-center gap-3.5">
                {item.clientPhotoUrl ? (
                  <img
                    src={item.clientPhotoUrl}
                    alt={item.clientName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#C5A880]"
                  />
                ) : (
                  <div 
                    className="w-12 h-12 rounded-full bg-[#181512] text-[#C5A880] font-bold text-sm flex items-center justify-center border border-[#C5A880]/50"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    {item.clientName.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 
                    className="text-xs sm:text-sm font-bold text-[#181512]"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    {item.clientName}
                  </h4>
                  <span 
                    className="text-[11px] text-[#8C7A6B] block font-medium"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {item.eventType} • {item.date}
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Callout with Shimmer */}
        <div className="mt-14 text-center">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-shimmer inline-flex items-center gap-2.5 bg-[#181512] hover:bg-[#1B4332] text-[#FAF8F5] px-8 py-4 rounded-full text-xs font-bold uppercase tracking-[0.16em] transition-all duration-300 shadow-lg hover:shadow-2xl border border-[#3A322A] hover:border-[#2D6A4F]/60 cursor-pointer"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <MessageCircle className="w-4 h-4 text-[#25D366] fill-current" />
            <span>Rejoindre nos clientes comblées sur WhatsApp</span>
          </a>
        </div>

      </div>
    </section>
  );
};
