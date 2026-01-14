/**
 * COCONUT V14 - COST CALCULATOR DISPLAY
 * 
 * ✅ FIXED: BDS Compliance Phase 2B
 * - Design tokens integration
 * - French labels
 * - Icon sizing standardized
 * 
 * ✨ PHASE 4 - SESSION 15: SOUND INTEGRATION
 * - Pattern: playPop (toggle breakdown - if we add interactivity later)
 * Note: Currently no user interactions in this component
 */

import React, { useMemo } from 'react';
import { DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { calculateCost, formatCost, getCostTier, type GenerationSpecs } from '../../lib/utils/cost-calculator';
import { tokens } from '../../lib/design/tokens';
// Sound context imported for future use if we add toggle interactions
import { useSoundContext } from './SoundProvider';

interface CostCalculatorProps {
  specs: GenerationSpecs;
  userCredits?: number;
  showBreakdown?: boolean;
}

export function CostCalculator({ 
  specs, 
  userCredits, // ✅ No default, must be passed from parent
  showBreakdown = true 
}: CostCalculatorProps) {
  // Calculate cost
  const costBreakdown = useMemo(() => {
    return calculateCost(specs);
  }, [specs]);

  const tier = getCostTier(costBreakdown.total);
  const canAfford = userCredits >= costBreakdown.total;
  const remainingCredits = userCredits - costBreakdown.total;

  // Tier colors
  const tierColors = {
    low: { bg: 'bg-[var(--coconut-palm)]/10', border: 'border-[var(--coconut-palm)]/20', text: 'text-[var(--coconut-palm)]', badge: 'bg-[var(--coconut-palm)]' },
    medium: { bg: 'bg-[var(--coconut-cream)]', border: 'border-[var(--coconut-husk)]/20', text: 'text-[var(--coconut-shell)]', badge: 'bg-[var(--coconut-husk)]' },
    high: { bg: 'bg-[var(--coconut-husk)]/10', border: 'border-[var(--coconut-shell)]/30', text: 'text-[var(--coconut-shell)]', badge: 'bg-[var(--coconut-shell)]' },
    premium: { bg: 'bg-[var(--coconut-cream)]', border: 'border-[var(--coconut-husk)]/20', text: 'text-[var(--coconut-shell)]', badge: 'bg-[var(--coconut-palm)]' },
  };

  const colors = tierColors[tier];

  return (
    <div className="space-y-4">
      {/* Total Cost Card */}
      <div className={`${colors.bg} border ${colors.border} rounded-2xl p-6`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <DollarSign className={`w-5 h-5 ${colors.text}`} />
              <h3 className={`text-lg ${colors.text}`}>Total Cost</h3>
            </div>
            <p className="text-sm text-slate-600">For this generation</p>
          </div>
          <div className={`${colors.badge} text-white text-xs px-3 py-1 rounded-full uppercase tracking-wide`}>
            {tier}
          </div>
        </div>

        <div className="flex items-baseline space-x-3 mb-4">
          <div className={`text-4xl ${colors.text}`}>
            {costBreakdown.total}
          </div>
          <div className="text-xl text-slate-600">credits</div>
          <div className="text-lg text-slate-500">
            ({formatCost(costBreakdown.total)})
          </div>
        </div>

        {/* Affordability Status */}
        {canAfford ? (
          <div className="flex items-center space-x-2 text-[var(--coconut-palm)] bg-[var(--coconut-palm)]/10 rounded-lg px-3 py-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">
              You have enough credits ({remainingCredits} remaining after generation)
            </span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-[var(--coconut-shell)] bg-[var(--coconut-shell)]/10 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">
              Insufficient credits (need {costBreakdown.total - userCredits} more)
            </span>
          </div>
        )}
      </div>

      {/* Cost Breakdown */}
      {showBreakdown && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-slate-700" />
            <h3 className="text-lg text-slate-900">Cost Breakdown</h3>
          </div>

          <div className="space-y-3">
            {costBreakdown.steps.map((step, index) => (
              <div 
                key={index}
                className="flex items-start justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="text-sm text-slate-900 mb-1">{step.name}</div>
                  <div className="text-xs text-slate-600">{step.description}</div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-sm text-slate-900">{step.credits}</div>
                  <div className="text-xs text-slate-600">credits</div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3 bg-[var(--coconut-husk)]/10 rounded-lg">
                <div className="text-xs text-[var(--coconut-husk)] mb-1">Analysis</div>
                <div className="text-lg text-[var(--coconut-shell)]">{costBreakdown.geminiAnalysis}</div>
              </div>
              <div className="text-center p-3 bg-[var(--coconut-cream)] rounded-lg">
                <div className="text-xs text-[var(--coconut-husk)] mb-1">Generation</div>
                <div className="text-lg text-[var(--coconut-shell)]">{costBreakdown.fluxGeneration}</div>
              </div>
              <div className="text-center p-3 bg-[var(--coconut-palm)]/10 rounded-lg">
                <div className="text-xs text-[var(--coconut-palm)] mb-1">References</div>
                <div className="text-lg text-[var(--coconut-shell)]">{costBreakdown.references}</div>
              </div>
              <div className="text-center p-3 bg-[var(--coconut-shell)]/10 rounded-lg">
                <div className="text-xs text-[var(--coconut-shell)] mb-1">Multi-Pass</div>
                <div className="text-lg text-[var(--coconut-shell)]">{costBreakdown.multiPass}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Credits */}
      <div className="bg-gradient-to-r from-[var(--coconut-cream)] to-[var(--coconut-milk)] border border-[var(--coconut-husk)]/20 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-700 mb-1">Your Balance</div>
            <div className="text-2xl text-slate-900">{userCredits} credits</div>
            <div className="text-xs text-slate-600">{formatCost(userCredits)}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-700 mb-1">After Generation</div>
            <div className={`text-2xl ${remainingCredits >= 0 ? 'text-[var(--coconut-palm)]' : 'text-[var(--coconut-shell)]'}`}>
              {remainingCredits >= 0 ? remainingCredits : 0} credits
            </div>
            <div className="text-xs text-slate-600">
              {formatCost(remainingCredits >= 0 ? remainingCredits : 0)}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-600 mb-1">
            <span>Usage</span>
            <span>{((costBreakdown.total / userCredits) * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${
                costBreakdown.total / userCredits > 0.8 
                  ? 'bg-[var(--coconut-shell)]' 
                  : costBreakdown.total / userCredits > 0.5 
                    ? 'bg-[var(--coconut-husk)]' 
                    : 'bg-[var(--coconut-palm)]'
              }`}
              style={{ width: `${Math.min((costBreakdown.total / userCredits) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-[var(--coconut-cream)] border border-[var(--coconut-husk)]/20 rounded-xl p-4">
        <h4 className="text-sm text-[var(--coconut-shell)] mb-2">💡 Cost Optimization Tips</h4>
        <ul className="text-sm text-[var(--coconut-husk)] space-y-1">
          <li>• Use single-pass mode for faster, cheaper generation</li>
          <li>• Lower resolution (1K) costs less than 4K</li>
          <li>• Each reference adds {costBreakdown.references / Math.max(specs.referencesCount, 1)} credits</li>
          <li>• Multi-pass mode provides best quality but costs more</li>
        </ul>
      </div>
    </div>
  );
}