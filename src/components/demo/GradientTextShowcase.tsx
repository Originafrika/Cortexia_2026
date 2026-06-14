/**
 * GRADIENT TEXT SHOWCASE
 * Démonstration de tous les effets de texte gradient disponibles
 * 
 * Usage: Import et afficher pour voir les exemples
 * Date: 2 Janvier 2026
 */

import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Crown, Zap, Star } from 'lucide-react';

export function GradientTextShowcase() {
  return (
    <div className="min-h-screen bg-black text-white p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="
            text-5xl sm:text-6xl 
            font-bold 
            bg-gradient-to-r from-white via-purple-300 to-pink-300 
            bg-clip-text 
            text-transparent
          ">
            🎨 Jolis Textes Gradient
          </h1>
          <p className="text-gray-400 text-lg">
            Tous les effets de texte utilisés dans Coconut V14
          </p>
        </motion.div>

        {/* Section 1: Basic Gradients */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white border-l-4 border-purple-500 pl-4">
            1. Gradients Basiques
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Exemple 1 */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <p className="text-sm text-gray-400 mb-3">Coconut Warm</p>
              <h3 className="
                text-4xl 
                font-bold 
                bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] 
                bg-clip-text 
                text-transparent
              ">
                Créez avec l'IA
              </h3>
              <code className="text-xs text-gray-500 mt-2 block">
                from-[var(--coconut-shell)] to-[var(--coconut-palm)]
              </code>
            </div>

            {/* Exemple 2 */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <p className="text-sm text-gray-400 mb-3">Purple-Pink Tech</p>
              <h3 className="
                text-4xl 
                font-bold 
                bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] 
                bg-clip-text 
                text-transparent
              ">
                Ultra Premium
              </h3>
              <code className="text-xs text-gray-500 mt-2 block">
                from-[#6366f1] to-[#8b5cf6]
              </code>
            </div>

            {/* Exemple 3 */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <p className="text-sm text-gray-400 mb-3">Cyan-Purple</p>
              <h3 className="
                text-4xl 
                font-bold 
                bg-gradient-to-r from-cyan-500 to-purple-500 
                bg-clip-text 
                text-transparent
              ">
                Coconut V14
              </h3>
              <code className="text-xs text-gray-500 mt-2 block">
                from-cyan-500 to-purple-500
              </code>
            </div>

            {/* Exemple 4 */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <p className="text-sm text-gray-400 mb-3">Gold Luxe</p>
              <h3 className="
                text-4xl 
                font-bold 
                bg-gradient-to-r from-yellow-300 via-amber-500 to-orange-500 
                bg-clip-text 
                text-transparent
              ">
                Expérience Or
              </h3>
              <code className="text-xs text-gray-500 mt-2 block">
                from-yellow-300 via-amber-500 to-orange-500
              </code>
            </div>
          </div>
        </section>

        {/* Section 2: Advanced Gradients */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white border-l-4 border-cyan-500 pl-4">
            2. Gradients Avancés (3 couleurs)
          </h2>
          
          <div className="grid grid-cols-1 gap-6">
            {/* Rainbow Pastel */}
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <p className="text-sm text-gray-400 mb-3">Rainbow Pastel</p>
              <h3 className="
                text-5xl 
                font-bold 
                bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 
                bg-clip-text 
                text-transparent
              ">
                Temple de Création Divine
              </h3>
              <code className="text-xs text-gray-500 mt-2 block">
                from-purple-300 via-pink-300 to-blue-300
              </code>
            </div>

            {/* White Cream Milk */}
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <p className="text-sm text-gray-400 mb-3">Coconut Subtle</p>
              <h3 className="
                text-5xl 
                font-bold 
                bg-gradient-to-r from-white via-[var(--coconut-cream)] to-[var(--coconut-milk)] 
                bg-clip-text 
                text-transparent
              ">
                Créez l'Impossible
              </h3>
              <code className="text-xs text-gray-500 mt-2 block">
                from-white via-[var(--coconut-cream)] to-[var(--coconut-milk)]
              </code>
            </div>
          </div>
        </section>

        {/* Section 3: Badges & Labels */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white border-l-4 border-pink-500 pl-4">
            3. Badges & Labels
          </h2>
          
          <div className="flex flex-wrap gap-4">
            {/* Badge 1: Premium */}
            <span className="
              px-4 py-2 
              text-sm font-bold 
              bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 
              bg-clip-text 
              text-transparent 
              border-2 border-purple-300 
              rounded-full
            ">
              ✨ PREMIUM
            </span>

            {/* Badge 2: New */}
            <span className="
              px-4 py-2 
              text-sm font-bold 
              bg-gradient-to-r from-cyan-500 to-purple-500 
              bg-clip-text 
              text-transparent 
              border-2 border-cyan-500 
              rounded-full
            ">
              🆕 NEW
            </span>

            {/* Badge 3: Ultra */}
            <span className="
              px-4 py-2 
              text-sm font-bold 
              bg-gradient-to-r from-orange-500 to-red-500 
              bg-clip-text 
              text-transparent 
              border-2 border-orange-500 
              rounded-full
            ">
              🔥 ULTRA
            </span>

            {/* Badge 4: Pro */}
            <span className="
              px-4 py-2 
              text-sm font-bold 
              bg-gradient-to-r from-green-500 to-emerald-500 
              bg-clip-text 
              text-transparent 
              border-2 border-green-500 
              rounded-full
            ">
              ⚡ PRO
            </span>

            {/* Badge 5: Coconut */}
            <span className="
              px-4 py-2 
              text-sm font-bold 
              bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] 
              bg-clip-text 
              text-transparent 
              border-2 border-[var(--coconut-shell)] 
              rounded-full
            ">
              🥥 COCONUT
            </span>
          </div>
        </section>

        {/* Section 4: With Icons */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white border-l-4 border-amber-500 pl-4">
            4. Avec Icons
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1 */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-purple-400" />
                <h3 className="
                  text-3xl 
                  font-bold 
                  bg-gradient-to-r from-purple-400 to-pink-400 
                  bg-clip-text 
                  text-transparent
                ">
                  Créativité
                </h3>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3">
                <Crown className="w-8 h-8 text-yellow-400" />
                <h3 className="
                  text-3xl 
                  font-bold 
                  bg-gradient-to-r from-yellow-400 to-orange-400 
                  bg-clip-text 
                  text-transparent
                ">
                  Premium
                </h3>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3">
                <Zap className="w-8 h-8 text-cyan-400" />
                <h3 className="
                  text-3xl 
                  font-bold 
                  bg-gradient-to-r from-cyan-400 to-blue-400 
                  bg-clip-text 
                  text-transparent
                ">
                  Rapidité
                </h3>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3">
                <Star className="w-8 h-8 text-pink-400" />
                <h3 className="
                  text-3xl 
                  font-bold 
                  bg-gradient-to-r from-pink-400 to-rose-400 
                  bg-clip-text 
                  text-transparent
                ">
                  Excellence
                </h3>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Animated (Hover Effects) */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white border-l-4 border-green-500 pl-4">
            5. Effets Animés
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Animated 1 */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/5 rounded-2xl p-8 border border-white/10 cursor-pointer"
            >
              <h3 className="
                text-4xl 
                font-bold 
                bg-gradient-to-r from-purple-500 to-pink-500 
                bg-clip-text 
                text-transparent
                transition-all
              ">
                Hover Me!
              </h3>
              <p className="text-sm text-gray-400 mt-2">Scale on hover</p>
            </motion.div>

            {/* Animated 2 */}
            <motion.div
              whileHover={{ rotate: 2 }}
              className="bg-white/5 rounded-2xl p-8 border border-white/10 cursor-pointer"
            >
              <h3 className="
                text-4xl 
                font-bold 
                bg-gradient-to-r from-cyan-500 to-blue-500 
                bg-clip-text 
                text-transparent
                transition-all
              ">
                Rotate!
              </h3>
              <p className="text-sm text-gray-400 mt-2">Rotate on hover</p>
            </motion.div>
          </div>
        </section>

        {/* Section 6: Buttons */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white border-l-4 border-red-500 pl-4">
            6. Buttons avec Gradients
          </h2>
          
          <div className="flex flex-wrap gap-4">
            {/* Button 1: Gradient Background */}
            <button className="
              px-8 py-4 
              rounded-2xl 
              bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] 
              text-white 
              font-bold 
              shadow-lg shadow-[#6366f1]/30
              transition-all
              hover:shadow-[#6366f1]/50
              active:scale-95
            ">
              Background Gradient
            </button>

            {/* Button 2: Text Gradient */}
            <button className="
              px-8 py-4 
              rounded-2xl 
              border-2 border-purple-500 
              bg-transparent
              font-bold 
              bg-gradient-to-r from-purple-500 to-pink-500 
              bg-clip-text 
              text-transparent
              transition-all
              hover:border-pink-500
              active:scale-95
            ">
              Text Gradient
            </button>

            {/* Button 3: Both */}
            <button className="
              px-8 py-4 
              rounded-2xl 
              bg-gradient-to-r from-cyan-500 to-purple-500 
              text-white 
              font-bold 
              shadow-lg shadow-cyan-500/30
              transition-all
              hover:shadow-cyan-500/50
              active:scale-95
            ">
              Combined
            </button>
          </div>
        </section>

        {/* Section 7: Directions */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white border-l-4 border-blue-500 pl-4">
            7. Directions de Gradient
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Right */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
              <p className="text-xs text-gray-400 mb-2">to-r →</p>
              <h4 className="
                text-2xl 
                font-bold 
                bg-gradient-to-r from-purple-500 to-pink-500 
                bg-clip-text 
                text-transparent
              ">
                Right
              </h4>
            </div>

            {/* Left */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
              <p className="text-xs text-gray-400 mb-2">to-l ←</p>
              <h4 className="
                text-2xl 
                font-bold 
                bg-gradient-to-l from-purple-500 to-pink-500 
                bg-clip-text 
                text-transparent
              ">
                Left
              </h4>
            </div>

            {/* Bottom */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
              <p className="text-xs text-gray-400 mb-2">to-b ↓</p>
              <h4 className="
                text-2xl 
                font-bold 
                bg-gradient-to-b from-purple-500 to-pink-500 
                bg-clip-text 
                text-transparent
              ">
                Bottom
              </h4>
            </div>

            {/* Top */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
              <p className="text-xs text-gray-400 mb-2">to-t ↑</p>
              <h4 className="
                text-2xl 
                font-bold 
                bg-gradient-to-t from-purple-500 to-pink-500 
                bg-clip-text 
                text-transparent
              ">
                Top
              </h4>
            </div>

            {/* Bottom-Right */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
              <p className="text-xs text-gray-400 mb-2">to-br ↘</p>
              <h4 className="
                text-2xl 
                font-bold 
                bg-gradient-to-br from-purple-500 to-pink-500 
                bg-clip-text 
                text-transparent
              ">
                Diagonal BR
              </h4>
            </div>

            {/* Top-Right */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
              <p className="text-xs text-gray-400 mb-2">to-tr ↗</p>
              <h4 className="
                text-2xl 
                font-bold 
                bg-gradient-to-tr from-purple-500 to-pink-500 
                bg-clip-text 
                text-transparent
              ">
                Diagonal TR
              </h4>
            </div>

            {/* Bottom-Left */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
              <p className="text-xs text-gray-400 mb-2">to-bl ↙</p>
              <h4 className="
                text-2xl 
                font-bold 
                bg-gradient-to-bl from-purple-500 to-pink-500 
                bg-clip-text 
                text-transparent
              ">
                Diagonal BL
              </h4>
            </div>

            {/* Top-Left */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
              <p className="text-xs text-gray-400 mb-2">to-tl ↖</p>
              <h4 className="
                text-2xl 
                font-bold 
                bg-gradient-to-tl from-purple-500 to-pink-500 
                bg-clip-text 
                text-transparent
              ">
                Diagonal TL
              </h4>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center space-y-4 py-8 border-t border-white/10">
          <p className="text-gray-400">
            Créé avec ❤️ pour Coconut V14
          </p>
          <p className="text-sm text-gray-500">
            Framework: React + TailwindCSS v4 + Motion
          </p>
        </div>

      </div>
    </div>
  );
}
