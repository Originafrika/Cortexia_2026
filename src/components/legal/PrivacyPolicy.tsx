/**
 * PRIVACY POLICY - RGPD Compliant
 * BDS: Grammaire (clarté), Logique (structure), Rhétorique (communication)
 * 7 Arts: Transparence totale sur gestion des données
 */

import { ArrowLeft, Shield, Lock, Eye, Download, Trash2, FileText } from 'lucide-react';

interface PrivacyPolicyProps {
  onNavigate: (screen: string) => void;
}

export function PrivacyPolicy({ onNavigate }: PrivacyPolicyProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-100 mb-4">
            <Shield className="w-8 h-8 text-violet-600" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Politique de Confidentialité</h1>
          <p className="text-slate-600 text-lg">
            Dernière mise à jour : 22 janvier 2026
          </p>
        </div>

        {/* Content Sections */}
        <div className="prose prose-slate max-w-none">
          {/* 1. Introduction */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-violet-600" />
              </div>
              <h2 className="text-2xl font-bold m-0">1. Introduction</h2>
            </div>
            <p className="text-slate-700 leading-relaxed">
              Bienvenue sur <strong>Cortexia Creation Hub</strong>. Nous prenons la protection de vos données personnelles très au sérieux. 
              Cette politique de confidentialité explique quelles informations nous collectons, comment nous les utilisons, 
              et quels sont vos droits conformément au Règlement Général sur la Protection des Données (RGPD).
            </p>
            <div className="bg-violet-50 border-l-4 border-violet-500 p-4 my-6 rounded-r-lg">
              <p className="text-sm text-violet-900 m-0">
                <strong>Important :</strong> Cortexia Creation Hub n'est pas conçu pour collecter des informations personnelles identifiables (PII) 
                sensibles ou des données nécessitant une sécurité bancaire. Nous utilisons des services tiers certifiés (Stripe, Auth0) 
                pour les données sensibles.
              </p>
            </div>
          </section>

          {/* 2. Données collectées */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold m-0">2. Données Collectées</h2>
            </div>
            
            <h3 className="text-xl font-semibold mt-8 mb-4">2.1 Utilisateurs Individual (Particuliers)</h3>
            <ul className="space-y-2 text-slate-700">
              <li><strong>Identité :</strong> Email, nom complet, photo de profil (si connexion sociale)</li>
              <li><strong>Authentification :</strong> Type de compte, méthode d'authentification (Supabase ou Auth0)</li>
              <li><strong>Économie :</strong> Crédits gratuits/payants, solde Origins, historique transactions</li>
              <li><strong>Créativité :</strong> Créations publiées, likes reçus, remix, streak de création</li>
              <li><strong>Parrainage :</strong> Code parrain utilisé, commissions gagnées</li>
            </ul>

            <h3 className="text-xl font-semibold mt-8 mb-4">2.2 Utilisateurs Enterprise (Entreprises)</h3>
            <ul className="space-y-2 text-slate-700">
              <li><strong>Identité :</strong> Email, nom, entreprise, secteur d'activité, taille entreprise</li>
              <li><strong>Branding :</strong> Logo entreprise (URL), palette de couleurs marque</li>
              <li><strong>Abonnement :</strong> Plan souscrit, crédits mensuels, add-on, ID Stripe</li>
              <li><strong>Usage :</strong> Campagnes créées, générations totales, dernière utilisation</li>
            </ul>

            <h3 className="text-xl font-semibold mt-8 mb-4">2.3 Utilisateurs Developer (Développeurs)</h3>
            <ul className="space-y-2 text-slate-700">
              <li><strong>Identité :</strong> Email, nom, use case, username GitHub</li>
              <li><strong>API :</strong> Clés API (hashées), permissions, dernière utilisation</li>
              <li><strong>Usage :</strong> Requêtes totales, quota mensuel, rate limiting</li>
            </ul>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 my-6 rounded-r-lg">
              <p className="text-sm text-amber-900 m-0">
                <strong>❌ Nous ne collectons JAMAIS :</strong> Numéros de carte bancaire, mots de passe en clair, 
                données médicales, informations biométriques, données de mineurs (âge minimum 18 ans).
              </p>
            </div>
          </section>

          {/* 3. Utilisation des données */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Lock className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold m-0">3. Utilisation des Données</h2>
            </div>
            
            <p className="text-slate-700 leading-relaxed mb-4">
              Nous utilisons vos données uniquement pour :
            </p>
            <ul className="space-y-2 text-slate-700">
              <li>✅ <strong>Fourniture du service :</strong> Authentification, génération de contenu, gestion de crédits</li>
              <li>✅ <strong>Amélioration produit :</strong> Analyse d'usage agrégée (anonymisée), détection bugs</li>
              <li>✅ <strong>Support client :</strong> Résolution problèmes, réponse questions</li>
              <li>✅ <strong>Facturation :</strong> Gestion abonnements, traitement paiements (via Stripe)</li>
              <li>✅ <strong>Communications :</strong> Emails transactionnels (confirmations, alertes crédits)</li>
              <li>✅ <strong>Sécurité :</strong> Détection fraude, protection compte</li>
            </ul>

            <div className="bg-red-50 border-l-4 border-red-500 p-4 my-6 rounded-r-lg">
              <p className="text-sm text-red-900 m-0">
                <strong>❌ Nous n'utilisons JAMAIS vos données pour :</strong> Publicité ciblée externe, 
                vente à des tiers, profilage non consenti, marketing sans opt-in.
              </p>
            </div>
          </section>

          {/* 4. Stockage et sécurité */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold m-0">4. Stockage et Sécurité</h2>
            </div>
            
            <h3 className="text-xl font-semibold mt-8 mb-4">Où sont stockées vos données ?</h3>
            <ul className="space-y-3 text-slate-700">
              <li>
                <strong>Supabase (PostgreSQL) :</strong> Hébergement sécurisé (certifié SOC 2 Type II)<br/>
                <span className="text-sm text-slate-600">Localisation : Europe (GDPR compliant)</span>
              </li>
              <li>
                <strong>Auth0 :</strong> Authentification sociale (certifié ISO 27001)<br/>
                <span className="text-sm text-slate-600">Données : Email, nom uniquement (OAuth flow)</span>
              </li>
              <li>
                <strong>Stripe :</strong> Paiements sécurisés (certifié PCI-DSS Level 1)<br/>
                <span className="text-sm text-slate-600">Données : Aucune carte stockée chez nous</span>
              </li>
            </ul>

            <h3 className="text-xl font-semibold mt-8 mb-4">Mesures de sécurité</h3>
            <ul className="space-y-2 text-slate-700">
              <li>🔒 <strong>Encryption :</strong> HTTPS/TLS 1.3 pour toutes communications</li>
              <li>🔐 <strong>Passwords :</strong> Hashage bcrypt (jamais stockés en clair)</li>
              <li>🎫 <strong>Sessions :</strong> JWT avec expiration 1h, tokens HttpOnly</li>
              <li>🛡️ <strong>Base de données :</strong> Row Level Security (RLS) activé</li>
              <li>🔑 <strong>API Keys :</strong> Hashées en base, jamais exposées frontend</li>
              <li>⚡ <strong>Rate Limiting :</strong> Protection contre brute force</li>
            </ul>
          </section>

          {/* 5. Partage avec tiers */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">5. Partage avec Tiers</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-4">✅ Partenaires autorisés</h3>
            <table className="w-full border-collapse mb-6">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 px-4 py-2 text-left">Service</th>
                  <th className="border border-slate-300 px-4 py-2 text-left">Données partagées</th>
                  <th className="border border-slate-300 px-4 py-2 text-left">Raison</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr>
                  <td className="border border-slate-300 px-4 py-2">Stripe</td>
                  <td className="border border-slate-300 px-4 py-2">Email, Customer ID</td>
                  <td className="border border-slate-300 px-4 py-2">Traitement paiements</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 px-4 py-2">Auth0</td>
                  <td className="border border-slate-300 px-4 py-2">Email, Nom</td>
                  <td className="border border-slate-300 px-4 py-2">Authentification sociale</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 px-4 py-2">Supabase</td>
                  <td className="border border-slate-300 px-4 py-2">Toutes données</td>
                  <td className="border border-slate-300 px-4 py-2">Hébergement base de données</td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-xl font-semibold mt-6 mb-4">❌ Nous ne partageons JAMAIS avec :</h3>
            <ul className="space-y-2 text-slate-700">
              <li>❌ Plateformes publicitaires (Google Ads, Facebook Ads, etc.)</li>
              <li>❌ Data brokers ou revendeurs de données</li>
              <li>❌ Réseaux sociaux (sauf si vous partagez volontairement)</li>
              <li>❌ Analytics externes non-anonymisés</li>
            </ul>
          </section>

          {/* 6. Vos droits RGPD */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">6. Vos Droits (RGPD)</h2>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2">📖 Droit d'accès</h4>
                <p className="text-sm text-slate-600">
                  Consultez toutes vos données via votre profil ou demandez une copie complète.
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2">✏️ Droit de rectification</h4>
                <p className="text-sm text-slate-600">
                  Modifiez vos informations dans Paramètres → Profil.
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2">🗑️ Droit à l'effacement</h4>
                <p className="text-sm text-slate-600">
                  Supprimez votre compte via Paramètres → Supprimer mon compte.
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2">💾 Droit à la portabilité</h4>
                <p className="text-sm text-slate-600">
                  Exportez vos données au format JSON via Paramètres.
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2">⛔ Droit d'opposition</h4>
                <p className="text-sm text-slate-600">
                  Refusez le traitement de données non-essentielles (marketing, analytics).
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2">⏸️ Droit à la limitation</h4>
                <p className="text-sm text-slate-600">
                  Demandez la suspension temporaire du traitement de vos données.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <p className="text-sm text-blue-900 m-0">
                <strong>Comment exercer vos droits ?</strong><br/>
                Envoyez un email à <strong>privacy@cortexia.ai</strong> avec votre demande. 
                Nous répondrons sous 30 jours maximum (délai RGPD).
              </p>
            </div>
          </section>

          {/* 7. Durée de conservation */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">7. Durée de Conservation</h2>
            <ul className="space-y-2 text-slate-700">
              <li><strong>Compte actif :</strong> Tant que votre compte existe</li>
              <li><strong>Après suppression :</strong> 30 jours (délai de rétractation), puis suppression définitive</li>
              <li><strong>Données anonymisées :</strong> Conservées indéfiniment pour statistiques agrégées</li>
              <li><strong>Logs sécurité :</strong> 90 jours maximum</li>
              <li><strong>Factures (obligation légale) :</strong> 10 ans</li>
            </ul>
          </section>

          {/* 8. Cookies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">8. Cookies et Technologies Similaires</h2>
            <p className="text-slate-700 mb-4">Nous utilisons uniquement des cookies essentiels :</p>
            <ul className="space-y-2 text-slate-700">
              <li>🍪 <strong>Session cookie :</strong> Maintien de votre connexion (JWT, HttpOnly)</li>
              <li>💾 <strong>localStorage :</strong> Cache données non-sensibles (profil, préférences)</li>
            </ul>
            <p className="text-slate-700 mt-4">
              <strong>❌ Nous n'utilisons PAS :</strong> Cookies publicitaires, tracking tiers, analytics invasifs.
            </p>
          </section>

          {/* 9. Modifications */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">9. Modifications de cette Politique</h2>
            <p className="text-slate-700">
              Nous pouvons mettre à jour cette politique. Toute modification sera :
            </p>
            <ul className="space-y-2 text-slate-700 mt-4">
              <li>✅ Notifiée par email (changements majeurs)</li>
              <li>✅ Affichée sur cette page avec nouvelle date</li>
              <li>✅ Archivée (versions précédentes disponibles sur demande)</li>
            </ul>
          </section>

          {/* 10. Contact */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">10. Contact</h2>
            <div className="bg-slate-100 rounded-lg p-6">
              <p className="text-slate-700 mb-2"><strong>Data Protection Officer (DPO) :</strong></p>
              <p className="text-slate-700 mb-2">Email : <a href="mailto:privacy@cortexia.ai" className="text-violet-600 hover:underline">privacy@cortexia.ai</a></p>
              <p className="text-slate-700 mb-2">Adresse : [À définir]</p>
              <p className="text-slate-700 mt-4 text-sm">
                Vous avez également le droit de déposer une plainte auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) 
                si vous estimez que vos droits ne sont pas respectés.
              </p>
            </div>
          </section>
        </div>

        {/* Footer CTA */}
        <div className="mt-12 p-6 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl text-white text-center">
          <h3 className="text-xl font-bold mb-2">Des questions ?</h3>
          <p className="mb-4 text-violet-100">
            Notre équipe est là pour répondre à toutes vos questions sur la confidentialité.
          </p>
          <button
            onClick={() => window.location.href = 'mailto:privacy@cortexia.ai'}
            className="bg-white text-violet-600 px-6 py-3 rounded-lg font-semibold hover:bg-violet-50 transition-colors"
          >
            Contactez-nous
          </button>
        </div>
      </div>
    </div>
  );
}
