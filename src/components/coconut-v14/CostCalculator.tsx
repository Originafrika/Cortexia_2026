/**
 * COCONUT V14 - COST CALCULATOR DISPLAY
 * Phase 3 - Jour 5: Real-time cost calculation display
 */

import React, { useMemo } from 'react';
import { DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { calculateCost, formatCost, getCostTier, type GenerationSpecs } from '../../lib/utils/cost-calculator';

interface CostCalculatorProps {
  specs: GenerationSpecs;
  userCredits?: number;
  showBreakdown?: boolean;
}

export function CostCalculator({ 
  specs, 
  userCredits = 1000,
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
    low: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900', badge: 'bg-green-600' },
    medium: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', badge: 'bg-blue-600' },
    high: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-900', badge: 'bg-orange-600' },
    premium: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900', badge: 'bg-purple-600' },
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
          <div className="flex items-center space-x-2 text-green-700 bg-green-100 rounded-lg px-3 py-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">
              You have enough credits ({remainingCredits} remaining after generation)
            </span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-red-700 bg-red-100 rounded-lg px-3 py-2">
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
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xs text-blue-700 mb-1">Analysis</div>
                <div className="text-lg text-blue-900">{costBreakdown.geminiAnalysis}</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-xs text-purple-700 mb-1">Generation</div>
                <div className="text-lg text-purple-900">{costBreakdown.fluxGeneration}</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-xs text-green-700 mb-1">References</div>
                <div className="text-lg text-green-900">{costBreakdown.references}</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-xs text-orange-700 mb-1">Multi-Pass</div>
                <div className="text-lg text-orange-900">{costBreakdown.multiPass}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Credits */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-700 mb-1">Your Balance</div>
            <div className="text-2xl text-slate-900">{userCredits} credits</div>
            <div className="text-xs text-slate-600">{formatCost(userCredits)}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-700 mb-1">After Generation</div>
            <div className={`text-2xl ${remainingCredits >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
                  ? 'bg-red-600' 
                  : costBreakdown.total / userCredits > 0.5 
                    ? 'bg-orange-500' 
                    : 'bg-green-500'
              }`}
              style={{ width: `${Math.min((costBreakdown.total / userCredits) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="text-sm text-blue-900 mb-2">💡 Cost Optimization Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use single-pass mode for faster, cheaper generation</li>
          <li>• Lower resolution (1K) costs less than 4K</li>
          <li>• Each reference adds {costBreakdown.references / Math.max(specs.referencesCount, 1)} credits</li>
          <li>• Multi-pass mode provides best quality but costs more</li>
        </ul>
      </div>
    </div>
  );
}
