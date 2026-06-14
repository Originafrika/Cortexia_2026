/**
 * ACQUISITION SOURCE STEP - How did you hear about us?
 * Collect acquisition data for marketing attribution
 */

import React from 'react';
import { motion } from 'motion/react';
import { Check, Sparkles, Users, Search, MessageCircle, Star, Globe, UserPlus } from 'lucide-react';

interface AcquisitionSourceStepProps {
  acquisitionSource: string;
  onChange: (source: string) => void;
}

export function AcquisitionSourceStep({ acquisitionSource, onChange }: AcquisitionSourceStepProps) {
  const sources = [
    { id: 'google', label: 'Google Search', icon: Search },
    { id: 'social_media', label: 'Social Media', icon: Users },
    { id: 'friend_referral', label: 'Friend/Colleague', icon: UserPlus },
    { id: 'linkedin', label: 'LinkedIn', icon: Globe },
    { id: 'twitter', label: 'Twitter/X', icon: MessageCircle },
    { id: 'product_hunt', label: 'Product Hunt', icon: Star },
    { id: 'blog_article', label: 'Blog/Article', icon: Sparkles },
    { id: 'other', label: 'Other', icon: Search },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
      {sources.map((source, idx) => {
        const isSelected = acquisitionSource === source.id;
        const Icon = source.icon;

        return (
          <motion.button
            key={source.id}
            onClick={() => onChange(source.id)}
            className={`p-6 rounded-2xl backdrop-blur-sm border transition-all ${
              isSelected
                ? 'bg-gradient-to-br from-[#F5EBE0]/20 to-[#E3D5CA]/20 border-[#F5EBE0]/50'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isSelected ? 'bg-[#F5EBE0]/30' : 'bg-white/10'
              }`}>
                <Icon className={isSelected ? 'text-[#F5EBE0]' : 'text-white/60'} size={24} />
              </div>
              <span className="text-left">{source.label}</span>
            </div>

            {isSelected && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#F5EBE0] flex items-center justify-center">
                <Check size={14} className="text-black" />
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
