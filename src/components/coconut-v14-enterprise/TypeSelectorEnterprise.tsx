/**
 * 🏢 TYPE SELECTOR ENTERPRISE
 * Clean minimal Figma/Notion style - Phase 1 du workflow
 * BDS: Grammaire (Art 1) + Logique (Art 2) + Géométrie (Art 5)
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  Image as ImageIcon, 
  Video, 
  Layers,
  Sparkles,
  Zap,
  Clock,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { Button } from '../ui-enterprise/Button';
import { Badge } from '../ui-enterprise/Badge';
import { Card } from '../ui-enterprise/Card';

interface TypeSelectorEnterpriseProps {
  onSelectType: (type: 'image' | 'video' | 'campaign') => void;
  onBack: () => void;
  onBrowseTemplates?: () => void;
  coconutGenerationsRemaining?: number;
  isEnterprise?: boolean;
}

export function TypeSelectorEnterprise({ 
  onSelectType, 
  onBack,
  onBrowseTemplates,
  coconutGenerationsRemaining,
  isEnterprise 
}: TypeSelectorEnterpriseProps) {
  
  const types = [
    {
      id: 'image' as const,
      icon: ImageIcon,
      title: 'Image',
      subtitle: 'Visuel statique haute qualité',
      description: 'Créez des images uniques avec IA : affiches, visuels de marque, illustrations, designs de produits.',
      features: ['4K Resolution', '45-90s', '~115 crédits'],
      tags: ['Populaire', 'Recommandé'],
      popular: true,
    },
    {
      id: 'video' as const,
      icon: Video,
      title: 'Vidéo',
      subtitle: 'Animation dynamique et motion',
      description: 'Générez des vidéos captivantes : clips promotionnels, animations de marque, stories.',
      features: ['1080p', '2-5 min', '~250 crédits'],
      tags: [],
      popular: false,
    },
    {
      id: 'campaign' as const,
      icon: Layers,
      title: 'Campagne',
      subtitle: 'Multi-format & stratégie complète',
      description: 'Orchestrez des campagnes complètes : contenus multi-plateformes, stratégie cohérente.',
      features: ['Multi-format', '5-10 min', '400+ crédits'],
      tags: ['Entreprise'],
      popular: false,
    },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-blue-500 rounded-full" />
          <h1 className="text-2xl font-semibold text-white">
            Que souhaitez-vous créer ?
          </h1>
        </div>
        <p className="text-gray-400">
          Choisissez le format qui correspond à votre projet. L'IA analysera ensuite votre demande avec Gemini 2.5 Flash.
        </p>

        {/* Quota indicator */}
        {!isEnterprise && coconutGenerationsRemaining !== undefined && (
          <Card className="inline-flex items-center gap-4 p-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Coconut Générations
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-xl font-bold ${coconutGenerationsRemaining === 0 ? 'text-red-500' : 'text-white'}`}>
                  {coconutGenerationsRemaining}
                </span>
                <span className="text-sm text-gray-400">/ 3 restantes ce mois</span>
              </div>
            </div>
            {coconutGenerationsRemaining === 0 && (
              <Badge variant="error">Quota épuisé</Badge>
            )}
          </Card>
        )}
      </div>

      {/* Type Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {types.map((type, index) => {
          const Icon = type.icon;
          const canGenerate = isEnterprise || (coconutGenerationsRemaining ?? 0) > 0;

          return (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                clickable
                hover
                onClick={() => canGenerate && onSelectType(type.id)}
                className={`h-full ${!canGenerate ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex flex-col h-full">
                  {/* Icon & Badges */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="flex gap-2">
                      {type.tags.map(tag => (
                        <Badge 
                          key={tag} 
                          variant={tag === 'Populaire' ? 'success' : 'default'}
                          size="sm"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {type.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {type.subtitle}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-400 mb-4 flex-1">
                    {type.description}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {type.features.map(feature => (
                      <div
                        key={feature}
                        className="px-2 py-1 rounded bg-gray-800 text-xs text-gray-400"
                      >
                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <Button
                    variant={type.popular ? 'primary' : 'secondary'}
                    size="sm"
                    fullWidth
                    disabled={!canGenerate}
                    icon={<ArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    Sélectionner
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Browse Templates */}
      {onBrowseTemplates && (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={onBrowseTemplates}
            icon={<Sparkles className="w-4 h-4" />}
          >
            Parcourir les templates
          </Button>
        </div>
      )}
    </div>
  );
}
