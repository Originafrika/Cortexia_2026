/**
 * COCONUT V14 - COCOBOARD OVERVIEW (CDC-COMPLIANT)
 * Display CocoBoard in the format specified by CAHIER_DES_CHARGES_CORTEXIA.md lines 193-271
 * 
 * ✅ FIXED: BDS Compliance
 * - Grid layout for desktop
 * - Consistent spacing and radius
 * - Stagger animations
 * - Empty states with call-to-action
 * - Max-width constraint
 * 
 * ✨ PHASE 4 - SESSION 15: SOUND INTEGRATION
 * - Pattern: playClick (empty state action), playWhoosh (navigation if any)
 */

import React from 'react';
import { motion } from 'motion/react';
import { Palette, Layout, Code, Settings, DollarSign, Lightbulb, FileText, Braces, ImageIcon } from 'lucide-react';
import { tokens, TRANSITIONS, getStaggerDelay } from '../../lib/design/tokens';
import { EmptyState, EmptyStatePresets } from '../ui-premium/EmptyState';
import { useSoundContext } from './SoundProvider';

interface CocoBoardOverviewProps {
  board: any; // CocoBoard type
}

export function CocoBoardOverview({ board }: CocoBoardOverviewProps) {
  const { playClick } = useSoundContext();
  const { analysis, finalPrompt, references, specs, cost } = board;
  const [showJSON, setShowJSON] = React.useState(false);
  
  const handleAddReference = () => {
    playClick();
    console.log('Add reference');
  };
  
  // Define sections for 2-column layout
  const leftSections = [
    { id: 'concept', component: <ConceptSection analysis={analysis} /> },
    { id: 'composition', component: <CompositionSection analysis={analysis} specs={specs} /> },
    { id: 'palette', component: <PaletteSection analysis={analysis} /> },
  ];
  
  const rightSections = [
    { id: 'prompt', component: <PromptSection finalPrompt={finalPrompt} /> },
    { id: 'references', component: <ReferencesSection references={references} onAddReference={handleAddReference} /> },
    { id: 'specs', component: <SpecsSection specs={specs} references={references} cost={cost} /> },
  ];
  
  return (
    <div className={`${tokens.layout.maxWidth} mx-auto ${tokens.layout.containerPadding}`}>
      <div className={tokens.layout.sectionSpacing}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={TRANSITIONS.medium}
          className={`bg-gradient-to-r from-[var(--coconut-shell)]/10 to-[var(--coconut-palm)]/10 backdrop-blur-xl ${tokens.radius.lg} p-6 ${tokens.colors.border.base} border`}
        >
          <div className={`flex items-center ${tokens.gap.normal} mb-2`}>
            <div className="text-4xl">📋</div>
            <h1 className={tokens.colors.text.primary}>
              CocoBoard - {analysis.projectTitle}
            </h1>
          </div>
        </motion.div>

        {/* Two-column grid for desktop */}
        <div className={`${tokens.layout.gridCols.double} ${tokens.gap.loose}`}>
          {/* Left Column */}
          <div className={tokens.layout.sectionSpacing}>
            {leftSections.map((section, index) => (
              <div key={section.id}>
                {section.component}
              </div>
            ))}
          </div>
          
          {/* Right Column */}
          <div className={tokens.layout.sectionSpacing}>
            {rightSections.map((section, index) => (
              <div key={section.id}>
                {section.component}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SECTION COMPONENTS
// ============================================

function ConceptSection({ analysis }: { analysis: any }) {
  return (
    <Section icon="🎨" title="CONCEPT" iconComponent={Lightbulb} index={0}>
      <InfoRow label="Direction artistique" value={analysis.concept.mainConcept} />
      <InfoRow label="Ambiance" value={analysis.concept.targetEmotion} />
      <InfoRow label="Message principal" value={analysis.concept.keyMessage} />
    </Section>
  );
}

function CompositionSection({ analysis, specs }: { analysis: any; specs: any }) {
  return (
    <Section icon="📐" title="COMPOSITION" iconComponent={Layout} index={1}>
      <InfoRow label="Ratio" value={specs.ratio} />
      <InfoRow label="Résolution" value={specs.resolution} />
      <div className="mt-4 space-y-2">
        {analysis.composition.zones?.map((zone: any, i: number) => (
          <div key={i} className="pl-4 border-l-2 border-[var(--coconut-shell)]/20">
            <div className={`text-sm ${tokens.colors.text.primary}`}>{zone.name}</div>
            <div className={`text-sm ${tokens.colors.text.tertiary}`}>{zone.description}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function PaletteSection({ analysis }: { analysis: any }) {
  return (
    <Section icon="🎨" title="PALETTE COLORIMÉTRIQUE" iconComponent={Palette} index={2}>
      <ColorGroup label="Fond" colors={analysis.colorPalette.background} />
      <ColorGroup label="Accent primaire" colors={analysis.colorPalette.primary} />
      <ColorGroup label="Accent secondaire" colors={analysis.colorPalette.accent} />
      <ColorGroup label="Texte" colors={analysis.colorPalette.text} />
      {analysis.colorPalette.rationale && (
        <div className={`mt-4 p-4 ${tokens.colors.surface.elevated} backdrop-blur-sm ${tokens.radius.md} ${tokens.colors.border.base} border`}>
          <div className={`text-sm ${tokens.colors.text.tertiary} italic`}>
            {analysis.colorPalette.rationale}
          </div>
        </div>
      )}
    </Section>
  );
}

function PromptSection({ finalPrompt }: { finalPrompt: any }) {
  return (
    <Section icon="📝" title="PROMPT GÉNÉRÉ" iconComponent={Code} index={3}>
      <div className={`bg-[var(--coconut-shell)]/5 backdrop-blur-sm ${tokens.radius.md} p-4 border border-[var(--coconut-shell)]/20 max-h-96 overflow-auto`}>
        <pre className={`text-sm ${tokens.colors.text.primary} whitespace-pre-wrap break-words`}>
          {JSON.stringify(finalPrompt, null, 2)}
        </pre>
      </div>
      
      {/* Simplified view */}
      <div className="mt-4 space-y-3">
        <div>
          <div className={`text-sm ${tokens.colors.text.primary} mb-1`}>Scène :</div>
          <div className={`text-sm ${tokens.colors.text.secondary} pl-4`}>{finalPrompt.scene}</div>
        </div>
        <div>
          <div className={`text-sm ${tokens.colors.text.primary} mb-1`}>Style :</div>
          <div className={`text-sm ${tokens.colors.text.secondary} pl-4`}>{finalPrompt.style}</div>
        </div>
        <div>
          <div className={`text-sm ${tokens.colors.text.primary} mb-1`}>Éclairage :</div>
          <div className={`text-sm ${tokens.colors.text.secondary} pl-4`}>{finalPrompt.lighting}</div>
        </div>
        <div>
          <div className={`text-sm ${tokens.colors.text.primary} mb-1`}>Ambiance :</div>
          <div className={`text-sm ${tokens.colors.text.secondary} pl-4`}>{finalPrompt.mood}</div>
        </div>
      </div>
    </Section>
  );
}

function ReferencesSection({ references, onAddReference }: { references: any[]; onAddReference: () => void }) {
  return (
    <Section icon="✅" title="RÉFÉRENCES" iconComponent={Settings} index={4}>
      <div className="space-y-2">
        {references && references.length > 0 ? (
          references.map((ref: any, i: number) => (
            <div key={ref.id || i} className={`flex items-start ${tokens.gap.normal} p-3 ${tokens.colors.surface.elevated} backdrop-blur-sm ${tokens.radius.md} ${tokens.colors.border.base} border`}>
              <img 
                src={ref.url} 
                alt={ref.description || ref.filename}
                className={`w-16 h-16 object-cover ${tokens.radius.md}`}
              />
              <div className="flex-1">
                <div className={`text-sm ${tokens.colors.text.primary}`}>
                  Image fournie : {ref.description || ref.filename}
                </div>
                <div className={`text-xs ${tokens.colors.text.tertiary}`}>
                  Utilisée dans génération
                </div>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            icon={ImageIcon}
            title={EmptyStatePresets.noReferences.title}
            description={EmptyStatePresets.noReferences.description}
            actionLabel={EmptyStatePresets.noReferences.actionLabel}
            onAction={onAddReference}
            size="sm"
          />
        )}
      </div>
    </Section>
  );
}

function SpecsSection({ specs, references, cost }: { specs: any; references: any[]; cost: any }) {
  // Translate technical values to French
  const MODEL_LABELS: Record<string, string> = {
    'flux-2-pro': 'Flux 2 Pro',
    'flux-1.1-pro': 'Flux 1.1 Pro',
  };
  
  const MODE_LABELS: Record<string, string> = {
    'text-to-image': 'Texte → Image',
    'image-to-image': 'Image → Image',
  };
  
  return (
    <Section icon="⚙️" title="PARAMÈTRES & COÛT" iconComponent={Settings} index={5}>
      {/* Technical Specs */}
      <div className="space-y-2 mb-4">
        <InfoRow label="Modèle" value={MODEL_LABELS[specs.model] || specs.model} />
        <InfoRow label="Mode" value={MODE_LABELS[specs.mode] || specs.mode} />
        <InfoRow label="Ratio" value={specs.ratio} />
        <InfoRow label="Résolution" value={specs.resolution} />
        <InfoRow label="Références" value={`${references?.length || 0} image(s)`} />
      </div>
      
      {/* Cost Breakdown */}
      <div className={`p-4 ${tokens.colors.surface.elevated} backdrop-blur-sm ${tokens.radius.md} ${tokens.colors.border.base} border`}>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className={`text-sm ${tokens.colors.text.secondary}`}>CocoBoard (analyse)</span>
            <span className={`text-sm ${tokens.colors.text.primary}`}>{cost.analysis} crédits</span>
          </div>
          <div className="flex justify-between items-center">
            <span className={`text-sm ${tokens.colors.text.secondary}`}>Génération ({specs.resolution})</span>
            <span className={`text-sm ${tokens.colors.text.primary}`}>{cost.finalGeneration} crédits</span>
          </div>
          <div className="h-px bg-[var(--coconut-shell)]/20 my-2" />
          <div className="flex justify-between items-center">
            <span className={tokens.colors.text.primary}>Total</span>
            <span className={`text-xl ${tokens.colors.text.primary}`}>{cost.total} crédits</span>
          </div>
        </div>
      </div>
    </Section>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

interface SectionProps {
  icon: string;
  title: string;
  iconComponent: React.ElementType;
  children: React.ReactNode;
  index: number;
}

function Section({ icon, title, iconComponent: Icon, children, index }: SectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        ...TRANSITIONS.medium,
        delay: getStaggerDelay(index),
      }}
      className="relative"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-[var(--coconut-shell)]/10 to-[var(--coconut-palm)]/10 rounded-2xl blur opacity-50" />
      <div className={`relative ${tokens.colors.surface.glass} ${tokens.radius.lg} p-6 ${tokens.colors.border.subtle} border ${tokens.shadows.lg}`}>
        <div className={`flex items-center ${tokens.gap.normal} mb-4`}>
          <div className={`w-10 h-10 bg-gradient-to-br from-[var(--coconut-shell)]/20 to-[var(--coconut-husk)]/20 ${tokens.radius.md} flex items-center justify-center`}>
            <span className="text-2xl">{icon}</span>
          </div>
          <h3 className={tokens.colors.text.primary}>{title}</h3>
        </div>
        <div className="space-y-3">
          {children}
        </div>
      </div>
    </motion.section>
  );
}

interface InfoRowProps {
  label: string;
  value: string | number;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
      <div className={`text-sm ${tokens.colors.text.primary} min-w-[140px]`}>{label} :</div>
      <div className={`text-sm ${tokens.colors.text.secondary}`}>{value}</div>
    </div>
  );
}

interface ColorGroupProps {
  label: string;
  colors: string[];
}

function ColorGroup({ label, colors }: ColorGroupProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <div className={`text-sm ${tokens.colors.text.primary} min-w-[140px]`}>{label} :</div>
      <div className="flex flex-wrap gap-2">
        {colors && colors.map((color, i) => (
          <div key={i} className="flex items-center gap-2 bg-white/40 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/40">
            <div 
              className="w-6 h-6 rounded border border-white/60 shadow-sm"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-[var(--coconut-husk)]">{color}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Empty State Component
interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  size?: 'sm' | 'md' | 'lg';
}

function EmptyState({ icon: Icon, title, description, actionLabel, onAction, size = 'md' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center ${tokens.gap.normal} p-4 ${tokens.colors.surface.elevated} backdrop-blur-sm ${tokens.radius.md} ${tokens.colors.border.base} border ${size === 'sm' ? 'w-64' : ''}`}>
      <Icon className="w-10 h-10 text-[var(--coconut-husk)]/50" />
      <h4 className={tokens.colors.text.primary}>{title}</h4>
      <p className={`text-sm ${tokens.colors.text.tertiary} text-center`}>{description}</p>
      <button
        className={`px-4 py-2 ${tokens.colors.button.primary} ${tokens.radius.md}`}
        onClick={onAction}
      >
        {actionLabel}
      </button>
    </div>
  );
}