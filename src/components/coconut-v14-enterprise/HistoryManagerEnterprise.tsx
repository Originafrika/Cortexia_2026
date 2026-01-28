/**
 * 🏢 HISTORY MANAGER ENTERPRISE - PREMIUM LIGHT
 * Clean history display - Professional style
 * 
 * COCONUT PREMIUM DESIGN SYSTEM V3
 * - Light theme with Warm Cream accents
 * - Grid layout with hover effects
 * - BDS: Astronomie (Art 7) - Vision systémique
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Clock, 
  Image as ImageIcon, 
  Video, 
  Layers,
  Download,
  Trash2,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '../ui-enterprise/Button';
import { Card } from '../ui-enterprise/Card';
import { Input } from '../ui-enterprise/Input';
import { Badge } from '../ui-enterprise/Badge';
import { EmptyState } from '../ui-enterprise/EmptyState';

interface HistoryItem {
  id: string;
  type: 'image' | 'video' | 'campaign';
  title: string;
  timestamp: string;
  thumbnailUrl?: string;
  status: 'completed' | 'failed' | 'generating';
}

interface HistoryManagerEnterpriseProps {
  items?: HistoryItem[];
  isLoading?: boolean;
  onItemClick?: (id: string) => void;
  onDownload?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function HistoryManagerEnterprise({ 
  items = [],
  isLoading = false,
  onItemClick, 
  onDownload, 
  onDelete 
}: HistoryManagerEnterpriseProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'campaign'>('all');

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return ImageIcon;
      case 'video': return Video;
      case 'campaign': return Layers;
      default: return ImageIcon;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success" size="sm">Terminé</Badge>;
      case 'generating':
        return <Badge variant="warning" size="sm">En cours</Badge>;
      case 'failed':
        return <Badge variant="error" size="sm">Échoué</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="p-8 space-y-8 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">Historique</h1>
          <p className="text-lg text-stone-600">Retrouvez toutes vos générations passées</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info" size="md">{items.length} générations</Badge>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Rechercher une génération..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="flex gap-2">
          {['all', 'image', 'video', 'campaign'].map((type) => (
            <Button
              key={type}
              variant={filterType === type ? 'primary' : 'secondary'}
              size="md"
              onClick={() => setFilterType(type as any)}
            >
              {type === 'all' ? 'Tout' : type === 'image' ? 'Images' : type === 'video' ? 'Vidéos' : 'Campagnes'}
            </Button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="Aucune génération"
          description="Vous n'avez pas encore de générations. Créez votre première création !"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => {
            const Icon = getTypeIcon(item.type);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  interactive 
                  hoverable 
                  onClick={() => onItemClick?.(item.id)} 
                  className="group bg-white border-stone-200 hover:border-cream-300 hover:shadow-lg"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-stone-100 rounded-lg mb-4 overflow-hidden relative">
                    {item.thumbnailUrl ? (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon className="w-12 h-12 text-stone-400" />
                      </div>
                    )}
                    
                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {onDownload && item.status === 'completed' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<Download className="w-4 h-4" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDownload(item.id);
                          }}
                        >
                          Télécharger
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 className="w-4 h-4" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(item.id);
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-stone-900 text-sm line-clamp-1">
                        {item.title}
                      </h3>
                      {getStatusBadge(item.status)}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      <Icon className="w-3 h-3" />
                      <span>{item.type}</span>
                      <span>•</span>
                      <span>{item.timestamp}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}