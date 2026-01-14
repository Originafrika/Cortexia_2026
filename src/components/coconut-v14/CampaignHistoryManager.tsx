/**
 * COCONUT V14 - CAMPAIGN HISTORY MANAGER ULTRA-PREMIUM
 * Real Campaign History with Backend Integration
 * 
 * Features:
 * - Fetches real campaigns from backend
 * - Premium glass thumbnail gallery
 * - Campaign-specific stats
 * - Filters & search
 * - BDS 7 Arts compliance
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  Star, 
  Download, 
  Trash2, 
  Eye, 
  Search,
  CheckCircle,
  Loader2,
  TrendingUp,
  Sparkles,
  Zap,
  Calendar,
  BarChart3,
  Target,
  Image as ImageIcon,
  Video,
  PlayCircle,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useSoundContext } from './SoundProvider';
import { useNotify } from './NotificationProvider';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import type { CampaignSummary } from '../../lib/types/coconut-v14-campaign';

interface CampaignHistoryManagerProps {
  userId: string;
  onViewCampaign?: (cocoBoardId: string) => void;
}

export function CampaignHistoryManager({ userId, onViewCampaign }: CampaignHistoryManagerProps) {
  const { playClick, playSuccess, playWhoosh, playPop } = useSoundContext();
  const notify = useNotify();
  
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<CampaignSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'generating' | 'completed' | 'error'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'budget' | 'assets'>('date');
  const [showStats, setShowStats] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignSummary | null>(null);

  // Load campaigns
  useEffect(() => {
    loadCampaigns();
  }, [userId]);

  // Filter and sort
  useEffect(() => {
    let filtered = [...campaigns];

    if (filterStatus !== 'all') {
      filtered = filtered.filter(c => c.status === filterStatus);
    }

    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.campaignTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'budget') {
      filtered.sort((a, b) => b.budgetTotal - a.budgetTotal);
    } else if (sortBy === 'assets') {
      filtered.sort((a, b) => b.totalAssets - a.totalAssets);
    }

    setFilteredCampaigns(filtered);
  }, [campaigns, filterStatus, searchQuery, sortBy]);

  const loadCampaigns = async () => {
    setIsLoading(true);
    try {
      console.log('📥 [Campaign History] Fetching campaigns for user:', userId);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/campaign/list?userId=${encodeURIComponent(userId)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      const result = await response.json();
      console.log('📦 [Campaign History] Response:', result);

      if (!result.success) {
        throw new Error(result.error || 'Failed to load campaigns');
      }

      setCampaigns(result.data.campaigns);
      console.log('✅ [Campaign History] Loaded campaigns:', result.data.campaigns.length);
      
    } catch (err) {
      console.error('❌ [Campaign History] Error loading campaigns:', err);
      notify?.error('Erreur lors du chargement des campagnes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette campagne ?')) return;
    
    playClick();
    try {
      console.log('🗑️ [Campaign History] Deleting campaign:', id);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/campaign/${id}?userId=${encodeURIComponent(userId)}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete campaign');
      }

      setCampaigns(prev => prev.filter(c => c.id !== id));
      notify?.success('Campagne supprimée');
      console.log('✅ [Campaign History] Campaign deleted');
      
    } catch (err) {
      console.error('❌ [Campaign History] Error deleting campaign:', err);
      notify?.error('Erreur lors de la suppression');
    }
  };

  const handleView = (campaign: CampaignSummary) => {
    playClick();
    if (onViewCampaign) {
      onViewCampaign(campaign.id);
    }
  };

  const handleToggleStats = () => {
    playPop();
    setShowStats(!showStats);
  };

  const handleFilterStatus = (e: React.ChangeEvent<HTMLSelectElement>) => {
    playWhoosh();
    setFilterStatus(e.target.value as any);
  };

  const handleSortBy = (e: React.ChangeEvent<HTMLSelectElement>) => {
    playWhoosh();
    setSortBy(e.target.value as any);
  };

  const handleCloseDetails = () => {
    playClick();
    setSelectedCampaign(null);
  };

  const stats = {
    total: campaigns.length,
    completed: campaigns.filter(c => c.status === 'completed').length,
    generating: campaigns.filter(c => c.status === 'generating').length,
    draft: campaigns.filter(c => c.status === 'draft').length,
    totalBudget: campaigns.reduce((sum, c) => sum + c.budgetTotal, 0),
    totalAssets: campaigns.reduce((sum, c) => sum + c.totalAssets, 0),
    completedAssets: campaigns.reduce((sum, c) => sum + c.completedAssets, 0),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'from-green-500 to-green-600';
      case 'generating':
        return 'from-blue-500 to-blue-600';
      case 'error':
        return 'from-red-500 to-red-600';
      default:
        return 'from-warm-500 to-warm-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'generating':
        return Loader2;
      case 'error':
        return AlertCircle;
      default:
        return FileText;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--coconut-white)] relative overflow-hidden">
      {/* Premium animated background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[var(--coconut-cream)] via-[var(--coconut-milk)] to-[var(--coconut-white)] opacity-60" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(212,165,116,0.08)_0%,transparent_50%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(107,142,112,0.06)_0%,transparent_50%)]" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold text-[var(--coconut-shell)]">
              <div className="w-12 h-12 bg-gradient-to-br from-[var(--coconut-shell)]/20 to-[var(--coconut-husk)]/20 rounded-xl flex items-center justify-center backdrop-blur-xl border border-white/40">
                <Target className="w-6 h-6 text-[var(--coconut-shell)]" />
              </div>
              Historique des Campagnes
            </h1>
            <p className="text-[var(--coconut-husk)] mt-1 text-sm">
              {filteredCampaigns.length} de {campaigns.length} campagne{campaigns.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleToggleStats}
            className="px-4 py-2 bg-white/50 backdrop-blur-xl hover:bg-white/70 rounded-xl flex items-center gap-2 border border-white/40 shadow-lg transition-all duration-300"
          >
            <BarChart3 className="w-5 h-5 text-[var(--coconut-shell)]" />
            <span className="text-[var(--coconut-shell)]">{showStats ? 'Masquer' : 'Afficher'} Stats</span>
          </motion.button>
        </motion.div>

        {/* Stats Cards */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4"
            >
              {[ 
                { label: 'Total', value: stats.total, color: 'from-slate-500 to-slate-600', icon: Target },
                { label: 'Terminées', value: stats.completed, color: 'from-green-500 to-green-600', icon: CheckCircle },
                { label: 'En cours', value: stats.generating, color: 'from-blue-500 to-blue-600', icon: PlayCircle },
                { label: 'Brouillon', value: stats.draft, color: 'from-warm-500 to-warm-600', icon: FileText },
                { label: 'Budget Total', value: stats.totalBudget, color: 'from-amber-500 to-amber-600', icon: Zap },
                { label: 'Assets Total', value: stats.totalAssets, color: 'from-purple-500 to-purple-600', icon: ImageIcon },
                { label: 'Assets Créés', value: stats.completedAssets, color: 'from-[var(--coconut-palm)] to-[var(--coconut-shell)]', icon: Sparkles },
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05, y: -4 }}
                    className="relative"
                  >
                    <div className={`absolute -inset-1 bg-gradient-to-br ${stat.color}/20 rounded-2xl blur-lg opacity-50`} />
                    <div className="relative bg-white/70 backdrop-blur-xl rounded-xl shadow-xl p-4 border border-white/60 text-center">
                      <div className={`w-8 h-8 mx-auto mb-2 bg-gradient-to-br ${stat.color}/10 rounded-lg flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-[var(--coconut-shell)]" />
                      </div>
                      <div className="text-2xl font-bold text-[var(--coconut-shell)] mb-1">{stat.value}</div>
                      <div className="text-xs text-[var(--coconut-husk)]">{stat.label}</div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-[var(--coconut-shell)]/20 to-[var(--coconut-palm)]/20 rounded-2xl blur-lg opacity-50" />
          <div className="relative bg-white/70 backdrop-blur-xl rounded-xl shadow-xl p-4 border border-white/60">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--coconut-husk)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher des campagnes..."
                  className="w-full pl-10 pr-4 py-2 bg-white/50 border border-white/40 rounded-lg text-[var(--coconut-shell)] placeholder-[var(--coconut-husk)] focus:outline-none focus:border-[var(--coconut-palm)] transition-colors backdrop-blur-xl"
                />
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={handleFilterStatus}
                className="px-4 py-2 bg-white/50 border border-white/40 rounded-lg text-[var(--coconut-shell)] focus:outline-none focus:border-[var(--coconut-palm)] transition-colors cursor-pointer backdrop-blur-xl"
              >
                <option value="all">Tous les statuts</option>
                <option value="draft">Brouillon</option>
                <option value="generating">En cours</option>
                <option value="completed">Terminées</option>
                <option value="error">Erreur</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={handleSortBy}
                className="px-4 py-2 bg-white/50 border border-white/40 rounded-lg text-[var(--coconut-shell)] focus:outline-none focus:border-[var(--coconut-palm)] transition-colors cursor-pointer backdrop-blur-xl"
              >
                <option value="date">Trier par Date</option>
                <option value="budget">Trier par Budget</option>
                <option value="assets">Trier par Assets</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Gallery */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-[var(--coconut-shell)] animate-spin mx-auto mb-4" />
              <p className="text-[var(--coconut-husk)]">Chargement de l'historique...</p>
            </div>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-[var(--coconut-shell)]/20 to-[var(--coconut-husk)]/20 rounded-3xl blur-xl opacity-50" />
            <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl p-12 border border-white/60 text-center">
              <Target className="w-16 h-16 text-[var(--coconut-husk)] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[var(--coconut-shell)] mb-2">Aucune Campagne</h3>
              <p className="text-[var(--coconut-husk)]">Créez votre première campagne pour la voir apparaître ici</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredCampaigns.map((campaign, index) => {
              const StatusIcon = getStatusIcon(campaign.status);
              const progress = campaign.totalAssets > 0 
                ? Math.round((campaign.completedAssets / campaign.totalAssets) * 100)
                : 0;

              return (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -8 }}
                  className="relative group"
                >
                  {/* Glow */}
                  <div className={`absolute -inset-1 bg-gradient-to-br ${getStatusColor(campaign.status)}/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  
                  {/* Card */}
                  <div className="relative bg-white/70 backdrop-blur-xl rounded-xl shadow-xl overflow-hidden border border-white/60">
                    {/* Header */}
                    <div className="p-4 border-b border-warm-200/50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-[var(--coconut-shell)] line-clamp-2 mb-1">
                            {campaign.campaignTitle}
                          </h3>
                          <p className="text-xs text-[var(--coconut-husk)]">
                            ID: {campaign.id.substring(0, 12)}...
                          </p>
                        </div>
                        
                        {/* Status Badge */}
                        <div className={`px-3 py-1 bg-gradient-to-r ${getStatusColor(campaign.status)} text-white rounded-lg text-xs font-semibold flex items-center gap-1`}>
                          <StatusIcon className={`w-3 h-3 ${campaign.status === 'generating' ? 'animate-spin' : ''}`} />
                          {campaign.status}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-[var(--coconut-husk)] mb-1">
                          <span>Progression</span>
                          <span className="font-semibold">{progress}%</span>
                        </div>
                        <div className="h-2 bg-warm-200/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className={`h-full bg-gradient-to-r ${getStatusColor(campaign.status)}`}
                          />
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-warm-50 rounded-lg p-2">
                          <div className="text-xs text-[var(--coconut-husk)] mb-1">Assets</div>
                          <div className="text-sm font-bold text-[var(--coconut-shell)]">
                            {campaign.completedAssets}/{campaign.totalAssets}
                          </div>
                        </div>
                        <div className="bg-warm-50 rounded-lg p-2">
                          <div className="text-xs text-[var(--coconut-husk)] mb-1">Budget</div>
                          <div className="text-sm font-bold text-[var(--coconut-shell)]">
                            {campaign.budgetUsed}cr
                          </div>
                        </div>
                        <div className="bg-warm-50 rounded-lg p-2">
                          <div className="text-xs text-[var(--coconut-husk)] mb-1">Total</div>
                          <div className="text-sm font-bold text-[var(--coconut-shell)]">
                            {campaign.budgetTotal}cr
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-warm-50/50">
                      <div className="flex items-center justify-between text-xs text-[var(--coconut-husk)] mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(campaign.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                        {campaign.completedAt && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-green-600" />
                            {new Date(campaign.completedAt).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleView(campaign)}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-warm-500 to-warm-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Voir
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(campaign.id)}
                          className="px-4 py-2 bg-white/50 hover:bg-red-50 border border-warm-200 rounded-lg text-sm font-semibold text-[var(--coconut-shell)] hover:text-red-600 transition-all flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
      
      {/* Detail Modal */}
      <AnimatePresence>
        {selectedCampaign && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseDetails}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-2xl w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-2xl font-bold text-[var(--coconut-shell)] mb-4">
                  {selectedCampaign.campaignTitle}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-[var(--coconut-husk)]">Créée le:</span>
                    <span className="text-[var(--coconut-shell)] ml-2 font-semibold">
                      {new Date(selectedCampaign.createdAt).toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--coconut-husk)]">Statut:</span>
                    <span className="text-[var(--coconut-shell)] ml-2 font-semibold capitalize">
                      {selectedCampaign.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--coconut-husk)]">Assets total:</span>
                    <span className="text-[var(--coconut-shell)] ml-2 font-semibold">
                      {selectedCampaign.totalAssets}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--coconut-husk)]">Assets créés:</span>
                    <span className="text-[var(--coconut-shell)] ml-2 font-semibold">
                      {selectedCampaign.completedAssets}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--coconut-husk)]">Budget utilisé:</span>
                    <span className="text-[var(--coconut-shell)] ml-2 font-semibold">
                      {selectedCampaign.budgetUsed} crédits
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--coconut-husk)]">Budget total:</span>
                    <span className="text-[var(--coconut-shell)] ml-2 font-semibold">
                      {selectedCampaign.budgetTotal} crédits
                    </span>
                  </div>
                  {selectedCampaign.completedAt && (
                    <div>
                      <span className="text-[var(--coconut-husk)]">Terminée le:</span>
                      <span className="text-[var(--coconut-shell)] ml-2 font-semibold">
                        {new Date(selectedCampaign.completedAt).toLocaleString('fr-FR')}
                      </span>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleCloseDetails}
                  className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-warm-500 to-warm-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CampaignHistoryManager;