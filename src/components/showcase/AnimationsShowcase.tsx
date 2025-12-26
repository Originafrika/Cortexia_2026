/**
 * COCONUT V14 - PHASE 4 JOUR 3
 * Animations Showcase
 * 
 * Démo interactive de toutes les animations disponibles
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  AnimatedWrapper, 
  AnimatedStaggerContainer, 
  AnimatedStaggerItem,
  AnimatedOnScroll,
  PageTransition,
  TabTransition,
  ModalTransition,
  CollapseTransition,
} from '../ui-premium/AnimatedWrapper';
import { AnimatedTransition } from '../ui-premium/AnimatedTransition';
import { GlassButton } from '../ui/glass-button';
import { GlassCard } from '../ui/glass-card';
import { GlassBadge } from '../ui/glass-badge';
import {
  fadeVariants,
  buttonHoverVariants,
  cardHoverVariants,
  iconSpinVariants,
  toastVariants,
  successBounce,
  errorShake,
} from '../../lib/animations/transitions';
import {
  hoverLift,
  clickScaleDown,
  successPulse,
  loadingSpinner,
} from '../../lib/animations/micro-interactions';
import { Sparkles, Loader2, Check, X, ChevronDown } from 'lucide-react';

export function AnimationsShowcase() {
  const [activeTab, setActiveTab] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  const tabs = ['Page Transitions', 'Component Animations', 'Micro-interactions', 'Advanced'];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <AnimatedWrapper animation="fade" delay={0.1}>
          <div className="text-center space-y-4">
            <motion.div
              className="inline-flex items-center gap-2 text-purple-400"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-8 h-8" />
            </motion.div>
            <h1 className="text-5xl font-bold text-white">
              Animations Showcase
            </h1>
            <p className="text-xl text-slate-300">
              Coconut V14 - Phase 4 Jour 3 - Motion System Complete
            </p>
          </div>
        </AnimatedWrapper>
        
        {/* Tabs */}
        <div className="flex justify-center gap-2 flex-wrap">
          {tabs.map((tab, index) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(index)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === index
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tab}
            </motion.button>
          ))}
        </div>
        
        {/* Tab Content */}
        <TabTransition activeTab={activeTab}>
          {activeTab === 0 && <PageTransitionsDemo />}
          {activeTab === 1 && <ComponentAnimationsDemo />}
          {activeTab === 2 && <MicroInteractionsDemo />}
          {activeTab === 3 && <AdvancedAnimationsDemo />}
        </TabTransition>
        
        {/* Modal Demo Button */}
        <div className="flex justify-center">
          <GlassButton
            variant="primary"
            onClick={() => setShowModal(true)}
          >
            Open Modal Demo
          </GlassButton>
        </div>
        
        {/* Modal */}
        <ModalTransition isOpen={showModal} onClose={() => setShowModal(false)}>
          <GlassCard className="w-full max-w-md p-6 space-y-4">
            <h2 className="text-2xl font-bold text-white">Modal Animation</h2>
            <p className="text-slate-300">
              This modal uses scale + fade animation with backdrop blur.
            </p>
            <div className="flex gap-2 justify-end">
              <GlassButton variant="ghost" onClick={() => setShowModal(false)}>
                Close
              </GlassButton>
              <GlassButton variant="primary" onClick={() => setShowModal(false)}>
                Confirm
              </GlassButton>
            </div>
          </GlassCard>
        </ModalTransition>
        
        {/* Toast */}
        {showToast && (
          <motion.div
            variants={toastVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
          >
            ✓ Toast notification!
          </motion.div>
        )}
        
      </div>
    </div>
  );
}

// ============================================
// PAGE TRANSITIONS DEMO
// ============================================

function PageTransitionsDemo() {
  const [currentPage, setCurrentPage] = useState(0);
  const pages = ['Fade', 'Slide Up', 'Slide Right', 'Scale'];
  
  return (
    <GlassCard className="p-8 space-y-6">
      <h2 className="text-3xl font-bold text-white">Page Transitions</h2>
      
      <div className="flex gap-2 flex-wrap">
        {pages.map((page, index) => (
          <GlassButton
            key={page}
            variant={currentPage === index ? 'primary' : 'secondary'}
            onClick={() => setCurrentPage(index)}
          >
            {page}
          </GlassButton>
        ))}
      </div>
      
      <AnimatedTransition 
        type={currentPage === 0 ? 'fade' : currentPage === 1 ? 'slideUp' : currentPage === 2 ? 'slideRight' : 'scale'}
        id={currentPage}
      >
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg p-12 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Page {currentPage + 1}: {pages[currentPage]}
          </h3>
          <p className="text-slate-300">
            This content animates with <strong>{pages[currentPage]}</strong> transition
          </p>
        </div>
      </AnimatedTransition>
    </GlassCard>
  );
}

// ============================================
// COMPONENT ANIMATIONS DEMO
// ============================================

