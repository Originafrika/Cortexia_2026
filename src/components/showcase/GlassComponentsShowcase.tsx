/**
 * COCONUT V14 - GLASS COMPONENTS SHOWCASE
 * Phase 4 - Jour 2: Component library demonstration
 */

import React, { useState } from 'react';
import {
  GlassCard,
  GlassButton,
  GlassInput,
  GlassTextarea,
  GlassContainer,
  GlassBadge,
  GlassModal,
  GlassModalFooter,
  GradientOverlay,
  MeshGradient
} from '../ui';
import { Star, Heart, Zap, Mail, Lock, Search, Send } from 'lucide-react';

export function GlassComponentsShowcase() {
  const [modalOpen, setModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Background gradient */}
      <MeshGradient />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 space-y-12">
        {/* Header */}
        <GlassContainer variant="light" blur="lg" padding="lg" rounded="2xl">
          <div className="text-center">
            <h1 className="text-4xl mb-4 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Glass Components Showcase
            </h1>
            <p className="text-lg text-slate-600">
              Premium liquid glass design system components
            </p>
          </div>
        </GlassContainer>

        {/* Buttons Section */}
        <section>
          <h2 className="text-2xl mb-6 text-slate-900">Buttons</h2>
          <GlassCard variant="light" blur="md" className="p-8">
            <div className="space-y-6">
              {/* Variants */}
              <div>
                <h3 className="text-sm text-slate-600 mb-3">Variants</h3>
                <div className="flex flex-wrap gap-3">
                  <GlassButton variant="primary">Primary</GlassButton>
                  <GlassButton variant="secondary">Secondary</GlassButton>
                  <GlassButton variant="accent">Accent</GlassButton>
                  <GlassButton variant="ghost">Ghost</GlassButton>
                  <GlassButton variant="outline">Outline</GlassButton>
                  <GlassButton variant="destructive">Destructive</GlassButton>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h3 className="text-sm text-slate-600 mb-3">Sizes</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <GlassButton size="sm">Small</GlassButton>
                  <GlassButton size="md">Medium</GlassButton>
                  <GlassButton size="lg">Large</GlassButton>
                  <GlassButton size="xl">Extra Large</GlassButton>
                </div>
              </div>

              {/* With Icons */}
              <div>
                <h3 className="text-sm text-slate-600 mb-3">With Icons</h3>
                <div className="flex flex-wrap gap-3">
                  <GlassButton icon={<Star />} iconPosition="left">
                    Star
                  </GlassButton>
                  <GlassButton variant="secondary" icon={<Heart />} iconPosition="right">
                    Like
                  </GlassButton>
                  <GlassButton variant="accent" icon={<Zap />}>
                    Boost
                  </GlassButton>
                </div>
              </div>

              {/* States */}
              <div>
                <h3 className="text-sm text-slate-600 mb-3">States</h3>
                <div className="flex flex-wrap gap-3">
                  <GlassButton loading>Loading</GlassButton>
                  <GlassButton disabled>Disabled</GlassButton>
                  <GlassButton glow>With Glow</GlassButton>
                </div>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* Inputs Section */}
        <section>
          <h2 className="text-2xl mb-6 text-slate-900">Inputs</h2>
          <GlassCard variant="light" blur="md" className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Input */}
              <GlassInput
                label="Email"
                placeholder="Enter your email"
                icon={<Mail className="w-4 h-4" />}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />

              {/* Password Input */}
              <GlassInput
                label="Password"
                type="password"
                placeholder="Enter password"
                icon={<Lock className="w-4 h-4" />}
                helperText="Must be at least 8 characters"
              />

              {/* Search Input */}
              <GlassInput
                variant="solid"
                placeholder="Search..."
                icon={<Search className="w-4 h-4" />}
              />

              {/* Error State */}
              <GlassInput
                label="Username"
                placeholder="Enter username"
                error="This username is already taken"
              />

              {/* Textarea */}
              <div className="md:col-span-2">
                <GlassTextarea
                  label="Message"
                  placeholder="Type your message..."
                  value={textareaValue}
                  onChange={(e) => setTextareaValue(e.target.value)}
                  showCount
                  maxCount={500}
                  helperText="Share your thoughts with us"
                />
              </div>
            </div>
          </GlassCard>
        </section>

        {/* Badges Section */}
        <section>
          <h2 className="text-2xl mb-6 text-slate-900">Badges</h2>
          <GlassCard variant="light" blur="md" className="p-8">
            <div className="space-y-4">
              {/* Variants */}
              <div className="flex flex-wrap gap-2">
                <GlassBadge>Default</GlassBadge>
                <GlassBadge variant="primary">Primary</GlassBadge>
                <GlassBadge variant="secondary">Secondary</GlassBadge>
                <GlassBadge variant="success">Success</GlassBadge>
                <GlassBadge variant="warning">Warning</GlassBadge>
                <GlassBadge variant="error">Error</GlassBadge>
                <GlassBadge variant="outline">Outline</GlassBadge>
              </div>

              {/* With Icons */}
              <div className="flex flex-wrap gap-2">
                <GlassBadge variant="primary" icon={<Star className="w-3 h-3" />}>
                  Featured
                </GlassBadge>
                <GlassBadge variant="success" icon={<Zap className="w-3 h-3" />} rounded>
                  New
                </GlassBadge>
                <GlassBadge variant="warning" icon={<Heart className="w-3 h-3" />} glow>
                  Popular
                </GlassBadge>
              </div>

              {/* Sizes */}
              <div className="flex flex-wrap items-center gap-2">
                <GlassBadge size="sm" variant="primary">Small</GlassBadge>
                <GlassBadge size="md" variant="secondary">Medium</GlassBadge>
                <GlassBadge size="lg" variant="accent">Large</GlassBadge>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* Cards Section */}
        <section>
          <h2 className="text-2xl mb-6 text-slate-900">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <GlassCard variant="light" blur="md" className="p-6">
              <h3 className="text-lg mb-2 text-slate-900">Light Glass</h3>
              <p className="text-sm text-slate-600">
                70% opacity with medium blur
              </p>
            </GlassCard>

            <GlassCard variant="medium" blur="lg" className="p-6">
              <h3 className="text-lg mb-2 text-slate-900">Medium Glass</h3>
              <p className="text-sm text-slate-600">
                50% opacity with large blur
              </p>
            </GlassCard>

            <GlassCard variant="dark" blur="xl" className="p-6">
              <h3 className="text-lg mb-2 text-slate-900">Dark Glass</h3>
              <p className="text-sm text-slate-600">
                30% opacity with extra blur
              </p>
            </GlassCard>

            <GlassCard variant="colored" blur="lg" glow glowColor="primary" className="p-6">
              <h3 className="text-lg mb-2 text-slate-900">Colored Glow</h3>
              <p className="text-sm text-slate-600">
                Gradient with glow effect
              </p>
            </GlassCard>
          </div>
        </section>

        {/* Modal Section */}
        <section>
          <h2 className="text-2xl mb-6 text-slate-900">Modal</h2>
          <GlassCard variant="light" blur="md" className="p-8">
            <GlassButton onClick={() => setModalOpen(true)}>
              Open Modal
            </GlassButton>

            <GlassModal
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              title="Premium Glass Modal"
              description="This is a beautiful glass modal with backdrop blur"
              size="md"
            >
              <div className="space-y-4">
                <p className="text-slate-600">
                  This modal features a glass morphism design with a blurred backdrop
                  and smooth animations. It supports various sizes and configurations.
                </p>

                <GlassInput
                  label="Name"
                  placeholder="Enter your name"
                  fullWidth
                />

                <GlassTextarea
                  label="Comment"
                  placeholder="Leave a comment..."
                  rows={3}
                />

                <GlassModalFooter>
                  <GlassButton
                    variant="ghost"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </GlassButton>
                  <GlassButton
                    variant="primary"
                    icon={<Send className="w-4 h-4" />}
                    onClick={() => setModalOpen(false)}
                  >
                    Submit
                  </GlassButton>
                </GlassModalFooter>
              </div>
            </GlassModal>
          </GlassCard>
        </section>

        {/* Containers Section */}
        <section>
          <h2 className="text-2xl mb-6 text-slate-900">Containers</h2>
          <div className="space-y-6">
            <GlassContainer variant="light" padding="lg" rounded="2xl">
              <h3 className="text-lg mb-2">Light Container</h3>
              <p className="text-slate-600">
                Perfect for main content areas
              </p>
            </GlassContainer>

            <GlassContainer variant="colored" padding="xl" rounded="3xl" maxWidth="2xl" centered>
              <h3 className="text-lg mb-2">Centered Colored Container</h3>
              <p className="text-slate-600">
                Great for hero sections and featured content
              </p>
            </GlassContainer>
          </div>
        </section>

        {/* Gradient Overlays */}
        <section>
          <h2 className="text-2xl mb-6 text-slate-900">Gradient Overlays</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['primary', 'cosmic', 'sunset'] as const).map((variant) => (
              <div key={variant} className="relative h-48 rounded-2xl overflow-hidden">
                <GradientOverlay variant={variant} opacity={0.3} animated />
                <div className="relative z-10 flex items-center justify-center h-full">
                  <h3 className="text-white text-xl capitalize font-medium">
                    {variant}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
