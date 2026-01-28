/**
 * TERMS OF SERVICE - Legal Framework
 * BDS: Grammaire (clarté juridique), Logique (structure contractuelle)
 * 7 Arts: Transparence et équité des conditions
 */

import { ArrowLeft, Scale, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface TermsOfServiceProps {
  onNavigate: (screen: string) => void;
}

export function TermsOfService({ onNavigate }: TermsOfServiceProps) {
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 mb-4">
            <Scale className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Conditions Générales d'Utilisation</h1>
          <p className="text-slate-600 text-lg">
            Dernière mise à jour : 22 janvier 2026
          </p>
        </div>

        {/* Content Sections */}
        <div className="prose prose-slate max-w-none">
          {/* 1. Acceptation */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">1. Acceptation des Conditions</h2>
            <p className="text-slate-700 leading-relaxed">
              En accédant et en utilisant <strong>Cortexia Creation Hub</strong> (ci-après "le Service"), 
              vous acceptez d'être lié par ces Conditions Générales d'Utilisation (CGU). 
              Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser le Service.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6 rounded-r-lg">
              <p className="text-sm text-blue-900 m-0">
                <strong>Important :</strong> Ces CGU constituent un contrat juridiquement contraignant entre vous 
                et Cortexia. Veuillez les lire attentivement.
              </p>
            </div>
          </section>

          {/* 2. Définitions */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">2. Définitions</h2>
            <ul className="space-y-2 text-slate-700">
              <li><strong>"Service" :</strong> Plateforme Cortexia Creation Hub accessible via app.cortexia.ai</li>
              <li><strong>"Utilisateur" :</strong> Toute personne utilisant le Service (Individual, Enterprise, Developer)</li>
              <li><strong>"Crédit" :</strong> Unité de compte permettant d'utiliser les fonctionnalités de génération AI</li>
              <li><strong>"Contenu Utilisateur" :</strong> Tout contenu créé, uploadé ou publié par l'utilisateur</li>
              <li><strong>"Contenu Généré" :</strong> Contenu créé par les modèles AI du Service</li>
              <li><strong>"Origins" :</strong> Monnaie virtuelle du Creator System (utilisateurs Individual)</li>
            </ul>
          </section>

          {/* 3. Éligibilité */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">3. Éligibilité et Inscription</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-4">3.1 Âge minimum</h3>
            <p className="text-slate-700">
              Vous devez avoir <strong>au moins 18 ans</strong> pour utiliser le Service. 
              En créant un compte, vous certifiez que vous avez l'âge légal.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-4">3.2 Types de comptes</h3>
            <div className="grid md:grid-cols-3 gap-4 my-6">
              <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-violet-900">Individual</h4>
                <p className="text-sm text-slate-600">
                  Accès : Feed, CreateHub, Creator System<br/>
                  Crédits : 25 gratuits + achat à $0.10/crédit
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-amber-900">Enterprise</h4>
                <p className="text-sm text-slate-600">
                  Accès : Coconut V14 uniquement<br/>
                  Abonnement : $999/mois = 10,000 crédits<br/>
                  Add-on : $0.09/crédit
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-blue-900">Developer</h4>
                <p className="text-sm text-slate-600">
                  Accès : API Dashboard + Coconut V14<br/>
                  Crédits : 100 test + achat à $0.10/crédit
                </p>
              </div>
            </div>

            <h3 className="text-xl font-semibold mt-6 mb-4">3.3 Informations exactes</h3>
            <p className="text-slate-700">
              Vous vous engagez à fournir des informations <strong>exactes, complètes et à jour</strong> lors de l'inscription. 
              Vous êtes responsable de la confidentialité de votre compte.
            </p>
          </section>

          {/* 4. Crédits et paiements */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">4. Crédits et Paiements</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-4">4.1 Système de crédits</h3>
            <table className="w-full border-collapse mb-6">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 px-4 py-2 text-left">Type</th>
                  <th className="border border-slate-300 px-4 py-2 text-left">Gratuits</th>
                  <th className="border border-slate-300 px-4 py-2 text-left">Payants</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr>
                  <td className="border border-slate-300 px-4 py-2">Individual</td>
                  <td className="border border-slate-300 px-4 py-2">25 au signup + 25/mois</td>
                  <td className="border border-slate-300 px-4 py-2">$0.10/crédit</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 px-4 py-2">Enterprise</td>
                  <td className="border border-slate-300 px-4 py-2">10,000/mois (abonnement)</td>
                  <td className="border border-slate-300 px-4 py-2">$0.09/crédit (add-on)</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 px-4 py-2">Developer</td>
                  <td className="border border-slate-300 px-4 py-2">100 test</td>
                  <td className="border border-slate-300 px-4 py-2">$0.10/crédit</td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-xl font-semibold mt-6 mb-4">4.2 Ordre de déduction</h3>
            <p className="text-slate-700">
              Les crédits gratuits sont utilisés en premier, puis les crédits payants.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-4">4.3 Non-remboursables</h3>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 my-6 rounded-r-lg">
              <p className="text-sm text-red-900 m-0">
                <strong>⚠️ Important :</strong> Les crédits achetés sont <strong>non remboursables</strong>, 
                sauf obligation légale ou dysfonctionnement du Service imputable à Cortexia.
              </p>
            </div>

            <h3 className="text-xl font-semibold mt-6 mb-4">4.4 Abonnements Enterprise</h3>
            <ul className="space-y-2 text-slate-700">
              <li>✅ Facturation mensuelle récurrente via Stripe</li>
              <li>✅ Crédits mensuels reset le 1er de chaque mois</li>
              <li>✅ Crédits non utilisés <strong>perdus</strong> au reset</li>
              <li>✅ Add-on crédits <strong>persistants</strong> (ne expirent pas)</li>
              <li>✅ Annulation possible (prend effet fin période en cours)</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-4">4.5 Paiements</h3>
            <p className="text-slate-700">
              Tous les paiements sont traités par <strong>Stripe</strong> (certifié PCI-DSS Level 1). 
              Nous ne stockons aucune information bancaire. Vous acceptez les 
              <a href="https://stripe.com/legal/consumer" className="text-blue-600 hover:underline" target="_blank" rel="noopener"> Conditions Stripe</a>.
            </p>
          </section>

          {/* 5. Utilisation acceptable */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">5. Utilisation Acceptable</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-4 text-green-700">✅ Vous POUVEZ :</h3>
            <ul className="space-y-2 text-slate-700">
              <li>✅ Créer du contenu pour usage personnel ou commercial</li>
              <li>✅ Partager vos créations sur le Feed (Individual)</li>
              <li>✅ Utiliser les générations dans vos projets clients (Enterprise)</li>
              <li>✅ Intégrer l'API dans vos applications (Developer)</li>
              <li>✅ Participer au Creator System et gagner des Origins</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-4 text-red-700">❌ Vous NE POUVEZ PAS :</h3>
            <ul className="space-y-2 text-slate-700">
              <li>❌ Créer du contenu illégal, diffamatoire, haineux ou violent</li>
              <li>❌ Générer du contenu pornographique, pédophile ou explicite non consenti</li>
              <li>❌ Usurper l'identité d'une personne ou organisation</li>
              <li>❌ Violer des droits de propriété intellectuelle (marques, copyrights)</li>
              <li>❌ Automatiser des requêtes (bots, scraping) sans autorisation</li>
              <li>❌ Revendre ou redistribuer les crédits</li>
              <li>❌ Contourner les limites techniques (rate limiting, quotas)</li>
              <li>❌ Tenter d'accéder aux comptes d'autres utilisateurs</li>
              <li>❌ Utiliser le Service pour du spam ou phishing</li>
            </ul>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 my-6 rounded-r-lg">
              <p className="text-sm text-amber-900 m-0">
                <strong>⚠️ Conséquences :</strong> Toute violation peut entraîner la <strong>suspension ou suppression 
                définitive</strong> de votre compte, sans remboursement des crédits.
              </p>
            </div>
          </section>

          {/* 6. Propriété intellectuelle */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">6. Propriété Intellectuelle</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-4">6.1 Vos créations</h3>
            <p className="text-slate-700 mb-4">
              <strong>Vous conservez tous les droits</strong> sur le contenu que vous créez avec le Service, 
              sous réserve de notre licence limitée ci-dessous.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-4">6.2 Licence à Cortexia</h3>
            <p className="text-slate-700 mb-4">
              En publiant du contenu sur le Feed (Individual), vous accordez à Cortexia une licence 
              <strong> mondiale, non-exclusive, libre de redevances</strong> pour :
            </p>
            <ul className="space-y-2 text-slate-700">
              <li>✅ Afficher votre contenu dans le Feed public</li>
              <li>✅ Promouvoir le Service (ex: galerie sur site web)</li>
              <li>✅ Modération et sécurité (détection contenu inapproprié)</li>
            </ul>
            <p className="text-slate-700 mt-4">
              <strong>Note :</strong> Cette licence prend fin si vous supprimez le contenu ou votre compte.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-4">6.3 Marques Cortexia</h3>
            <p className="text-slate-700">
              Tous les logos, marques, noms de domaine et éléments visuels de Cortexia sont notre propriété exclusive. 
              Vous ne pouvez les utiliser sans autorisation écrite.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-4">6.4 Respect des droits tiers</h3>
            <p className="text-slate-700">
              Vous êtes <strong>seul responsable</strong> de vérifier que vos créations ne violent pas les droits de tiers 
              (copyrights, marques, droits à l'image). Cortexia décline toute responsabilité.
            </p>
          </section>

          {/* 7. Limitation responsabilité */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">7. Limitation de Responsabilité</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-4">7.1 Service "tel quel"</h3>
            <p className="text-slate-700">
              Le Service est fourni <strong>"en l'état"</strong> et <strong>"tel que disponible"</strong>, 
              sans garantie d'aucune sorte (expresse ou implicite).
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-4">7.2 Disponibilité</h3>
            <p className="text-slate-700">
              Nous nous efforçons de maintenir le Service disponible 24/7, mais ne garantissons pas :
            </p>
            <ul className="space-y-2 text-slate-700">
              <li>❌ Absence d'interruptions (maintenance, pannes)</li>
              <li>❌ Précision à 100% des générations AI</li>
              <li>❌ Sauvegarde automatique de vos créations (backups recommandés)</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-4">7.3 Exclusion dommages</h3>
            <div className="bg-slate-100 border border-slate-300 rounded-lg p-4">
              <p className="text-sm text-slate-700 m-0">
                <strong>Cortexia ne pourra être tenu responsable</strong> des dommages indirects, accessoires, 
                spéciaux ou consécutifs (perte de profits, de données, d'opportunités commerciales) résultant de :
              </p>
              <ul className="text-sm text-slate-700 mt-2 space-y-1">
                <li>• Utilisation ou impossibilité d'utiliser le Service</li>
                <li>• Qualité des générations AI</li>
                <li>• Perte ou corruption de données</li>
                <li>• Actions d'autres utilisateurs</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold mt-6 mb-4">7.4 Plafond de responsabilité</h3>
            <p className="text-slate-700">
              Notre responsabilité totale est limitée aux <strong>montants payés par vous au cours des 12 derniers mois</strong>, 
              ou 100€ si aucun paiement n'a été effectué.
            </p>
          </section>

          {/* 8. Résiliation */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">8. Résiliation</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-4">8.1 Par vous</h3>
            <p className="text-slate-700">
              Vous pouvez supprimer votre compte à tout moment via <strong>Paramètres → Supprimer mon compte</strong>. 
              Vos données seront supprimées sous 30 jours (délai RGPD).
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-4">8.2 Par Cortexia</h3>
            <p className="text-slate-700 mb-4">
              Nous pouvons suspendre ou supprimer votre compte si :
            </p>
            <ul className="space-y-2 text-slate-700">
              <li>❌ Vous violez ces CGU</li>
              <li>❌ Activité frauduleuse ou illégale détectée</li>
              <li>❌ Inactivité prolongée (12+ mois, compte Individual gratuit)</li>
              <li>❌ Non-paiement (Enterprise)</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-4">8.3 Effets de la résiliation</h3>
            <ul className="space-y-2 text-slate-700">
              <li>✅ Accès immédiat révoqué</li>
              <li>✅ Crédits restants perdus (non remboursables)</li>
              <li>✅ Contenu publié peut être conservé 30 jours (anonymisé)</li>
              <li>✅ Abonnement annulé (prorata non applicable)</li>
            </ul>
          </section>

          {/* 9. Modifications */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">9. Modifications des CGU</h2>
            <p className="text-slate-700">
              Nous pouvons modifier ces CGU à tout moment. Les modifications majeures seront notifiées par :
            </p>
            <ul className="space-y-2 text-slate-700 mt-4">
              <li>✅ Email (adresse associée à votre compte)</li>
              <li>✅ Notification in-app</li>
              <li>✅ Mise à jour de la date en haut de cette page</li>
            </ul>
            <p className="text-slate-700 mt-4">
              L'utilisation continue du Service après notification constitue votre acceptation des nouvelles CGU.
            </p>
          </section>

          {/* 10. Droit applicable */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">10. Droit Applicable et Juridiction</h2>
            <p className="text-slate-700">
              Ces CGU sont régies par le <strong>droit français</strong>. 
              Tout litige sera soumis à la compétence exclusive des tribunaux de <strong>[Ville à définir]</strong>.
            </p>
            <p className="text-slate-700 mt-4">
              Conformément à la réglementation européenne, vous disposez d'un <strong>droit de rétractation de 14 jours</strong> 
              pour les achats de crédits, sauf si vous avez commencé à les utiliser.
            </p>
          </section>

          {/* 11. Contact */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">11. Contact</h2>
            <div className="bg-slate-100 rounded-lg p-6">
              <p className="text-slate-700 mb-2"><strong>Cortexia</strong></p>
              <p className="text-slate-700 mb-2">Email : <a href="mailto:legal@cortexia.ai" className="text-blue-600 hover:underline">legal@cortexia.ai</a></p>
              <p className="text-slate-700 mb-2">Support : <a href="mailto:support@cortexia.ai" className="text-blue-600 hover:underline">support@cortexia.ai</a></p>
              <p className="text-slate-700">Adresse : [À définir]</p>
            </div>
          </section>
        </div>

        {/* Footer CTA */}
        <div className="mt-12 p-6 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl text-white text-center">
          <h3 className="text-xl font-bold mb-2">Questions sur les CGU ?</h3>
          <p className="mb-4 text-blue-100">
            Notre équipe juridique est disponible pour clarifier ces conditions.
          </p>
          <button
            onClick={() => window.location.href = 'mailto:legal@cortexia.ai'}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Nous contacter
          </button>
        </div>
      </div>
    </div>
  );
}