function ComponentAnimationsDemo() {
  const projects = [
    { id: 1, title: 'Project Alpha', status: 'active' },
    { id: 2, title: 'Project Beta', status: 'completed' },
    { id: 3, title: 'Project Gamma', status: 'pending' },
    { id: 4, title: 'Project Delta', status: 'active' },
  ];
  
  return (
    <GlassCard className="p-8 space-y-6">
      <h2 className="text-3xl font-bold text-white">Component Animations</h2>
      
      {/* Stagger Grid */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Stagger Animation</h3>
        <AnimatedStaggerContainer staggerDelay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <AnimatedStaggerItem key={project.id}>
                <motion.div
                  className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20"
                  variants={cardHoverVariants}
                  initial="rest"
                  whileHover="hover"
                >
                  <h4 className="text-lg font-semibold text-white mb-2">
                    {project.title}
                  </h4>
                  <GlassBadge
                    variant={project.status === 'completed' ? 'success' : 'primary'}
                  >
                    {project.status}
                  </GlassBadge>
                </motion.div>
              </AnimatedStaggerItem>
            ))}
          </div>
        </AnimatedStaggerContainer>
      </div>
      
      {/* Hover Effects */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Hover Effects</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            className="aspect-square bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-lg flex items-center justify-center text-white font-medium"
            whileHover={hoverLift}
          >
            Hover Lift
          </motion.div>
          <motion.div
            className="aspect-square bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-lg flex items-center justify-center text-white font-medium"
            whileHover={{ scale: 1.1 }}
          >
            Hover Scale
          </motion.div>
          <motion.div
            className="aspect-square bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded-lg flex items-center justify-center text-white font-medium"
            whileHover={{ rotateY: 10 }}
          >
            Hover Tilt
          </motion.div>
          <motion.div
            className="aspect-square bg-gradient-to-br from-orange-500/30 to-red-500/30 rounded-lg flex items-center justify-center text-white font-medium"
            whileHover={{ 
              boxShadow: '0 0 30px rgba(255, 100, 100, 0.6)' 
            }}
          >
            Hover Glow
          </motion.div>
        </div>
      </div>
    </GlassCard>
  );
}

// ============================================
// MICRO-INTERACTIONS DEMO
// ============================================

function MicroInteractionsDemo() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <GlassCard className="p-8 space-y-6">
      <h2 className="text-3xl font-bold text-white">Micro-Interactions</h2>
      
      {/* Buttons */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Button States</h3>
        <div className="flex gap-4 flex-wrap">
          <motion.button
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium"
            variants={buttonHoverVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
          >
            Hover & Tap Me
          </motion.button>
          
          <motion.button
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium flex items-center gap-2"
            onClick={() => {
              setIsSuccess(true);
              setTimeout(() => setIsSuccess(false), 1000);
            }}
            animate={isSuccess ? successPulse : {}}
          >
            <Check className="w-5 h-5" />
            Success
          </motion.button>
          
          <motion.button
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium flex items-center gap-2"
            onClick={() => {
              setIsError(true);
              setTimeout(() => setIsError(false), 600);
            }}
            animate={isError ? errorShake : {}}
          >
            <X className="w-5 h-5" />
            Error
          </motion.button>
          
          <motion.button
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2"
            onClick={() => {
              setIsLoading(!isLoading);
            }}
          >
            <motion.div animate={isLoading ? loadingSpinner : {}}>
              <Loader2 className="w-5 h-5" />
            </motion.div>
            {isLoading ? 'Loading...' : 'Load'}
          </motion.button>
        </div>
      </div>
      
      {/* Click Effects */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Click Effects</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <motion.div
            className="aspect-square bg-purple-500/30 rounded-lg flex items-center justify-center text-white font-medium cursor-pointer"
            whileTap={clickScaleDown}
          >
            Click Scale
          </motion.div>
          <motion.div
            className="aspect-square bg-blue-500/30 rounded-lg flex items-center justify-center text-white font-medium cursor-pointer"
            whileTap={{ 
              scale: [1, 0.9, 1.1, 1],
              transition: { duration: 0.3 }
            }}
          >
            Click Bounce
          </motion.div>
          <motion.div
            className="aspect-square bg-green-500/30 rounded-lg flex items-center justify-center text-white font-medium cursor-pointer"
            whileTap={{ 
              rotate: [0, -5, 5, -5, 0],
              transition: { duration: 0.4 }
            }}
          >
            Click Wiggle
          </motion.div>
        </div>
      </div>
    </GlassCard>
  );
}

// ============================================
// ADVANCED ANIMATIONS DEMO
// ============================================

function AdvancedAnimationsDemo() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  return (
    <GlassCard className="p-8 space-y-6">
      <h2 className="text-3xl font-bold text-white">Advanced Animations</h2>
      
      {/* Scroll Reveal */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Scroll Reveal</h3>
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {[1, 2, 3, 4, 5].map((item) => (
            <AnimatedOnScroll key={item} animation="slideUp" once>
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
                <h4 className="text-lg font-semibold text-white">
                  Item {item} - Scroll to reveal
                </h4>
                <p className="text-slate-300">
                  This item animates when it enters the viewport
                </p>
              </div>
            </AnimatedOnScroll>
          ))}
        </div>
      </div>
      
      {/* Collapse */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Collapse Animation</h3>
        <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 overflow-hidden">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full p-4 flex items-center justify-between text-white hover:bg-white/10 transition-colors"
          >
            <span className="font-medium">Click to toggle</span>
            <motion.div
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </button>
          
          <CollapseTransition isOpen={!isCollapsed}>
            <div className="p-6 border-t border-white/20 space-y-2">
              <p className="text-slate-300">
                This content smoothly collapses and expands with height animation.
              </p>
              <p className="text-slate-300">
                Perfect for accordions, FAQs, and expandable sections.
              </p>
              <p className="text-slate-300">
                The animation respects prefers-reduced-motion settings.
              </p>
            </div>
          </CollapseTransition>
        </div>
      </div>
      
      {/* Floating Elements */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Floating Animation</h3>
        <div className="flex gap-8 justify-center">
          <motion.div
            className="w-16 h-16 bg-purple-500/50 rounded-full"
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="w-16 h-16 bg-pink-500/50 rounded-full"
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          />
          <motion.div
            className="w-16 h-16 bg-blue-500/50 rounded-full"
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
          />
        </div>
      </div>
    </GlassCard>
  );
}

export default AnimationsShowcase;
