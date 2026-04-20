// CocoboardModify — Modification input with cost display
// Allows users to request changes to their Cocoboard with transparent pricing

import { useState } from 'react';
import { Send, Loader2, AlertCircle, CheckCircle2, X } from 'lucide-react';

interface CocoboardModifyProps {
  mode: 'image' | 'video' | 'campaign';
  modificationCost: number;
  userCredits: number;
  onModify: (modification: string) => Promise<void>;
  disabled?: boolean;
}

const MODIFICATION_COSTS = {
  image: 5,
  video: 10,
  campaign: 30,
};

const MODE_LABELS = {
  image: 'Image',
  video: 'Vidéo',
  campaign: 'Campagne',
};

export function CocoboardModify({
  mode,
  modificationCost,
  userCredits,
  onModify,
  disabled = false,
}: CocoboardModifyProps) {
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const cost = modificationCost || MODIFICATION_COSTS[mode];
  const canAfford = userCredits >= cost;
  const hasInput = input.trim().length >= 10;

  const handleSubmit = async () => {
    if (!hasInput || !canAfford || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      await onModify(input.trim());
      setSuccess(true);
      setInput('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Modification failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-slate-700">Modifier le Cocoboard</h4>
          <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-full">
            {MODE_LABELS[mode]}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Coût:</span>
          <span className={`font-semibold ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
            {cost} crédits
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-500">Solde:</span>
          <span className="font-medium text-slate-700">{userCredits}</span>
        </div>
      </div>

      {/* Input area */}
      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError(null);
            setSuccess(false);
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            mode === 'image'
              ? "Ex: Change le fond en coucher de soleil, ajoute le logo en haut à droite..."
              : mode === 'video'
              ? "Ex: Rends le premier shot plus dynamique, change la musique en jazz..."
              : "Ex: Ajoute 2 posts TikTok cette semaine, change le ton en plus humoristique..."
          }
          rows={3}
          className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 placeholder:text-slate-400"
          disabled={disabled || isSubmitting}
        />
        <div className="absolute bottom-2 right-2 text-[10px] text-slate-400">
          {input.length}/500
        </div>
      </div>

      {/* Validation hint */}
      {input.length > 0 && input.length < 10 && (
        <p className="text-xs text-amber-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Minimum 10 caractères requis
        </p>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-lg p-2">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 rounded-lg p-2">
          <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
          Cocoboard modifié avec succès!
        </div>
      )}

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={!hasInput || !canAfford || isSubmitting || disabled}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm rounded-lg
          hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Modification en cours...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Modifier ({cost} crédits)
          </>
        )}
      </button>

      {/* Insufficient credits */}
      {!canAfford && (
        <p className="text-xs text-center text-red-500">
          Crédits insuffisants. Il vous faut {cost} crédits.
        </p>
      )}
    </div>
  );
}

export default CocoboardModify;
