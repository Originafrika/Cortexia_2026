/**
 * ANALYZING LOADER ULTRA-PREMIUM - LIGHT THEME
 * Phase d'analyse Gemini - Affichée après soumission de l'intent
 * 
 * COCONUT PREMIUM DESIGN SYSTEM V3
 * - Light theme with Warm Cream accents
 * - Hero section avec context de l'analyse
 * - Animation centrale sophistiquée (orb + particles)
 * - Steps progress avec timeline verticale
 * - Fun facts/tips pendant l'attente
 * - BDS 7 Arts compliance
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
    <div className="min-h-screen bg-white relative overflow-hidden">
      
      {/* Premium ambient lights - Light theme */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(245,229,224,0.3)_0%,transparent_50%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(227,213,202,0.25)_0%,transparent_50%)]" />
      
      {/* Floating orbs animation - warm colors */}
      <motion.div
        className="fixed top-20 left-20 w-64 h-64 rounded-full bg-cream-400/10 blur-3xl"
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
        className="fixed bottom-20 right-20 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl"
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cream-50 border border-cream-200 mb-4">
            <Brain className="w-4 h-4 text-cream-600" />
            <span className="text-sm font-medium text-stone-700">Analyse IA en cours</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-stone-900 via-cream-700 to-stone-900 bg-clip-text text-transparent mb-3">
            Gemini analyse votre projet
          </h1>
          
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
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
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-cream-100 to-amber-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-cream-600" />
              </div>
              <div>
                <p className="text-xs text-stone-500 font-medium">Progression</p>
                <p className="text-xl font-bold text-stone-900">{Math.round(progress)}%</p>
              </div>
            </div>
            <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cream-500 to-amber-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Time */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-stone-500 font-medium">Temps restant</p>
                <p className="text-xl font-bold text-stone-900">
                  ~{remainingTime}s
                </p>
              </div>
            </div>
          </div>

          {/* Credits */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-stone-500 font-medium">Coût analyse</p>
                <p className="text-xl font-bold bg-gradient-to-r from-amber-600 to-amber-700 bg-clip-text text-transparent">
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
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cream-500 border-r-amber-500" />
          </motion.div>

          {/* Middle counter-rotating ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-3 w-34 h-34 rounded-full"
          >
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-b-stone-400 border-l-amber-500" />
          </motion.div>

          {/* Center orb with pulsing */}
          <div className="relative w-40 h-40 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-cream-500 to-amber-500 flex items-center justify-center shadow-2xl"
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
              <Sparkles className="w-5 h-5 text-cream-500" />
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
            <h3 className="text-xl font-semibold text-stone-900 mb-1">
              {ANALYSIS_STEPS[activeStep]?.label}
            </h3>
            <p className="text-sm text-stone-600">
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
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xl">
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
                        ? 'bg-gradient-to-r from-cream-50 to-amber-50 border-2 border-cream-300'
                        : isCompleted
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-stone-50 border border-stone-200'
                    }`}
                  >
                    {/* Icon/Check */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-gradient-to-br from-cream-500 to-amber-500 shadow-lg'
                        : isCompleted
                        ? 'bg-green-100'
                        : 'bg-white'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-stone-500'}`} />
                      )}
                    </div>

                    {/* Label */}
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        isActive
                          ? 'text-stone-900'
                          : isCompleted
                          ? 'text-green-700'
                          : 'text-stone-600'
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
                            className="w-1.5 h-1.5 rounded-full bg-cream-600"
                          />
                        ))}
                      </motion.div>
                    )}

                    {/* Check mark for completed */}
                    {isCompleted && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
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
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-blue-700 mb-1 uppercase tracking-wide">
                  Le saviez-vous ?
                </p>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentFactIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="text-sm text-blue-600 leading-relaxed"
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