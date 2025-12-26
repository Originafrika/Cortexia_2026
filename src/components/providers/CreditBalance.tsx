// Credit Balance Display - Shows user's current credits
// Displays in top navigation bar

import { Coins, Zap, Crown, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import type { UserCredits } from '../../lib/providers/types';
import { formatCredits, creditsToUSD } from '../../lib/providers/config';

interface CreditBalanceProps {
  credits: UserCredits;
  onPurchase?: () => void;
  compact?: boolean;
}

export function CreditBalance({ credits, onPurchase, compact = false }: CreditBalanceProps) {
  
  const hasPaidCredits = credits.paid > 0;
  const hasFreeCredits = credits.free > 0;
  const isLow = credits.total < 5;
  
  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onPurchase}
              className={`gap-2 ${isLow ? 'text-amber-400' : ''}`}
            >
              <Coins className="size-4" />
              <span className="font-medium">{credits.total}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1 text-xs">
              {hasPaidCredits && (
                <div className="flex items-center gap-2">
                  <Crown className="size-3 text-amber-400" />
                  <span>{credits.paid} paid credits</span>
                </div>
              )}
              {hasFreeCredits && (
                <div className="flex items-center gap-2">
                  <Zap className="size-3 text-green-400" />
                  <span>{credits.free} free credits</span>
                </div>
              )}
              <div className="pt-1 mt-1 border-t border-white/10">
                <span className="text-white/50">
                  Total value: {creditsToUSD(credits.total).toFixed(2)} USD
                </span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
      
      {/* Icon */}
      <div className="flex items-center justify-center size-10 rounded-full bg-indigo-500/20">
        <Coins className="size-5 text-indigo-400" />
      </div>
      
      {/* Balance */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{credits.total}</span>
          <span className="text-sm text-white/50">credits</span>
        </div>
        
        {/* Breakdown */}
        <div className="flex items-center gap-3 mt-1 text-xs text-white/60">
          {hasPaidCredits && (
            <div className="flex items-center gap-1">
              <Crown className="size-3 text-amber-400" />
              <span>{credits.paid} paid</span>
            </div>
          )}
          {hasFreeCredits && (
            <div className="flex items-center gap-1">
              <Zap className="size-3 text-green-400" />
              <span>{credits.free} free</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Purchase Button */}
      {onPurchase && (
        <Button
          size="sm"
          onClick={onPurchase}
          className="gap-2"
        >
          <Plus className="size-4" />
          Buy Credits
        </Button>
      )}
      
      {/* Low Balance Warning */}
      {isLow && (
        <div className="absolute -top-1 -right-1">
          <div className="size-3 rounded-full bg-amber-500 animate-pulse" />
        </div>
      )}
      
    </div>
  );
}

// Compact version for navbar
export function CreditBalanceCompact({ credits, onPurchase }: CreditBalanceProps) {
  return <CreditBalance credits={credits} onPurchase={onPurchase} compact />;
}
