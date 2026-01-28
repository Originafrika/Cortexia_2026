/**
 * 🎨 ENTERPRISE TEMPLATE SELECTOR - PREMIUM LIGHT
 * 
 * Interface premium pour sélectionner et prévisualiser les Intent Templates
 * industry-specific qui nourrissent le cerveau Gemini.
 * 
 * Features:
 * - Category filtering (E-commerce, SaaS, Real Estate, etc.)
 * - Type filtering (Image, Video, Campaign)
 * - Template preview cards avec metadata
 * - Quick-fill Intent avec template structure
 * - Brand guidance visible
 * - Cost estimation
 * 
 * COCONUT PREMIUM DESIGN SYSTEM V3
 * - Light theme (white bg)
 * - Warm Cream accents (#FEF0E5, #D4A574)
 * - Generous spacing & large touch targets
 * - Figma/Notion-inspired clean aesthetic
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Image as ImageIcon,
  Video as VideoIcon,
  Layers,
  ArrowRight,
  Check,
  Zap,
  Clock,
  DollarSign,
  Filter,
  Search,
  X,
  Info
} from 'lucide-react';
import { useSoundContext } from './SoundProvider';
import {
  ALL_ENTERPRISE_TEMPLATES,
  getTemplatesByCategory,
  getTemplatesByType,
  templateToIntentData,
  type EnterpriseTemplate,
  type TemplateCategory,
  type TemplateType
} from '../../lib/data/enterprise-templates';

// ============================================
// TYPES
// ============================================

interface EnterpriseTemplateSelectorProps {
  selectedType: TemplateType;
  onSelectTemplate: (template: EnterpriseTemplate) => void;
  onSkip: () => void;
  onBack: () => void;
}

// ============================================
// CATEGORY LABELS
// ============================================

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  'ecommerce': 'E-commerce',
  'saas': 'SaaS',
  'real-estate': 'Real Estate',
  'fashion': 'Fashion',
  'food-beverage': 'Food & Beverage',
  'automotive': 'Automotive',
  'healthcare': 'Healthcare',
  'education': 'Education',
  'finance': 'Finance',
  'entertainment': 'Entertainment'
};

// ============================================
// COMPONENT
// ============================================

export const EnterpriseTemplateSelector: React.FC<EnterpriseTemplateSelectorProps> = ({
  selectedType,
  onSelectTemplate,
  onSkip,
  onBack
}) => {
  const { playClick, playHover } = useSoundContext();
  
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<EnterpriseTemplate | null>(null);
  
  // Filter templates based on type, category, and search
  const filteredTemplates = useMemo(() => {
    let templates = getTemplatesByType(selectedType);
    
    if (selectedCategory !== 'all') {
      templates = templates.filter(t => t.category === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      templates = templates.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
      );
    }
    
    return templates;
  }, [selectedType, selectedCategory, searchQuery]);
  
  // Get unique categories from available templates
  const availableCategories = useMemo(() => {
    const categories = new Set<TemplateCategory>();
    getTemplatesByType(selectedType).forEach(t => categories.add(t.category));
    return Array.from(categories);
  }, [selectedType]);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-6xl max-h-[90vh] m-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-8 border-b border-stone-200 bg-gradient-to-r from-cream-50 to-amber-50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {/* Gradient Icon */}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cream-100 to-amber-100 flex items-center justify-center shadow-sm">
                <Sparkles className="w-7 h-7 text-cream-600" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-stone-900">Enterprise Templates</h2>
                <p className="text-base text-stone-600 mt-1">
                  Industry-specific intent structures for intelligent generation
                </p>
              </div>
            </div>
            
            <button
              onClick={() => {
                playClick();
                onBack();
              }}
              className="w-11 h-11 rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-200 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-stone-600" />
            </button>
          </div>
          
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search templates by name, category, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-white border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-cream-300 focus:ring-4 focus:ring-cream-100 transition-all"
              />
            </div>
            
            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => {
                  playClick();
                  setSelectedCategory('all');
                }}
                onMouseEnter={() => playHover()}
                className={`
                  px-4 h-12 rounded-lg border whitespace-nowrap font-medium transition-all
                  ${selectedCategory === 'all'
                    ? 'bg-cream-500 border-cream-500 text-white shadow-sm'
                    : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
                  }
                `}
              >
                All
              </button>
              
              {availableCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    playClick();
                    setSelectedCategory(category);
                  }}
                  onMouseEnter={() => playHover()}
                  className={`
                    px-4 h-12 rounded-lg border whitespace-nowrap font-medium transition-all
                    ${selectedCategory === category
                      ? 'bg-cream-500 border-cream-500 text-white shadow-sm'
                      : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
                    }
                  `}
                >
                  {CATEGORY_LABELS[category]}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Templates Grid */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-280px)] bg-stone-50">
          {filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-xl bg-stone-200 border border-stone-300 flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-stone-400" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">No templates found</h3>
              <p className="text-sm text-stone-500 max-w-md">
                Try adjusting your filters or search query
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template, idx) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  index={idx}
                  onSelect={() => {
                    playClick();
                    onSelectTemplate(template);
                  }}
                  onPreview={() => {
                    playClick();
                    setPreviewTemplate(template);
                  }}
                  playHover={playHover}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-stone-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-stone-600">
              <Info className="w-4 h-4" />
              <span>Templates auto-fill intent with industry best practices</span>
            </div>
            
            <button
              onClick={() => {
                playClick();
                onSkip();
              }}
              className="px-6 py-2.5 rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-900 font-medium transition-colors"
            >
              Skip & Enter Manually
            </button>
          </div>
        </div>
      </motion.div>
      
      {/* Template Preview Modal */}
      <AnimatePresence>
        {previewTemplate && (
          <TemplatePreviewModal
            template={previewTemplate}
            onClose={() => {
              playClick();
              setPreviewTemplate(null);
            }}
            onSelect={() => {
              playClick();
              onSelectTemplate(previewTemplate);
            }}
            playClick={playClick}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// TEMPLATE CARD
// ============================================

interface TemplateCardProps {
  template: EnterpriseTemplate;
  index: number;
  onSelect: () => void;
  onPreview: () => void;
  playHover: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  index,
  onSelect,
  onPreview,
  playHover
}) => {
  const getTypeIcon = () => {
    switch (template.type) {
      case 'image': return <ImageIcon className="w-4 h-4" />;
      case 'video': return <VideoIcon className="w-4 h-4" />;
      case 'campaign': return <Layers className="w-4 h-4" />;
    }
  };
  
  const getQualityColor = () => {
    switch (template.expectedOutput.qualityLevel) {
      case 'premium': return 'text-purple-700 bg-purple-100 border-purple-200';
      case 'professional': return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'standard': return 'text-stone-700 bg-stone-100 border-stone-200';
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group bg-white rounded-xl border border-stone-200 hover:border-cream-300 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
      onMouseEnter={playHover}
      onClick={onSelect}
    >
      {/* Header */}
      <div className="p-5 border-b border-stone-200">
        <div className="flex items-start justify-between mb-3">
          <div className="text-4xl">{template.icon}</div>
          <div className="flex items-center gap-1.5">
            <div className="px-2 py-1 rounded-md bg-stone-100 border border-stone-200 text-stone-600">
              {getTypeIcon()}
            </div>
          </div>
        </div>
        
        <h3 className="text-base font-bold text-stone-900 mb-1 group-hover:text-cream-600 transition-colors">
          {template.name}
        </h3>
        <p className="text-sm text-stone-600 line-clamp-2">
          {template.description}
        </p>
      </div>
      
      {/* Metadata */}
      <div className="p-5 space-y-2.5 bg-stone-50">
        {/* Category */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-stone-500 font-medium">Category</span>
          <span className="text-stone-900 font-medium">{CATEGORY_LABELS[template.category]}</span>
        </div>
        
        {/* Cost */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-stone-500 font-medium flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" />
            Cost
          </span>
          <span className="text-cream-600 font-bold">{template.expectedOutput.estimatedCost} credits</span>
        </div>
        
        {/* Time */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-stone-500 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Time
          </span>
          <span className="text-stone-900 font-medium">~{template.expectedOutput.estimatedTime}s</span>
        </div>
        
        {/* Quality */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-stone-500 font-medium">Quality</span>
          <span className={`px-2.5 py-1 rounded-md border text-xs font-semibold uppercase ${getQualityColor()}`}>
            {template.expectedOutput.qualityLevel}
          </span>
        </div>
      </div>
      
      {/* Actions */}
      <div className="p-4 border-t border-stone-200 flex gap-2 bg-white">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPreview();
          }}
          className="flex-1 h-10 rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-200 text-sm text-stone-700 font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Info className="w-4 h-4" />
          Preview
        </button>
        
        <button
          onClick={onSelect}
          className="flex-1 h-10 rounded-lg bg-cream-500 hover:bg-cream-600 shadow-sm hover:shadow text-sm text-white font-semibold transition-all flex items-center justify-center gap-2"
        >
          Use Template
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      
      {/* Hover Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-cream-50/0 to-amber-50/0 group-hover:from-cream-50/50 group-hover:to-amber-50/50 transition-all pointer-events-none" />
    </motion.div>
  );
};

// ============================================
// TEMPLATE PREVIEW MODAL
// ============================================

interface TemplatePreviewModalProps {
  template: EnterpriseTemplate;
  onClose: () => void;
  onSelect: () => void;
  playClick: () => void;
}

const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template,
  onClose,
  onSelect,
  playClick
}) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 p-6 border-b border-stone-200 bg-gradient-to-r from-cream-50 to-amber-50 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-5xl">{template.icon}</div>
              <div>
                <h2 className="text-2xl font-bold text-stone-900 mb-1">{template.name}</h2>
                <p className="text-sm text-stone-600">
                  {CATEGORY_LABELS[template.category]} • {template.type}
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg bg-white hover:bg-stone-100 border border-stone-200 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-stone-600" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-220px)]">
          <div className="p-6 space-y-6 bg-stone-50">
            {/* Description */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
                Description
              </h3>
              <p className="text-sm text-stone-700 leading-relaxed">{template.description}</p>
            </div>
            
            {/* Intent Structure */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3">
                Intent Structure
              </h3>
              <div className="p-4 rounded-xl bg-white border border-stone-200">
                <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line font-mono">
                  {template.intentStructure.description}
                </p>
              </div>
            </div>
            
            {/* Gemini Guidance */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3">
                AI Guidance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white border border-stone-200">
                  <h4 className="text-sm font-semibold text-stone-900 mb-3">Style Hints</h4>
                  <ul className="space-y-2">
                    {template.geminiGuidance.styleHints.map((hint, i) => (
                      <li key={i} className="text-sm text-stone-700 flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{hint}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="p-4 rounded-xl bg-white border border-stone-200">
                  <h4 className="text-sm font-semibold text-stone-900 mb-3">Mood Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {template.geminiGuidance.moodKeywords.map((keyword, i) => (
                      <span 
                        key={i} 
                        className="px-3 py-1.5 rounded-md bg-cream-100 border border-cream-200 text-sm text-cream-700 font-medium"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Brand Placeholders */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3">
                Required Brand Assets
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(template.brandPlaceholders).map(([key, required]) => (
                  <div
                    key={key}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      required
                        ? 'bg-cream-100 border-cream-300'
                        : 'bg-white border-stone-200 opacity-50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{required ? '✓' : '○'}</div>
                    <p className="text-xs text-stone-700 capitalize font-medium">
                      {key.replace('needs', '')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Expected Output */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3">
                Expected Output
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white border border-stone-200 text-center">
                  <Zap className="w-6 h-6 text-cream-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-stone-900">{template.expectedOutput.estimatedCost}</p>
                  <p className="text-xs text-stone-500 mt-1 font-medium uppercase tracking-wide">Credits</p>
                </div>
                
                <div className="p-4 rounded-xl bg-white border border-stone-200 text-center">
                  <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-stone-900">~{template.expectedOutput.estimatedTime}s</p>
                  <p className="text-xs text-stone-500 mt-1 font-medium uppercase tracking-wide">Time</p>
                </div>
                
                <div className="p-4 rounded-xl bg-white border border-stone-200 text-center">
                  <Sparkles className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-stone-900 capitalize">
                    {template.expectedOutput.qualityLevel}
                  </p>
                  <p className="text-xs text-stone-500 mt-1 font-medium uppercase tracking-wide">Quality</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="sticky bottom-0 p-6 border-t border-stone-200 bg-white">
          <button
            onClick={() => {
              playClick();
              onSelect();
            }}
            className="w-full h-12 rounded-lg bg-cream-500 hover:bg-cream-600 shadow-sm hover:shadow text-white font-semibold transition-all flex items-center justify-center gap-2"
          >
            Use This Template
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
