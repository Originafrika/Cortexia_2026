/**
 * BUY CREDITS PAGE - Individual Users
 * Wireframe implementation from PAYMENT_ARCHITECTURE.md
 * BDS: Grammaire (clarté), Géométrie (structure), Rhétorique (guidance)
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, Smartphone, Globe, ArrowLeft, Check, 
  Zap, TrendingUp, Shield, Clock, Sparkles, DollarSign
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useCredits } from '../../lib/contexts/CreditsContext';
import { useCurrentUser } from '../../lib/hooks/useCurrentUser';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { Button } from '../ui-premium/Button';
import { Card } from '../ui-premium/Card';

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  discount?: number;
  popular?: boolean;
}

const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'starter',
    name: 'STARTER',
    credits: 100,
    price: 9.99,
  },
  {
    id: 'creator',
    name: 'CREATOR',
    credits: 1000,
    price: 89.99,
    discount: 10,
    popular: true,
  },
  {
    id: 'pro',
    name: 'PRO',
    credits: 5000,
    price: 399.99,
    discount: 20,
  },
];

export function BuyCreditsPage({ onBack }: { onBack: () => void }) {
  const { credits, refetchCredits } = useCredits();
  const { user } = useCurrentUser();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [detectedRegion, setDetectedRegion] = useState<'africa' | 'international'>('international');
  const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);

  useEffect(() => {
    // Detect user region based on country
    detectUserRegion();
    // Fetch purchase history
    fetchPurchaseHistory();
  }, [user]);

  const detectUserRegion = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/credits/detect-region`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setDetectedRegion(data.region);
      }
    } catch (err) {
      console.error('Error detecting region:', err);
    }
  };

  const fetchPurchaseHistory = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/credits/purchase-history`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setPurchaseHistory(data.history || []);
      }
    } catch (err) {
      console.error('Error fetching purchase history:', err);
    }
  };

  const handlePurchase = async (pkg: CreditPackage) => {
    if (!user?.id) {
      toast.error('Vous devez être connecté pour acheter des crédits');
      return;
    }

    setIsLoading(true);
    setSelectedPackage(pkg);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/credits/create-purchase`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            creditsAmount: pkg.credits,
            packageId: pkg.id,
          }),
        }
      );

      const data = await response.json();

      if (data.success && data.paymentUrl) {
        // Redirect to payment gateway (FedaPay or Stripe)
        toast.success(`Redirection vers ${data.gateway === 'fedapay' ? 'FedaPay' : 'Stripe'}...`);
        
        // Store purchase intent in localStorage for success page
        localStorage.setItem('cortexia_pending_purchase', JSON.stringify({
          packageId: pkg.id,
          credits: pkg.credits,
          gateway: data.gateway,
        }));

        // Redirect
        window.location.href = data.paymentUrl;
      } else {
        toast.error(data.error || 'Erreur lors de la création du paiement');
      }
    } catch (err) {
      console.error('Error creating purchase:', err);
      toast.error('Erreur lors de la création du paiement');
    } finally {
      setIsLoading(false);
      setSelectedPackage(null);
    }
  };

  const getNextResetDate = () => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const daysLeft = Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return `Dans ${daysLeft} jours`;
  };

  return (
    <div className="min-h-screen bg-[var(--coconut-dark)] relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--coconut-shell)]/10 via-[var(--coconut-dark)] to-[var(--coconut-palm)]/10" />

      {/* Animated orbs */}
      <motion.div
        className="absolute top-20 right-20 w-96 h-96 rounded-full bg-[var(--coconut-palm)]/10 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-white/70 hover:text-white hover:bg-white/5"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Zap className="w-8 h-8 text-[var(--coconut-palm)]" />
            Acheter des Crédits
          </h1>
        </div>

        {/* Current Balance Card */}
        <Card className="mb-8 bg-gradient-to-br from-[var(--coconut-shell)]/20 to-[var(--coconut-palm)]/20 backdrop-blur-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-[var(--coconut-palm)]" />
              Votre Balance Actuelle
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="text-sm text-white/60">Crédits Gratuits</div>
              <div className="text-2xl font-bold text-white">
                {credits?.free || 0} / 25
              </div>
              <div className="text-xs text-white/40">Reset le 1er</div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-white/60">Crédits Achetés</div>
              <div className="text-2xl font-bold text-[var(--coconut-palm)]">
                {credits?.purchased || 0}
              </div>
              <div className="text-xs text-white/40">Permanent</div>
            </div>

            <div className="space-y-2 border-l border-white/10 pl-6">
              <div className="text-sm text-white/60">TOTAL DISPONIBLE</div>
              <div className="text-3xl font-bold text-white">
                {(credits?.free || 0) + (credits?.purchased || 0)}
              </div>
              <div className="text-xs text-white/40">
                Prochain reset : {getNextResetDate()}
              </div>
            </div>
          </div>
        </Card>

        {/* Credit Packages */}
        <Card className="mb-8 bg-white/5 backdrop-blur-xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[var(--coconut-palm)]" />
            Forfaits Recommandés
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CREDIT_PACKAGES.map((pkg) => (
              <motion.div
                key={pkg.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative rounded-2xl border ${
                  pkg.popular
                    ? 'border-[var(--coconut-palm)] bg-gradient-to-br from-[var(--coconut-palm)]/10 to-[var(--coconut-shell)]/10'
                    : 'border-white/10 bg-white/5'
                } backdrop-blur-xl p-6 transition-all cursor-pointer hover:border-[var(--coconut-palm)]/50`}
                onClick={() => !isLoading && handlePurchase(pkg)}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--coconut-palm)] text-white text-xs font-bold px-3 py-1 rounded-full">
                    ⭐ POPULAIRE
                  </div>
                )}

                <div className="text-center space-y-4">
                  <div className="text-sm font-semibold text-white/60">{pkg.name}</div>
                  
                  <div className="text-4xl font-bold text-white">
                    {pkg.credits.toLocaleString()}
                  </div>
                  <div className="text-sm text-white/60">crédits</div>

                  <div className="pt-4 border-t border-white/10">
                    <div className="text-3xl font-bold text-[var(--coconut-palm)]">
                      ${pkg.price}
                    </div>
                    {pkg.discount && (
                      <div className="text-sm text-[var(--coconut-palm)] mt-1">
                        ⭐ -{pkg.discount}%
                      </div>
                    )}
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] hover:opacity-90"
                    disabled={isLoading && selectedPackage?.id === pkg.id}
                  >
                    {isLoading && selectedPackage?.id === pkg.id ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Traitement...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        🛒 Acheter
                      </span>
                    )}
                  </Button>
                </div>

                {pkg.id === 'creator' && (
                  <div className="mt-4 pt-4 border-t border-white/10 text-center text-xs text-white/60">
                    💡 Débloquez le statut Creator !
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Payment Methods */}
        <Card className="mb-8 bg-white/5 backdrop-blur-xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[var(--coconut-palm)]" />
            Méthode de Paiement
            <span className="text-sm font-normal text-white/60">
              (Auto-détectée : {detectedRegion === 'africa' ? 'Afrique' : 'International'})
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {detectedRegion === 'africa' ? (
              <>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-white">
                    <Check className="w-5 h-5 text-[var(--coconut-palm)]" />
                    <Smartphone className="w-5 h-5" />
                    <span className="font-semibold">Mobile Money</span>
                    <span className="text-xs text-white/60">(Instantané)</span>
                  </div>
                  <ul className="ml-8 space-y-1 text-sm text-white/70">
                    <li>• MTN Mobile Money</li>
                    <li>• Moov Money</li>
                    <li>• Orange Money</li>
                    <li>• Wave</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-white">
                    <Check className="w-5 h-5 text-[var(--coconut-palm)]" />
                    <CreditCard className="w-5 h-5" />
                    <span className="font-semibold">Carte Bancaire</span>
                  </div>
                  <ul className="ml-8 space-y-1 text-sm text-white/70">
                    <li>• Visa / MasterCard</li>
                  </ul>
                </div>

                <div className="md:col-span-2 flex items-center gap-2 text-sm text-white/60 pt-4 border-t border-white/10">
                  <Shield className="w-4 h-4 text-[var(--coconut-palm)]" />
                  <span>Paiement sécurisé via FedaPay</span>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-white">
                    <Check className="w-5 h-5 text-[var(--coconut-palm)]" />
                    <CreditCard className="w-5 h-5" />
                    <span className="font-semibold">Cartes</span>
                  </div>
                  <ul className="ml-8 space-y-1 text-sm text-white/70">
                    <li>• Visa, MasterCard, Amex</li>
                    <li>• Cartes de débit</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-white">
                    <Check className="w-5 h-5 text-[var(--coconut-palm)]" />
                    <Smartphone className="w-5 h-5" />
                    <span className="font-semibold">Digital Wallets</span>
                  </div>
                  <ul className="ml-8 space-y-1 text-sm text-white/70">
                    <li>• Apple Pay</li>
                    <li>• Google Pay</li>
                    <li>• Stripe Link</li>
                  </ul>
                </div>

                <div className="md:col-span-2 flex items-center gap-2 text-sm text-white/60 pt-4 border-t border-white/10">
                  <Shield className="w-4 h-4 text-[var(--coconut-palm)]" />
                  <span>Paiement sécurisé via Stripe</span>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Purchase History */}
        {purchaseHistory.length > 0 && (
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6 text-[var(--coconut-palm)]" />
              Historique d'Achats
            </h2>

            <div className="space-y-3">
              {purchaseHistory.slice(0, 3).map((purchase, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-white/60">
                      {new Date(purchase.date).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-white font-semibold">
                      {purchase.credits.toLocaleString()} crédits
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-white/60">
                      {purchase.amount.toLocaleString()} {purchase.currency}
                    </div>
                    {purchase.status === 'completed' && (
                      <Check className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                </div>
              ))}

              {purchaseHistory.length > 3 && (
                <button className="w-full text-center text-sm text-[var(--coconut-palm)] hover:underline py-2">
                  Voir tout l'historique
                </button>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
