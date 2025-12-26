// Cost Preview Component - Shows generation cost BEFORE user generates
// Displays breakdown: base + reference images + enhancement

import { Info, Crown, Zap, AlertTriangle } from 'lucide-react';
import { Badge } from './badge';
import { Alert, AlertDescription } from './alert';
import type { CreditCost, UserCredits } from '../../lib/types/credits';
import { formatCredits, creditsToUSD, hasEnoughCredits } from '../../lib/types/credits';

interface CostPreviewProps {
  cost: CreditCost;
  userCredits: UserCredits;
  modelName: string;
  showBreakdown?: boolean;
  variant?: 'inline' | 'card';
}

export function CostPreview({ 
  cost, 
  userCredits,
  modelName,
  showBreakdown = true,
  variant = 'inline'
}: CostPreviewProps) {
  
  const affordability = hasEnoughCredits(cost, userCredits);
  const { total, breakdown, willUse } = cost;
  
  // Free generation (Pollinations)
  if (total === 0) {
    return (
      <div className={`
        ${variant === 'card' ? 'p-3 rounded-lg bg-green-500/10 border border-green-500/20' : ''}
      `}>
        <div className="flex items-center gap-2">
          <Zap className="size-4 text-green-400" />
          <span className="text-sm font-medium text-green-300">
            Free Generation
          </span>
          <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30">
            0 credits
          </Badge>
        </div>
        {variant === 'card' && (
          <p className="text-xs text-white/60 mt-2">
            Using {modelName} - completely free until rate limit reached!
          </p>
        )}
      </div>
    );
  }
  
  // Inline variant
  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2">
        
        {/* Cost badge */}
        <Badge 
          variant="outline" 
          className={`
            ${willUse === 'paid' 
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
              : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
            }
          `}
        >
          {willUse === 'paid' ? <Crown className="size-3 mr-1" /> : <Zap className="size-3 mr-1" />}
          {total} {total === 1 ? 'credit' : 'credits'}
        </Badge>
        
        {/* USD equivalent */}
        <span className="text-xs text-white/50">
          ({creditsToUSD(total)})
        </span>
        
        {/* Warning if can't afford */}
        {!affordability.canAfford && (
          <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500/30">
            <AlertTriangle className="size-3 mr-1" />
            Insufficient credits
          </Badge>
        )}
        
      </div>
    );
  }
  
  // Card variant (detailed)
  return (
    <div className="space-y-3">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {willUse === 'paid' ? (
            <Crown className="size-4 text-amber-400" />
          ) : (
            <Zap className="size-4 text-indigo-400" />
          )}
          <span className="text-sm font-medium">Generation Cost</span>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold">
            {total} {total === 1 ? 'credit' : 'credits'}
          </div>
          <div className="text-xs text-white/50">
            {creditsToUSD(total)}
          </div>
        </div>
      </div>
      
      {/* Breakdown */}
      {showBreakdown && (breakdown.referenceImages > 0 || breakdown.enhancement > 0) && (
        <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-2">
          <div className="text-xs font-medium text-white/70 mb-2">Cost Breakdown</div>
          
          {/* Base cost */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/60">Base generation</span>
            <span className="text-white/90">{breakdown.base} credit</span>
          </div>
          
          {/* Reference images */}
          {breakdown.referenceImages > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60">Reference images ({breakdown.referenceImages})</span>
              <span className="text-white/90">+{breakdown.referenceImages} {breakdown.referenceImages === 1 ? 'credit' : 'credits'}</span>
            </div>
          )}
          
          {/* Enhancement */}
          {breakdown.enhancement > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60">Enhancement mode</span>
              <span className="text-white/90">+{breakdown.enhancement} credit</span>
            </div>
          )}
          
          {/* Total */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-sm font-medium">
            <span>Total</span>
            <span>{total} {total === 1 ? 'credit' : 'credits'}</span>
          </div>
        </div>
      )}
      
      {/* Credit source */}
      <div className="flex items-center gap-2 text-xs">
        <Info className="size-3 text-white/40" />
        <span className="text-white/60">
          {willUse === 'paid' ? (
            <>Will use <strong className="text-amber-400">paid credits</strong> (priority)</>
          ) : affordability.creditType === 'free' ? (
            <>Will use <strong className="text-indigo-400">free credits</strong></>
          ) : affordability.creditType === 'both' ? (
            <>Will use <strong className="text-white/80">both free and paid credits</strong></>
          ) : null}
        </span>
      </div>
      
      {/* Warning: Not enough credits */}
      {!affordability.canAfford && (
        <Alert className="bg-red-500/10 border-red-500/30">
          <AlertTriangle className="size-4 text-red-400" />
          <AlertDescription className="text-xs text-red-300">
            Insufficient credits! You need {affordability.shortage} more {affordability.shortage === 1 ? 'credit' : 'credits'}.
            <br />
            <strong>Current balance:</strong> {userCredits.free} free + {userCredits.paid} paid
          </AlertDescription>
        </Alert>
      )}
      
      {/* Info: Free fallback available */}
      {!affordability.canAfford && willUse === 'paid' && (
        <Alert className="bg-indigo-500/10 border-indigo-500/30">
          <Info className="size-4 text-indigo-400" />
          <AlertDescription className="text-xs text-indigo-300">
            💡 <strong>Tip:</strong> Switch to a free model (Pollinations or Flux Schnell) to generate without credits!
          </AlertDescription>
        </Alert>
      )}
      
    </div>
  );
}

// Simple cost badge for compact display
export function CostBadge({ 
  cost, 
  showUSD = true 
}: { 
  cost: number; 
  showUSD?: boolean;
}) {
  if (cost === 0) {
    return (
      <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30">
        <Zap className="size-3 mr-1" />
        Free
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="bg-amber-500/20 text-amber-300 border-amber-500/30">
      <Crown className="size-3 mr-1" />
      {cost} {cost === 1 ? 'credit' : 'credits'}
      {showUSD && <span className="ml-1 opacity-70">({creditsToUSD(cost)})</span>}
    </Badge>
  );
}
