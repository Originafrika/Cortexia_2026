/**
 * 🏢 SETTINGS PANEL ENTERPRISE - PREMIUM LIGHT
 * Clean settings management - Professional style
 * 
 * COCONUT PREMIUM DESIGN SYSTEM V3
 * - Light theme with Warm Cream accents
 * - Tabbed interface with switches
 * - BDS: Grammaire (Art 1) + Logique (Art 2)
 */

import React, { useState } from 'react';
import { Settings, User, Bell, Shield, Palette, Save } from 'lucide-react';
import { Button } from '../ui-enterprise/Button';
import { Card } from '../ui-enterprise/Card';
import { Input } from '../ui-enterprise/Input';
import { Select } from '../ui-enterprise/Select';
import { Switch } from '../ui-enterprise/Switch';
import { Tabs, Tab } from '../ui-enterprise/Tabs';

interface SettingsPanelEnterpriseProps {
  onClose: () => void;
  onSave?: (settings: any) => void;
}

export function SettingsPanelEnterprise({
  onClose,
  onSave
}: SettingsPanelEnterpriseProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  const tabs: Tab[] = [
    { id: 'profile', label: 'Profil', icon: <User className="w-4 h-4" /> },
    { id: 'preferences', label: 'Préférences', icon: <Settings className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'security', label: 'Sécurité', icon: <Shield className="w-4 h-4" /> },
  ];

  const handleSave = () => {
    onSave?.({
      soundEnabled,
      notificationsEnabled,
      autoSave,
    });
    onClose();
  };

  return (
    <div className="p-8 space-y-8 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">Paramètres</h1>
          <p className="text-lg text-stone-600">Gérez vos préférences et paramètres</p>
        </div>
        <Button variant="ghost" onClick={onClose}>
          Fermer
        </Button>
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
      <div className="space-y-6">
        {activeTab === 'profile' && (
          <>
            <Card>
              <div className="space-y-4 bg-white border-stone-200">
                <h3 className="font-semibold text-stone-900">Informations personnelles</h3>
                <Input
                  label="Nom complet"
                  placeholder="John Doe"
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="john@example.com"
                />
                <Input
                  label="Organisation"
                  placeholder="Mon entreprise"
                />
              </div>
            </Card>
          </>
        )}

        {activeTab === 'preferences' && (
          <>
            <Card>
              <div className="space-y-4 bg-white border-stone-200">
                <h3 className="font-semibold text-stone-900 mb-4">Interface</h3>
                
                <Switch
                  checked={soundEnabled}
                  onChange={setSoundEnabled}
                  label="Effets sonores"
                  description="Activer les sons d'interface"
                />

                <Switch
                  checked={autoSave}
                  onChange={setAutoSave}
                  label="Sauvegarde automatique"
                  description="Enregistrer automatiquement vos modifications"
                />

                <div className="pt-4 border-t border-stone-200">
                  <Select
                    label="Langue"
                    value="fr"
                    onChange={() => {}}
                    options={[
                      { value: 'fr', label: 'Français' },
                      { value: 'en', label: 'English' },
                    ]}
                  />
                </div>
              </div>
            </Card>
          </>
        )}

        {activeTab === 'notifications' && (
          <>
            <Card>
              <div className="space-y-4 bg-white border-stone-200">
                <h3 className="font-semibold text-stone-900 mb-4">Notifications</h3>
                
                <Switch
                  checked={notificationsEnabled}
                  onChange={setNotificationsEnabled}
                  label="Notifications push"
                  description="Recevoir des notifications dans le navigateur"
                />

                <Switch
                  checked={true}
                  onChange={() => {}}
                  label="Emails de génération"
                  description="Recevoir un email quand une génération est terminée"
                />

                <Switch
                  checked={true}
                  onChange={() => {}}
                  label="Newsletters"
                  description="Recevoir les actualités et mises à jour"
                />
              </div>
            </Card>
          </>
        )}

        {activeTab === 'security' && (
          <>
            <Card>
              <div className="space-y-4 bg-white border-stone-200">
                <h3 className="font-semibold text-stone-900 mb-4">Sécurité</h3>
                
                <Input
                  label="Mot de passe actuel"
                  type="password"
                  placeholder="••••••••"
                />

                <Input
                  label="Nouveau mot de passe"
                  type="password"
                  placeholder="••••••••"
                />

                <Input
                  label="Confirmer le mot de passe"
                  type="password"
                  placeholder="••••••••"
                />

                <Button variant="secondary" size="sm">
                  Changer le mot de passe
                </Button>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-6 border-t border-stone-200">
        <Button variant="ghost" onClick={onClose}>
          Annuler
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          icon={<Save className="w-4 h-4" />}
        >
          Enregistrer
        </Button>
      </div>
    </div>
  );
}