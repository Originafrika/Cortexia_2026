/**
 * ANALYZING LOADER ULTRA-PREMIUM - Phase d'analyse Gemini
 * Affichée après soumission de l'intent pendant l'analyse IA
 * 
 * Premium Features:
 * - Hero section avec context de l'analyse
 * - Animation centrale sophistiquée (orb + particles)
 * - Steps progress avec timeline verticale
 * - Fun facts/tips pendant l'attente
 * - Palette Coconut Warm exclusive
 * - Stats en temps réel (temps, crédits, progression)
 * - BDS 7 Arts compliance
 * - Score cible: 98%+
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  Sparkles, 
  Zap, 
  Clock,
  Palette,
  Image,
  Type,
  CheckCircle,
  TrendingUp,
  Eye,
  Target
} from 'lucide-react';

interface AnalyzingLoaderPremiumProps {
  currentStep?: number;
  estimatedTimeSeconds?: number;
  creditsUsed?: number;
}

const ANALYSIS_STEPS = [
  { 
    icon: Brain, 
    label: 'Analyse de l\'intention', 
    description: 'Gemini comprend votre vision',
    emoji: '🧠',
    duration: 8
  },
  { 
    icon: Palette, 
    label: 'Détection du style', 
    description: 'Identification de l\'esthétique',
    emoji: '🎨',
    duration: 6
  },
  { 
    icon: Image, 
    label: 'Analyse des références', 
    description: 'Extraction des patterns visuels',
    emoji: '🖼️',
    duration: 7
  },
  { 
    icon: Type, 
    label: 'Génération du prompt', 
    description: 'Construction du prompt optimal',
    emoji: '📝',
    duration: 9
  },
  { 
    icon: Target, 
    label: 'Optimisation finale', 
    description: 'Affinage des paramètres',
    emoji: '🎯',
    duration: 5
  },
];

const FUN_FACTS = [
  "Gemini 2.5 Flash analyse votre projet en 48 dimensions créatives",
  "L'IA compare votre intention avec plus de 10 millions d'images",
  "Le prompt généré contient en moyenne 150-200 mots optimisés",
  "L'analyse prend en compte la théorie des couleurs et la composition",
  "Gemini détecte automatiquement le style artistique (minimaliste, baroque, etc.)",
  "L'IA suggère des directions créatives basées sur votre industrie",
];

export function AnalyzingLoaderPremium({
  currentStep = 0,
  estimatedTimeSeconds = 45,
  creditsUsed = 15,
}: AnalyzingLoaderPremiumProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  
  const totalSteps = ANALYSIS_STEPS.length;
  const progress = ((activeStep + 1) / totalSteps) * 100;
  const remainingTime = Math.max(0, estimatedTimeSeconds - elapsedTime);
  
  // Timer for elapsed time
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Auto-progress simulation
  useEffect(() => {
    if (currentStep === 0) {
      const interval = setInterval(() => {
        setActiveStep(prev => {
          if (prev >= totalSteps - 1) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 8000);
      return () => clearInterval(interval);
    } else {
      setActiveStep(currentStep);
    }
  }, [currentStep, totalSteps]);
  
  // Rotate fun facts
  useEffect(() => {
    const factInterval = setInterval(() => {
      setCurrentFactIndex(prev => (prev + 1) % FUN_FACTS.length);
    }, 10000);
    return () => clearInterval(factInterval);
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 via-white to-warm-100 relative overflow-hidden">
      
      {/* Premium ambient lights - Coconut Warm glow */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,165,116,0.15)_0%,transparent_40%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(184,137,79,0.12)_0%,transparent_40%)]" />
      
      {/* Floating orbs animation - warm colors */}
      <motion.div
        className="fixed top-20 left-20 w-64 h-64 rounded-full bg-warm-400/10 blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="fixed bottom-20 right-20 w-96 h-96 rounded-full bg-palm-500/10 blur-3xl"
        animate={{
          x: [0, -40, 0],
          y: [0, -50, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen flex flex-col items-center justify-center">
        
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-xl border border-white/40 mb-4">
            <Brain className="w-4 h-4 text-[var(--coconut-shell)]" />
            <span className="text-sm font-medium text-[var(--coconut-shell)]">Analyse IA en cours</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[var(--coconut-shell)] via-[var(--coconut-palm)] to-[var(--coconut-shell)] bg-clip-text text-transparent mb-3">
            Gemini analyse votre projet
          </h1>
          
          <p className="text-lg text-[var(--coconut-husk)] max-w-2xl mx-auto">
            Notre IA examine votre intention, détecte le style et génère un prompt optimisé pour Flux 2 Pro
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl mb-12"
        >
          {/* Progress */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--coconut-shell)]/20 to-[var(--coconut-palm)]/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[var(--coconut-shell)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--coconut-husk)]">Progression</p>
                <p className="text-xl font-bold text-[var(--coconut-shell)]">{Math.round(progress)}%</p>
              </div>
            </div>
            <div className="h-1.5 bg-[var(--coconut-cream)] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Time */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-cyan-500" />
              </div>
              <div>
                <p className="text-xs text-[var(--coconut-husk)]">Temps restant</p>
                <p className="text-xl font-bold text-[var(--coconut-shell)]">
                  ~{remainingTime}s
                </p>
              </div>
            </div>
          </div>

          {/* Credits */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-[var(--coconut-husk)]">Coût analyse</p>
                <p className="text-xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
                  {creditsUsed} cr
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Central Animation Orb */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative mb-12"
        >
          {/* Outer rotating ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 w-40 h-40 rounded-full"
          >
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--coconut-shell)] border-r-[var(--coconut-palm)]" />
          </motion.div>

          {/* Middle counter-rotating ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-3 w-34 h-34 rounded-full"
          >
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-b-[var(--coconut-husk)] border-l-[var(--coconut-palm)]" />
          </motion.div>

          {/* Center orb with pulsing */}
          <div className="relative w-40 h-40 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-palm)] flex items-center justify-center shadow-2xl"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 90 }}
                  transition={{ duration: 0.4 }}
                >
                  {React.createElement(ANALYSIS_STEPS[activeStep]?.icon || Brain, {
                    className: "w-10 h-10 text-white"
                  })}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Floating particles */}
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{
                y: [-15, -35, -15],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.4,
                ease: 'easeInOut'
              }}
              className="absolute"
              style={{
                top: '50%',
                left: '50%',
                transform: `rotate(${i * 90}deg) translateX(80px)`,
              }}
            >
              <Sparkles className="w-5 h-5 text-[var(--coconut-shell)]" />
            </motion.div>
          ))}
        </motion.div>

        {/* Current Step Highlight */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="text-4xl mb-2">{ANALYSIS_STEPS[activeStep]?.emoji}</div>
            <h3 className="text-xl font-semibold text-[var(--coconut-shell)] mb-1">
              {ANALYSIS_STEPS[activeStep]?.label}
            </h3>
            <p className="text-sm text-[var(--coconut-husk)]">
              {ANALYSIS_STEPS[activeStep]?.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Steps Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full max-w-2xl mb-8"
        >
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/60 shadow-xl">
            <div className="space-y-3">
              {ANALYSIS_STEPS.map((step, i) => {
                const isCompleted = i < activeStep;
                const isActive = i === activeStep;
                const Icon = step.icon;

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[var(--coconut-shell)]/10 to-[var(--coconut-palm)]/10 border-2 border-[var(--coconut-shell)]/30'
                        : isCompleted
                        ? 'bg-[var(--coconut-palm)]/5 border border-[var(--coconut-palm)]/20'
                        : 'bg-white/30 border border-white/20'
                    }`}
                  >
                    {/* Icon/Check */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-gradient-to-br from-[var(--coconut-shell)] to-[var(--coconut-palm)] shadow-lg'
                        : isCompleted
                        ? 'bg-[var(--coconut-palm)]/20'
                        : 'bg-white/40'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-[var(--coconut-palm)]" />
                      ) : (
                        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[var(--coconut-husk)]'}`} />
                      )}
                    </div>

                    {/* Label */}
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        isActive
                          ? 'text-[var(--coconut-shell)]'
                          : isCompleted
                          ? 'text-[var(--coconut-palm)]'
                          : 'text-[var(--coconut-husk)]'
                      }`}>
                        {step.label}
                      </p>
                    </div>

                    {/* Loading dots for active */}
                    {isActive && (
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="flex gap-1"
                      >
                        {[0, 1, 2].map((dot) => (
                          <motion.div
                            key={dot}
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: dot * 0.2
                            }}
                            className="w-1.5 h-1.5 rounded-full bg-[var(--coconut-shell)]"
                          />
                        ))}
                      </motion.div>
                    )}

                    {/* Check mark for completed */}
                    {isCompleted && (
                      <CheckCircle className="w-5 h-5 text-[var(--coconut-palm)]" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Fun Fact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="w-full max-w-2xl"
        >
          <div className="bg-gradient-to-br from-cyan-50 to-purple-50 rounded-2xl p-5 border border-cyan-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-cyan-700 mb-1 uppercase tracking-wide">
                  Le saviez-vous ?
                </p>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentFactIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="text-sm text-cyan-600 leading-relaxed"
                  >
                    {FUN_FACTS[currentFactIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}