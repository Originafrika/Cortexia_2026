/**
 * PAYOUT PAGE - Creator Withdrawals
 * Wireframe implementation from PAYMENT_ARCHITECTURE.md
 * BDS: Grammaire (clarté), Géométrie (structure), Rhétorique (guidance)
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DollarSign, ArrowLeft, Smartphone, Building2, Check, AlertCircle,
  Clock, TrendingUp, Zap, Shield, ChevronRight, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useCurrentUser } from '../../lib/hooks/useCurrentUser';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { Button } from '../ui-premium/Button';
import { Card } from '../ui-premium/Card';
import { Input } from '../ui-premium/Input';
import { Modal } from '../ui-premium/Modal';

interface CreatorBalance {
  availableBalance: number;
  pendingPayout: number;
  totalEarned: number;
  totalWithdrawn: number;
  lastPayoutDate: string | null;
  lastPayoutAmount: number;
}

interface PayoutMethod {
  type: 'mobile_money' | 'bank_account';
  provider?: string;
  phoneNumber?: string;
  bankDetails?: {
    accountNumber: string;
    bankName: string;
  };
}

export function PayoutPage({ onBack }: { onBack: () => void }) {
  const { user } = useCurrentUser();
  const [balance, setBalance] = useState<CreatorBalance | null>(null);
  const [payoutHistory, setPayoutHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [detectedRegion, setDetectedRegion] = useState<'africa' | 'international'>('international');
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PayoutMethod | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [onboardingUrl, setOnboardingUrl] = useState('');

  useEffect(() => {
    fetchCreatorBalance();
    fetchPayoutHistory();
    detectUserRegion();
  }, [user]);

  const detectUserRegion = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/payouts/detect-region`,
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

  const fetchCreatorBalance = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/creators/${user.id}/balance`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setBalance(data.balance);
      }
    } catch (err) {
      console.error('Error fetching balance:', err);
      toast.error('Erreur lors de la récupération du solde');
    }
  };

  const fetchPayoutHistory = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/payouts/history`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setPayoutHistory(data.history || []);
      }
    } catch (err) {
      console.error('Error fetching payout history:', err);
    }
  };

  const handleWithdrawRequest = async () => {
    if (!user?.id || !withdrawAmount || !selectedMethod) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Montant invalide');
      return;
    }

    if (balance && amount > balance.availableBalance) {
      toast.error('Solde insuffisant');
      return;
    }

    // Check minimum amount based on region
    const minAmount = detectedRegion === 'africa' ? 1.5 : 25;
    if (amount < minAmount) {
      toast.error(`Le montant minimum est de $${minAmount}`);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/payouts/request`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount,
            method: selectedMethod,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Check if onboarding is required (Stripe Connect)
        if (data.onboardingRequired && data.onboardingUrl) {
          setNeedsOnboarding(true);
          setOnboardingUrl(data.onboardingUrl);
          toast.info('Configuration de paiement requise');
        } else {
          toast.success('Demande de retrait envoyée !');
          setShowPayoutModal(false);
          setWithdrawAmount('');
          
          // Refresh balance
          await fetchCreatorBalance();
          await fetchPayoutHistory();
        }
      } else {
        toast.error(data.error || 'Erreur lors de la demande de retrait');
      }
    } catch (err) {
      console.error('Error requesting payout:', err);
      toast.error('Erreur lors de la demande de retrait');
    } finally {
      setIsLoading(false);
    }
  };

  const getPayoutStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'processing':
        return 'text-yellow-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-white/60';
    }
  };

  const getPayoutStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-white/60" />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--coconut-dark)] relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--coconut-shell)]/10 via-[var(--coconut-dark)] to-[var(--coconut-palm)]/10" />

      {/* Animated orbs */}
      <motion.div
        className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-[var(--coconut-palm)]/10 blur-3xl"
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
            <DollarSign className="w-8 h-8 text-[var(--coconut-palm)]" />
            Mes Gains & Retraits
          </h1>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-[var(--coconut-palm)]/20 to-[var(--coconut-shell)]/20 backdrop-blur-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Solde Disponible</h2>
              <Zap className="w-6 h-6 text-[var(--coconut-palm)]" />
            </div>
            
            <div className="text-4xl font-bold text-white mb-2">
              ${balance?.availableBalance.toFixed(2) || '0.00'}
            </div>
            
            <div className="text-sm text-white/60">
              Disponible pour retrait
            </div>

            <Button
              className="w-full mt-4 bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)] hover:opacity-90"
              onClick={() => setShowPayoutModal(true)}
              disabled={!balance || balance.availableBalance === 0}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Retirer
            </Button>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">En cours</h2>
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
            
            <div className="text-4xl font-bold text-yellow-500 mb-2">
              ${balance?.pendingPayout.toFixed(2) || '0.00'}
            </div>
            
            <div className="text-sm text-white/60">
              Retrait en traitement
            </div>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-white/60">Total Gagné</div>
              <TrendingUp className="w-5 h-5 text-[var(--coconut-palm)]" />
            </div>
            <div className="text-2xl font-bold text-white">
              ${balance?.totalEarned.toFixed(2) || '0.00'}
            </div>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-white/60">Total Retiré</div>
              <Check className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-white">
              ${balance?.totalWithdrawn.toFixed(2) || '0.00'}
            </div>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-white/60">Dernier Retrait</div>
              <Clock className="w-5 h-5 text-white/60" />
            </div>
            <div className="text-2xl font-bold text-white">
              ${balance?.lastPayoutAmount.toFixed(2) || '0.00'}
            </div>
            {balance?.lastPayoutDate && (
              <div className="text-xs text-white/40 mt-1">
                {new Date(balance.lastPayoutDate).toLocaleDateString('fr-FR')}
              </div>
            )}
          </Card>
        </div>

        {/* Payout Methods Info */}
        <Card className="mb-8 bg-white/5 backdrop-blur-xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-[var(--coconut-palm)]" />
            Méthodes de Retrait Disponibles
            <span className="text-sm font-normal text-white/60">
              ({detectedRegion === 'africa' ? 'Afrique' : 'International'})
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {detectedRegion === 'africa' ? (
              <>
                <div className="space-y-3 p-4 rounded-lg bg-[var(--coconut-palm)]/10 border border-[var(--coconut-palm)]/30">
                  <div className="flex items-center gap-2 text-white">
                    <Smartphone className="w-5 h-5 text-[var(--coconut-palm)]" />
                    <span className="font-semibold">Mobile Money</span>
                    <span className="text-xs text-[var(--coconut-palm)] bg-[var(--coconut-palm)]/20 px-2 py-1 rounded">
                      Instantané ⚡
                    </span>
                  </div>
                  <ul className="ml-7 space-y-1 text-sm text-white/70">
                    <li>• MTN Mobile Money</li>
                    <li>• Moov Money</li>
                    <li>• Orange Money</li>
                    <li>• Wave</li>
                  </ul>
                  <div className="text-xs text-white/60 pt-2 border-t border-white/10">
                    Minimum: 1,000 FCFA (~$1.50) • Frais: 1-2%
                  </div>
                </div>

                <div className="space-y-3 p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 text-white">
                    <Building2 className="w-5 h-5" />
                    <span className="font-semibold">Compte Bancaire</span>
                    <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded">
                      1-3 jours
                    </span>
                  </div>
                  <ul className="ml-7 space-y-1 text-sm text-white/70">
                    <li>• Banques locales UEMOA</li>
                  </ul>
                  <div className="text-xs text-white/60 pt-2 border-t border-white/10">
                    Minimum: 1,000 FCFA (~$1.50) • Frais: 1-2%
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-3 p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 text-white">
                    <Building2 className="w-5 h-5" />
                    <span className="font-semibold">Virement Bancaire</span>
                    <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded">
                      2-7 jours
                    </span>
                  </div>
                  <ul className="ml-7 space-y-1 text-sm text-white/70">
                    <li>• SEPA (Europe)</li>
                    <li>• ACH (USA)</li>
                    <li>• Wire Transfer (International)</li>
                  </ul>
                  <div className="text-xs text-white/60 pt-2 border-t border-white/10">
                    Minimum: $25 • Frais: 0.25%
                  </div>
                </div>

                <div className="space-y-3 p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 text-white">
                    <Zap className="w-5 h-5 text-[var(--coconut-palm)]" />
                    <span className="font-semibold">Instant Payout</span>
                    <span className="text-xs text-[var(--coconut-palm)] bg-[var(--coconut-palm)]/20 px-2 py-1 rounded">
                      Instantané ⚡
                    </span>
                  </div>
                  <ul className="ml-7 space-y-1 text-sm text-white/70">
                    <li>• Carte de débit (USA uniquement)</li>
                  </ul>
                  <div className="text-xs text-white/60 pt-2 border-t border-white/10">
                    Minimum: $25 • Frais: 1%
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="mt-6 flex items-center gap-2 text-sm text-white/60 pt-4 border-t border-white/10">
            <Shield className="w-4 h-4 text-[var(--coconut-palm)]" />
            <span>
              Paiements sécurisés via {detectedRegion === 'africa' ? 'FedaPay' : 'Stripe Connect'}
            </span>
          </div>
        </Card>

        {/* Payout History */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6 text-[var(--coconut-palm)]" />
            Historique des Retraits
          </h2>

          {payoutHistory.length > 0 ? (
            <div className="space-y-3">
              {payoutHistory.map((payout, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="flex items-center gap-4">
                    {getPayoutStatusIcon(payout.status)}
                    
                    <div>
                      <div className="text-white font-semibold">
                        ${payout.amount.toFixed(2)}
                      </div>
                      <div className="text-sm text-white/60">
                        {new Date(payout.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${getPayoutStatusColor(payout.status)}`}>
                        {payout.status === 'completed' ? 'Complété' :
                         payout.status === 'processing' ? 'En cours' :
                         payout.status === 'failed' ? 'Échoué' : 'En attente'}
                      </div>
                      <div className="text-xs text-white/60">
                        {payout.gateway === 'fedapay' ? 'FedaPay' : 'Stripe'} • {payout.method}
                      </div>
                    </div>

                    {payout.status === 'processing' && payout.estimatedArrival && (
                      <div className="text-xs text-white/60">
                        ETA: {new Date(payout.estimatedArrival).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-white/60">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun retrait pour le moment</p>
            </div>
          )}
        </Card>
      </div>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {showPayoutModal && (
          <Modal
            isOpen={showPayoutModal}
            onClose={() => setShowPayoutModal(false)}
            title="Retirer des Fonds"
          >
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Montant à retirer
                </label>
                <Input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder={`Minimum: ${detectedRegion === 'africa' ? '$1.50' : '$25'}`}
                  className="w-full"
                />
                {balance && (
                  <div className="text-sm text-white/60 mt-2">
                    Disponible: ${balance.availableBalance.toFixed(2)}
                  </div>
                )}
              </div>

              {/* Method selection would go here */}
              <div className="text-sm text-white/60">
                La méthode de retrait sera configurée lors de la première demande
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowPayoutModal(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleWithdrawRequest}
                  disabled={isLoading || !withdrawAmount}
                  className="flex-1 bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)]"
                >
                  {isLoading ? 'Traitement...' : 'Confirmer'}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Onboarding Required Modal */}
      <AnimatePresence>
        {needsOnboarding && onboardingUrl && (
          <Modal
            isOpen={needsOnboarding}
            onClose={() => setNeedsOnboarding(false)}
            title="Configuration Requise"
          >
            <div className="space-y-4">
              <p className="text-white/70">
                Pour recevoir des paiements, vous devez d'abord configurer votre compte de paiement.
              </p>

              <Button
                onClick={() => window.location.href = onboardingUrl}
                className="w-full bg-gradient-to-r from-[var(--coconut-shell)] to-[var(--coconut-palm)]"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Configurer Maintenant
              </Button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
