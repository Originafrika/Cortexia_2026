// Credit Display Component - Shows user's dual credit balance
// Displays free credits (renewable) and paid credits separately

import { Zap, Crown, Info } from 'lucide-react';
import { Badge } from './badge';
import { Button } from './button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from './tooltip';
import type { UserCredits } from '../../lib/types/credits';
import { formatCredits, creditsToUSD, CREDIT_PRICING } from '../../lib/types/credits';

interface CreditDisplayProps {
  credits: UserCredits;
  variant?: 'compact' | 'detailed';
  showUpgradeButton?: boolean;
  onUpgradeClick?: () => void;
}

export function CreditDisplay({ 
  credits, 
  variant = 'compact',
  showUpgradeButton = false,
  onUpgradeClick 
}: CreditDisplayProps) {
  
  const totalCredits = credits.free + credits.paid;
  const lowCredits = totalCredits < 5;
  const outOfCredits = totalCredits === 0;
  
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        
        {/* Total Credits Badge */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full
                ${outOfCredits 
                  ? 'bg-red-500/20 border border-red-500/30' 
                  : lowCredits
                    ? 'bg-amber-500/20 border border-amber-500/30'
                    : 'bg-indigo-500/20 border border-indigo-500/30'
                }
                transition-colors cursor-help
              `}>
                <Zap className={`size-4 ${
                  outOfCredits ? 'text-red-400' : lowCredits ? 'text-amber-400' : 'text-indigo-400'
                }`} />
                <span className="text-sm font-medium">
                  {totalCredits}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-white/60">Free Credits:</span>
                  <span className="text-sm font-medium">{credits.free}/{CREDIT_PRICING.FREE_MONTHLY_CREDITS}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-white/60">Paid Credits:</span>
                  <span className="text-sm font-medium">{credits.paid}</span>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <p className="text-xs text-white/50">
                    Free credits renew on {credits.freeRenewDate.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* Upgrade Button */}
        {showUpgradeButton && lowCredits && (
          <Button
            size="sm"
            variant="default"
            onClick={onUpgradeClick}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            <Crown className="size-3 mr-1.5" />
            Get Credits
          </Button>
        )}
        
      </div>
    );
  }
  
  // Detailed variant
  return (
    <div className="space-y-3">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Your Credits</h3>
        {showUpgradeButton && (
          <Button
            size="sm"
            variant="outline"
            onClick={onUpgradeClick}
            className="border-amber-500/30 hover:bg-amber-500/10"
          >
            <Crown className="size-3 mr-1.5" />
            Buy More
          </Button>
        )}
      </div>
      
      {/* Credit Breakdown */}
      <div className="space-y-2">
        
        {/* Free Credits */}
        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-green-400" />
              <span className="text-sm font-medium">Free Credits</span>
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                Monthly
              </Badge>
            </div>
            <span className="text-lg font-bold">
              {credits.free}
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
              style={{ width: `${(credits.free / CREDIT_PRICING.FREE_MONTHLY_CREDITS) * 100}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>Renews {credits.freeRenewDate.toLocaleDateString()}</span>
            <span>{credits.free}/{CREDIT_PRICING.FREE_MONTHLY_CREDITS}</span>
          </div>
        </div>
        
        {/* Paid Credits */}
        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Crown className="size-4 text-amber-400" />
              <span className="text-sm font-medium">Paid Credits</span>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">
                Premium
              </Badge>
            </div>
            <span className="text-lg font-bold">
              {credits.paid}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>Never expire</span>
            <span className="text-amber-400">≈ {creditsToUSD(credits.paid)}</span>
          </div>
        </div>
        
      </div>
      
      {/* Warning if low */}
      {lowCredits && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-start gap-2">
            <Info className="size-4 text-amber-400 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-amber-300/90">
                {outOfCredits 
                  ? 'You\'re out of credits! Purchase more to continue using premium models.'
                  : 'Running low on credits. Consider purchasing more for uninterrupted access.'
                }
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Info */}
      <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
        <div className="flex items-start gap-2">
          <Info className="size-4 text-indigo-400 mt-0.5" />
          <div className="flex-1 min-w-0 text-xs text-white/60">
            <p>
              <strong className="text-white/80">Paid credits</strong> are used first for premium models. 
              <strong className="text-white/80"> Free credits</strong> work with Pollinations and Flux Schnell.
            </p>
          </div>
        </div>
      </div>
      
    </div>
  );
}

// Compact credit badge for headers
export function CreditBadge({ credits }: { credits: UserCredits }) {
  const total = credits.free + credits.paid;
  
  return (
    <Badge 
      variant="outline" 
      className="bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
    >
      <Zap className="size-3 mr-1" />
      {total} {total === 1 ? 'credit' : 'credits'}
    </Badge>
  );
}
