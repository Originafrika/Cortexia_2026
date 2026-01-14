/**
 * Auth0 Setup Helper
 * Displays setup instructions if Auth0 is not configured
 */

import { AlertCircle, ExternalLink, CheckCircle } from 'lucide-react';
import { isAuth0Configured } from '../../lib/config/auth0';

export function Auth0SetupHelper() {
  const isConfigured = isAuth0Configured();

  if (isConfigured) {
    return null; // Don't show if already configured
  }

  return (
    <div className="fixed bottom-6 right-6 max-w-md z-50 animate-in slide-in-from-bottom-5">
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-2xl shadow-amber-500/20 backdrop-blur-xl">
        {/* Header */}
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20">
            <AlertCircle className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text font-semibold text-transparent">
              Configuration Auth0 Requise
            </h3>
            <p className="mt-1 text-sm text-amber-700">
              Activez la connexion sociale (Google, LinkedIn) en 25 minutes
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          <div className="flex items-start gap-3 rounded-lg bg-white/60 p-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-xs font-semibold text-amber-700">
              1
            </div>
            <div className="flex-1">
              <p className="text-sm text-amber-900">
                Créer un compte Auth0 (gratuit)
              </p>
              <a
                href="https://auth0.com/signup"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700"
              >
                auth0.com/signup
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-white/60 p-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-xs font-semibold text-amber-700">
              2
            </div>
            <div className="flex-1">
              <p className="text-sm text-amber-900">
                Suivre le guide de configuration
              </p>
              <a
                href="/AUTH0_SETUP_GUIDE.md"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700"
              >
                Voir le guide complet
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-white/60 p-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-xs font-semibold text-amber-700">
              3
            </div>
            <div className="flex-1">
              <p className="text-sm text-amber-900">
                Ajouter les variables d'environnement
              </p>
              <code className="mt-1 block rounded bg-amber-100/50 px-2 py-1 text-xs text-amber-800">
                VITE_AUTH0_DOMAIN<br />
                VITE_AUTH0_CLIENT_ID
              </code>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 rounded-lg border border-amber-200/50 bg-white/40 p-3">
          <p className="text-xs text-amber-600">
            💡 <strong>Astuce :</strong> Une fois configuré, vos utilisateurs pourront se connecter
            en 1 clic avec Google, LinkedIn ou GitHub.
          </p>
        </div>

        {/* Dismiss button */}
        <button
          onClick={() => {
            const helper = document.querySelector('[data-auth0-helper]');
            if (helper) {
              helper.classList.add('animate-out', 'slide-out-to-bottom-5', 'fade-out');
              setTimeout(() => helper.remove(), 300);
            }
          }}
          className="mt-3 w-full rounded-lg bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-500/20"
        >
          Compris, je configurerai plus tard
        </button>
      </div>
    </div>
  );
}
