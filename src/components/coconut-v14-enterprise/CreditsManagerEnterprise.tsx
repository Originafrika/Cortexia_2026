/**
 * 🏢 CREDITS MANAGER ENTERPRISE - PREMIUM LIGHT
 * Clean credits management - Professional style
 * 
 * COCONUT PREMIUM DESIGN SYSTEM V3
 * - Light theme with Warm Cream accents
 * - Stats cards with gradients
 * - Purchase packages with cream highlights
 * - BDS: Arithmétique (Art 4) + Logique (Art 2)
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Zap, Plus, TrendingUp, Calendar, Download } from 'lucide-react';
import { Button } from '../ui-enterprise/Button';
import { Card } from '../ui-enterprise/Card';
import { Input } from '../ui-enterprise/Input';
import { Tabs, Tab } from '../ui-enterprise/Tabs';
import { Badge } from '../ui-enterprise/Badge';
import { Progress } from '../ui-enterprise/Progress';

interface CreditsManagerEnterpriseProps {
  currentCredits: number;
  monthlyUsage?: number;
  onPurchase: (amount: number) => void;
  isEnterprise?: boolean;
}

export function CreditsManagerEnterprise({
  currentCredits,
  monthlyUsage = 0,
  onPurchase,
  isEnterprise = false
}: CreditsManagerEnterpriseProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [purchaseAmount, setPurchaseAmount] = useState(1000);

  const tabs: Tab[] = [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'purchase', label: 'Acheter' },
    { id: 'history', label: 'Historique' },
  ];

  const packages = [
    { credits: 500, price: 9.99, popular: false },
    { credits: 1000, price: 17.99, popular: true },
    { credits: 5000, price: 79.99, popular: false },
    { credits: 10000, price: 149.99, popular: false },
  ];

  return (
    <div className="p-8 space-y-8 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">Crédits</h1>
          <p className="text-lg text-stone-600">Gérez vos crédits de génération</p>
        </div>
        {isEnterprise && (
          <Badge variant="primary">Entreprise - Illimité</Badge>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center gap-4 bg-gradient-to-br from-cream-50 to-amber-50 border-cream-200">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cream-100 to-amber-100 flex items-center justify-center shadow-sm">
              <Zap className="w-7 h-7 text-cream-600" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">Solde actuel</div>
              <div className="text-3xl font-bold text-stone-900">{currentCredits.toLocaleString()}</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4 bg-white border-stone-200">
            <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center shadow-sm">
              <TrendingUp className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">Utilisés ce mois</div>
              <div className="text-3xl font-bold text-stone-900">{monthlyUsage.toLocaleString()}</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4 bg-white border-stone-200">
            <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center shadow-sm">
              <Calendar className="w-7 h-7 text-purple-600" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">Renouvellement</div>
              <div className="text-lg font-bold text-stone-900">1er du mois</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="underline"
        fullWidth
      />

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <Card>
            <div className="space-y-4 bg-white border-stone-200">
              <h3 className="font-semibold text-stone-900">Utilisation mensuelle</h3>
              <Progress
                value={(monthlyUsage / (monthlyUsage + currentCredits)) * 100}
                label="Progression"
                showLabel
              />
              <div className="flex justify-between text-sm text-stone-600">
                <span>{monthlyUsage} utilisés</span>
                <span>{currentCredits} restants</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'purchase' && !isEnterprise && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {packages.map((pkg) => (
              <Card
                key={pkg.credits}
                clickable
                hover
                onClick={() => setPurchaseAmount(pkg.credits)}
                className={`relative bg-white border-stone-200 hover:border-cream-300 hover:shadow-lg ${
                  purchaseAmount === pkg.credits ? 'ring-2 ring-cream-500 border-cream-500' : ''
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-2 right-4">
                    <Badge variant="success" size="sm">Populaire</Badge>
                  </div>
                )}
                <div className="text-center space-y-3">
                  <div className="text-4xl font-bold text-stone-900">{pkg.credits.toLocaleString()}</div>
                  <div className="text-sm text-stone-500 font-medium">crédits</div>
                  <div className="text-2xl font-bold text-cream-600">${pkg.price}</div>
                  <Button
                    variant={pkg.popular ? 'primary' : 'secondary'}
                    size="sm"
                    fullWidth
                    onClick={() => onPurchase(pkg.credits)}
                  >
                    Acheter
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <Card>
          <div className="text-center py-8 text-stone-500 bg-white border-stone-200">
            Historique des transactions (à venir)
          </div>
        </Card>
      )}
    </div>
  );
}