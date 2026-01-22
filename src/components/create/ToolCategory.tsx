/**
 * TOOL CATEGORY - BDS Beauty Design System
 * Category section with horizontal scroll
 * 7 Arts: Géométrie (structure), Musique (scroll), Arithmétique (spacing)
 */

import { LucideIcon } from 'lucide-react';
import { ToolCardV3 as ToolCard } from './ToolCardV3'; // ✅ FIXED: Use ToolCardV3 instead of deprecated ToolCard

interface Technology {
  id: string;
  name: string;
  icon: string;
}

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  technologies: string[];
  badge?: string;
  comingSoon?: boolean;
  imageUrl?: string;
}

interface ToolCategoryProps {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  badgeColor: string;
  accentColor: 'yellow' | 'pink' | 'orange' | 'indigo';
  tools: Tool[];
  allTechnologies: Technology[];
  onToolClick: (tool: Tool) => void;
  onPlayClick: () => void;
  onPlayHover: () => void;
  onMediumHaptic: () => void;
}

export function ToolCategory({
  title,
  icon: Icon,
  iconColor,
  badgeColor,
  accentColor,
  tools,
  allTechnologies,
  onToolClick,
  onPlayClick,
  onPlayHover,
  onMediumHaptic,
}: ToolCategoryProps) {
  if (tools.length === 0) return null;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* BDS: Rhétorique - Category Header */}
      <div className="flex items-center gap-2 px-4 sm:px-0">
        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColor}`} />
        <h3 className="text-white">{title}</h3>
        <span className={`px-1.5 sm:px-2 py-0.5 rounded ${badgeColor}`}>
          {tools.length}
        </span>
      </div>
      
      {/* BDS: Musique - Horizontal Scroll with Snap */}
      <div className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory">
        {tools.map((tool) => {
          const techs = allTechnologies.filter(t => tool.technologies.includes(t.id));
          const isCoconut = tool.id === 'coconut';
          
          return (
            <ToolCard
              key={tool.id}
              tool={tool}
              technologies={techs}
              accentColor={accentColor}
              isCoconut={isCoconut}
              onPlayClick={onPlayClick}
              onPlayHover={onPlayHover}
              onMediumHaptic={onMediumHaptic}
              onClick={() => onToolClick(tool)}
            />
          );
        })}
      </div>
    </div>
  );
}