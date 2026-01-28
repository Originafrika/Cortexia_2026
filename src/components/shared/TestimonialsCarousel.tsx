import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useState } from 'react';

// ============================================
// BEAUTY DESIGN SYSTEM — TESTIMONIALS CAROUSEL
// Rhétorique : Social proof
// Musique : Transitions fluides
// ============================================

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  avatar?: string;
  company?: string;
}

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
  autoPlay?: boolean;
  interval?: number;
  className?: string;
}

export function TestimonialsCarousel({
  testimonials,
  autoPlay = false,
  interval = 5000,
  className = '',
}: TestimonialsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div className={`relative ${className}`}>
      {/* Main card */}
      <div
        className="relative overflow-hidden rounded-3xl p-8 sm:p-12"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.03) 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(40px)',
        }}
      >
        {/* Quote icon */}
        <div className="absolute top-8 left-8 opacity-20">
          <Quote size={48} className="text-[#F5EBE0]" />
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10"
          >
            {/* Quote */}
            <blockquote className="text-lg sm:text-xl text-white/90 leading-relaxed mb-6">
              "{currentTestimonial.quote}"
            </blockquote>

            {/* Author */}
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F5EBE0]/20 to-[#E3D5CA]/20 border border-white/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-[#F5EBE0]">
                  {currentTestimonial.author.charAt(0)}
                </span>
              </div>

              {/* Info */}
              <div>
                <div className="font-semibold text-white">{currentTestimonial.author}</div>
                <div className="text-sm text-white/60">
                  {currentTestimonial.role}
                  {currentTestimonial.company && ` · ${currentTestimonial.company}`}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {testimonials.length > 1 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            {/* Prev button */}
            <button
              onClick={prevTestimonial}
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center group"
            >
              <ChevronLeft size={20} className="text-white/60 group-hover:text-white transition-colors" />
            </button>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentIndex ? 'w-8 bg-[#F5EBE0]' : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>

            {/* Next button */}
            <button
              onClick={nextTestimonial}
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center group"
            >
              <ChevronRight size={20} className="text-white/60 group-hover:text-white transition-colors" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
