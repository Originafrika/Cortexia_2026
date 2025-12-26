// Purchase Credits Modal - Buy credit packages
// Displays packages with discounts and handles checkout

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Coins, Crown, Zap, Check, Loader2, CreditCard } from 'lucide-react';
import { CREDIT_PACKAGES, creditsToUSD, formatUSD, getPackageSavings } from '../../lib/providers/config';
import type { CreditPackage, UserCredits } from '../../lib/providers/types';

interface PurchaseCreditsModalProps {
  open: boolean;
  onClose: () => void;
  currentCredits: UserCredits;
  onPurchase: (packageId: number) => Promise<{ success: boolean; error?: string }>;
}

export function PurchaseCreditsModal({
  open,
  onClose,
  currentCredits,
  onPurchase
}: PurchaseCreditsModalProps) {
  
  const [selectedPackage, setSelectedPackage] = useState<number>(1); // Default to popular package
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handlePurchase = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await onPurchase(selectedPackage);
      
      if (result.success) {
        // Success - close modal
        onClose();
      } else {
        setError(result.error || 'Purchase failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="size-5 text-indigo-400" />
            Purchase Credits
          </DialogTitle>
          <DialogDescription>
            Choose a credit package. Bigger packages = better discounts!
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          
          {/* Current Balance */}
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-sm text-white/60 mb-2">Current Balance</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{currentCredits.total}</span>
              <span className="text-white/50">credits</span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs">
              {currentCredits.paid > 0 && (
                <div className="flex items-center gap-1 text-amber-300">
                  <Crown className="size-3" />
                  <span>{currentCredits.paid} paid</span>
                </div>
              )}
              {currentCredits.free > 0 && (
                <div className="flex items-center gap-1 text-green-300">
                  <Zap className="size-3" />
                  <span>{currentCredits.free} free</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Packages */}
          <div className="grid grid-cols-2 gap-3">
            {CREDIT_PACKAGES.map((pkg, idx) => {
              const isSelected = selectedPackage === idx;
              const savings = getPackageSavings(pkg);
              const pricePerCredit = pkg.price / pkg.credits;
              
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedPackage(idx)}
                  className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  {/* Popular Badge */}
                  {pkg.popular && (
                    <Badge className="absolute -top-2 -right-2 bg-indigo-500">
                      Most Popular
                    </Badge>
                  )}
                  
                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <div className="size-6 rounded-full bg-indigo-500 flex items-center justify-center">
                        <Check className="size-4 text-white" />
                      </div>
                    </div>
                  )}
                  
                  {/* Credits Amount */}
                  <div className="mb-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">{pkg.credits}</span>
                      <span className="text-white/50">credits</span>
                    </div>
                    {pkg.discount > 0 && (
                      <Badge variant="outline" className="mt-1 text-green-400 border-green-500/30">
                        {pkg.discount}% OFF
                      </Badge>
                    )}
                  </div>
                  
                  {/* Price */}
                  <div className="mb-2">
                    <div className="text-2xl font-bold text-indigo-400">
                      {formatUSD(pkg.price)}
                    </div>
                    <div className="text-xs text-white/50">
                      {formatUSD(pricePerCredit)} per credit
                    </div>
                  </div>
                  
                  {/* Savings */}
                  {savings > 0 && (
                    <div className="text-xs text-green-400">
                      Save {formatUSD(savings)}
                    </div>
                  )}
                  
                </button>
              );
            })}
          </div>
          
          {/* What You Get */}
          <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <p className="font-medium mb-2">What you get:</p>
            <ul className="space-y-1 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <Check className="size-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Access to premium Flux 2 Pro model</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="size-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Professional-grade image quality</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="size-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Multi-reference image-to-image</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="size-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Video generation (Veo 3 Fast)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="size-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Credits never expire</span>
              </li>
            </ul>
          </div>
          
          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-200">
              {error}
            </div>
          )}
          
          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={loading}
              className="flex-1 gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="size-4" />
                  Purchase {CREDIT_PACKAGES[selectedPackage].credits} Credits
                  ({formatUSD(CREDIT_PACKAGES[selectedPackage].price)})
                </>
              )}
            </Button>
          </div>
          
          {/* Fine Print */}
          <p className="text-xs text-white/40 text-center">
            Secure payment powered by Stripe. Credits are added instantly and never expire.
          </p>
          
        </div>
      </DialogContent>
    </Dialog>
  );
}
