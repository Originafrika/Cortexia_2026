/**
 * 🏢 ANALYSIS VIEW ENTERPRISE - PREMIUM LIGHT
 * Clean analysis display - Phase 4 du workflow
 * 
 * COCONUT PREMIUM DESIGN SYSTEM V3
 * - Light theme with Warm Cream accents
 * - Tabbed interface with smooth transitions
 * - BDS: Logique (Art 2) + Géométrie (Art 5)
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Edit2,
  ArrowRight,
  Sparkles,
  Image as ImageIcon,
  Palette,
  Box,
  Eye
} from 'lucide-react';
import { Button } from '../ui-enterprise/Button';
import { Card, CardContent } from '../ui-enterprise/Card';
import { Badge } from '../ui-enterprise/Badge';
import type { GeminiAnalysisResponse } from '../../lib/types/gemini';

interface AnalysisViewEnterpriseProps {
  analysis: GeminiAnalysisResponse;
  onProceed: () => void;
  onEdit: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function AnalysisViewEnterprise({ 
  analysis, 
  onProceed, 
  onEdit, 
  onBack,
  isLoading = false 
}: AnalysisViewEnterpriseProps) {
  const [activeTab, setActiveTab] = useState<'concept' | 'composition' | 'colors' | 'assets'>('concept');

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full" />
          <h1 className="text-3xl font-bold text-stone-900">
            Analyse complétée
          </h1>
        </div>
        <p className="text-lg text-stone-600">
          {analysis.projectTitle || 'Votre projet créatif'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-stone-200">
        <TabButton
          active={activeTab === 'concept'}
          onClick={() => setActiveTab('concept')}
          icon={<Sparkles className="w-4 h-4" />}
          label="Concept"
        />
        <TabButton
          active={activeTab === 'composition'}
          onClick={() => setActiveTab('composition')}
          icon={<Box className="w-4 h-4" />}
          label="Composition"
        />
        <TabButton
          active={activeTab === 'colors'}
          onClick={() => setActiveTab('colors')}
          icon={<Palette className="w-4 h-4" />}
          label="Couleurs"
        />
        <TabButton
          active={activeTab === 'assets'}
          onClick={() => setActiveTab('assets')}
          icon={<ImageIcon className="w-4 h-4" />}
          label="Assets"
        />
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'concept' && (
          <ConceptTab analysis={analysis} />
        )}
        
        {activeTab === 'composition' && (
          <CompositionTab analysis={analysis} />
        )}
        
        {activeTab === 'colors' && (
          <ColorsTab analysis={analysis} />
        )}
        
        {activeTab === 'assets' && (
          <AssetsTab analysis={analysis} />
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-6 border-t border-stone-200">
        <Button 
          variant="ghost" 
          onClick={onBack}
        >
          Retour
        </Button>
        <Button 
          variant="outline" 
          onClick={onEdit}
          icon={<Edit2 className="w-4 h-4" />}
        >
          Modifier la direction
        </Button>
        <div className="flex-1" />
        <Button 
          variant="primary" 
          size="lg"
          onClick={onProceed}
          disabled={isLoading}
          icon={<ArrowRight className="w-4 h-4" />}
        >
          {isLoading ? 'Chargement...' : 'Continuer vers CocoBoard'}
        </Button>
      </div>
    </div>
  );
}

// Tab Button Component
function TabButton({ 
  active, 
  onClick, 
  icon, 
  label 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string; 
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-3 font-semibold transition-colors relative
        ${active 
          ? 'text-cream-600' 
          : 'text-stone-500 hover:text-stone-700'
        }
      `}
    >
      {icon}
      {label}
      {active && (
        <motion.div 
          layoutId="activeTab"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-cream-500"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </button>
  );
}

// Concept Tab
function ConceptTab({ analysis }: { analysis: GeminiAnalysisResponse }) {
  return (
    <div className="grid gap-4">
      <Card>
        <CardContent className="p-6 space-y-4 bg-white border-stone-200">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
              Direction créative
            </h3>
            <p className="text-stone-900 text-lg font-medium">{analysis.concept.direction}</p>
          </div>
          
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
              Message clé
            </h3>
            <p className="text-stone-700">{analysis.concept.keyMessage}</p>
          </div>
          
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
              Ambiance
            </h3>
            <p className="text-stone-700">{analysis.concept.mood}</p>
          </div>
        </CardContent>
      </Card>

      {analysis.creativityAnalysis && (
        <Card>
          <CardContent className="p-6 space-y-4 bg-gradient-to-br from-cream-50 to-amber-50 border-cream-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Score de créativité
              </h3>
              <Badge variant="success">
                {analysis.creativityAnalysis.overallScore}/10
              </Badge>
            </div>
            <p className="text-stone-700 text-sm">
              {analysis.creativityAnalysis.creativityJustification}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Composition Tab
function CompositionTab({ analysis }: { analysis: GeminiAnalysisResponse }) {
  return (
    <div className="grid gap-4">
      <Card>
        <CardContent className="p-6 space-y-4 bg-white border-stone-200">
          <div className="flex items-center gap-6">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">Format</h3>
              <p className="text-stone-900 text-lg font-bold mt-1">{analysis.composition.ratio}</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">Résolution</h3>
              <p className="text-stone-900 text-lg font-bold mt-1">{analysis.composition.resolution}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-3 bg-white border-stone-200">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3">
            Zones de composition
          </h3>
          {analysis.composition.zones.map((zone, index) => (
            <div key={index} className="p-4 bg-stone-50 rounded-lg border border-stone-200">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-stone-900 font-semibold">{zone.name}</h4>
                <Badge variant="default" size="sm">{zone.position}</Badge>
              </div>
              <p className="text-stone-600 text-sm">{zone.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// Colors Tab
function ColorsTab({ analysis }: { analysis: GeminiAnalysisResponse }) {
  return (
    <div className="grid gap-4">
      <Card>
        <CardContent className="p-6 space-y-4 bg-white border-stone-200">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3">
              Rationale
            </h3>
            <p className="text-stone-700">{analysis.colorPalette.rationale}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ColorGroup title="Couleurs primaires" colors={analysis.colorPalette.primary} />
            <ColorGroup title="Couleurs accent" colors={analysis.colorPalette.accent} />
            <ColorGroup title="Arrière-plan" colors={analysis.colorPalette.background} />
            <ColorGroup title="Texte" colors={analysis.colorPalette.text} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ColorGroup({ title, colors }: { title: string; colors: string[] }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">{title}</h4>
      <div className="flex gap-2">
        {colors.map((color, index) => (
          <div key={index} className="group relative">
            <div 
              className="w-12 h-12 rounded-lg border-2 border-stone-300 hover:border-cream-400 transition-colors cursor-pointer shadow-sm"
              style={{ backgroundColor: color }}
            />
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs text-stone-600 font-mono">{color}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Assets Tab
function AssetsTab({ analysis }: { analysis: GeminiAnalysisResponse }) {
  return (
    <div className="grid gap-4">
      {analysis.assetsRequired.available.length > 0 && (
        <Card>
          <CardContent className="p-6 space-y-3 bg-white border-stone-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <h3 className="text-sm font-semibold text-stone-900">Assets disponibles</h3>
            </div>
            {analysis.assetsRequired.available.map((asset, index) => (
              <div key={index} className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-stone-900 font-semibold">{asset.description}</h4>
                  <Badge variant="success" size="sm">{asset.type}</Badge>
                </div>
                <p className="text-stone-700 text-sm mb-1">
                  <strong>Usage:</strong> {asset.usage}
                </p>
                {asset.notes && (
                  <p className="text-stone-500 text-xs">{asset.notes}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {analysis.assetsRequired.missing.length > 0 && (
        <Card>
          <CardContent className="p-6 space-y-3 bg-white border-stone-200">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm font-semibold text-stone-900">Assets manquants</h3>
            </div>
            {analysis.assetsRequired.missing.map((asset, index) => (
              <div key={index} className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-stone-900 font-semibold">{asset.description}</h4>
                  <Badge variant="warning" size="sm">{asset.type}</Badge>
                </div>
                <p className="text-stone-700 text-sm">
                  <strong>Action:</strong> {
                    asset.requiredAction === 'generate' ? 'Sera généré automatiquement' :
                    asset.requiredAction === 'request-from-user' ? 'Upload requis' :
                    'Inclus dans le prompt final'
                  }
                </p>
                {asset.canBeGenerated && (
                  <Badge variant="default" size="sm" className="mt-2">Génération possible</Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}