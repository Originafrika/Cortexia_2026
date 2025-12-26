// ============================================
// COCONUT V14 - CONCEPT DISPLAY
// ============================================
// Affiche et permet d'éditer le concept créatif

import { useState } from 'react';
import { Pencil, Check, X, Sparkles } from 'lucide-react';

interface ConceptDisplayProps {
  direction: string;
  keyMessage: string;
  mood: string;
  editable: boolean;
  onEdit?: (field: 'direction' | 'keyMessage' | 'mood', value: string) => Promise<void>;
  saving?: boolean;
}

export function ConceptDisplay({
  direction,
  keyMessage,
  mood,
  editable,
  onEdit,
  saving = false,
}: ConceptDisplayProps) {
  const [editing, setEditing] = useState<'direction' | 'keyMessage' | 'mood' | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleEdit = (field: 'direction' | 'keyMessage' | 'mood', currentValue: string) => {
    setEditing(field);
    setEditValue(currentValue);
  };

  const handleSave = async () => {
    if (editing && onEdit) {
      try {
        await onEdit(editing, editValue);
        setEditing(null);
      } catch (error) {
        console.error('Failed to save edit:', error);
      }
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setEditValue('');
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Concept Créatif</h3>
          <p className="text-sm text-gray-500">Direction artistique et message clé</p>
        </div>
      </div>

      {/* Direction */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Direction Artistique</label>
          {editable && editing !== 'direction' && (
            <button
              onClick={() => handleEdit('direction', direction)}
              className="text-gray-400 hover:text-purple-600 transition-colors"
              disabled={saving}
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {editing === 'direction' ? (
          <div className="space-y-2">
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={4}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 text-sm"
              >
                <Check className="w-4 h-4" />
                Sauvegarder
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 flex items-center gap-2 text-sm"
              >
                <X className="w-4 h-4" />
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-900 leading-relaxed">{direction}</p>
        )}
      </div>

      {/* Key Message */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Message Clé</label>
          {editable && editing !== 'keyMessage' && (
            <button
              onClick={() => handleEdit('keyMessage', keyMessage)}
              className="text-gray-400 hover:text-purple-600 transition-colors"
              disabled={saving}
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {editing === 'keyMessage' ? (
          <div className="space-y-2">
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={3}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 text-sm"
              >
                <Check className="w-4 h-4" />
                Sauvegarder
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 flex items-center gap-2 text-sm"
              >
                <X className="w-4 h-4" />
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-900 leading-relaxed">{keyMessage}</p>
        )}
      </div>

      {/* Mood */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Mood / Ambiance</label>
          {editable && editing !== 'mood' && (
            <button
              onClick={() => handleEdit('mood', mood)}
              className="text-gray-400 hover:text-purple-600 transition-colors"
              disabled={saving}
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {editing === 'mood' ? (
          <div className="space-y-2">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 text-sm"
              >
                <Check className="w-4 h-4" />
                Sauvegarder
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 flex items-center gap-2 text-sm"
              >
                <X className="w-4 h-4" />
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg">
            <span className="text-sm font-medium">{mood}</span>
          </div>
        )}
      </div>
    </div>
  );
}
