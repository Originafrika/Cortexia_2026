/**
 * PROJECTS LIST - COCONUT V14
 * Display and manage user projects with premium design
 * BDS 7 Arts compliant
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Grid, List, Search, Filter, Plus, Sparkles, 
  Clock, Image, Video, Layers, Trash2, Edit2
} from 'lucide-react';
import { useSoundContext } from './SoundProvider';

interface Project {
  id: string;
  name: string;
  type: 'image' | 'video' | 'campaign';
  thumbnail: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'analyzing' | 'completed';
}

interface ProjectsListProps {
  projects?: Project[];
  onCreateNew: () => void;
  onProjectClick: (projectId: string) => void;
}

export function ProjectsList({ 
  projects = [], 
  onCreateNew,
  onProjectClick 
}: ProjectsListProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const { playClick, playPop } = useSoundContext();

  // Demo data if no projects
  const demoProjects: Project[] = projects.length > 0 ? projects : [
    {
      id: '1',
      name: 'Summer Campaign 2026',
      type: 'campaign',
      thumbnail: '',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
      status: 'completed'
    },
    {
      id: '2',
      name: 'Product Launch Video',
      type: 'video',
      thumbnail: '',
      createdAt: new Date('2025-12-28'),
      updatedAt: new Date('2025-12-29'),
      status: 'draft'
    },
    {
      id: '3',
      name: 'Social Media Assets',
      type: 'image',
      thumbnail: '',
      createdAt: new Date('2025-12-25'),
      updatedAt: new Date('2025-12-27'),
      status: 'analyzing'
    }
  ];

  const getTypeIcon = (type: Project['type']) => {
    switch (type) {
      case 'image': return Image;
      case 'video': return Video;
      case 'campaign': return Layers;
    }
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'analyzing': return 'text-amber-600 bg-amber-50';
      case 'draft': return 'text-[var(--coconut-husk)] bg-[var(--coconut-cream)]';
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6 md:mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl text-[var(--coconut-shell)] mb-2">
                Your Projects
              </h1>
              <p className="text-sm md:text-base text-[var(--coconut-husk)]">
                Manage all your creative projects in one place
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                playClick();
                playPop();
                onCreateNew();
              }}
              className="px-4 py-3 md:px-6 md:py-3 rounded-xl bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 justify-center"
            >
              <Plus className="w-5 h-5" />
              <span>New Project</span>
            </motion.button>
          </div>

          {/* Filters & View Toggle */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--coconut-husk)]/60" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/60 backdrop-blur-xl border border-white/40 text-[var(--coconut-shell)] placeholder:text-[var(--coconut-husk)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--coconut-shell)]/30 transition-all"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2 bg-white/60 backdrop-blur-xl border border-white/40 rounded-xl p-1">
              <button
                onClick={() => {
                  playClick();
                  setViewMode('grid');
                }}
                className={`px-4 py-2 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-[var(--coconut-shell)] text-white shadow-md'
                    : 'text-[var(--coconut-husk)] hover:bg-white/40'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  playClick();
                  setViewMode('list');
                }}
                className={`px-4 py-2 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-[var(--coconut-shell)] text-white shadow-md'
                    : 'text-[var(--coconut-husk)] hover:bg-white/40'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Projects Grid/List */}
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'
              : 'space-y-4'
          }
        >
          {demoProjects.map((project, index) => {
            const TypeIcon = getTypeIcon(project.type);
            
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                onClick={() => {
                  playClick();
                  onProjectClick(project.id);
                }}
                className="group relative p-4 md:p-6 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/40 hover:border-[var(--coconut-shell)]/30 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="relative w-full h-32 md:h-40 mb-4 rounded-xl bg-gradient-to-br from-[var(--coconut-cream)] to-[var(--coconut-milk)] overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <TypeIcon className="w-12 h-12 md:w-16 md:h-16 text-[var(--coconut-shell)]/20" />
                  </div>
                  
                  {/* Status Badge */}
                  <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs ${getStatusColor(project.status)}`}>
                    {project.status}
                  </div>
                </div>

                {/* Info */}
                <div className="mb-3">
                  <h3 className="text-base md:text-lg text-[var(--coconut-shell)] mb-2 line-clamp-1">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs md:text-sm text-[var(--coconut-husk)]">
                    <TypeIcon className="w-4 h-4" />
                    <span className="capitalize">{project.type}</span>
                    <span>•</span>
                    <Clock className="w-4 h-4" />
                    <span>{project.updatedAt.toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      playClick();
                    }}
                    className="flex-1 px-3 py-2 rounded-lg bg-[var(--coconut-shell)]/10 text-[var(--coconut-shell)] hover:bg-[var(--coconut-shell)]/20 transition-colors text-sm"
                  >
                    <Edit2 className="w-4 h-4 mx-auto" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      playClick();
                    }}
                    className="flex-1 px-3 py-2 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4 mx-auto" />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Empty State */}
        {demoProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 md:py-16"
          >
            <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-[var(--coconut-husk)]/40 mx-auto mb-4" />
            <h3 className="text-lg md:text-xl text-[var(--coconut-shell)] mb-2">No projects yet</h3>
            <p className="text-sm md:text-base text-[var(--coconut-husk)] mb-6">
              Create your first project to get started
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCreateNew}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Create Project
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
