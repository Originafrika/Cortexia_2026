// ============================================
// COCONUT V14 - COLOR PALETTE DISPLAY
// ============================================
// Affiche et permet d'éditer la palette de couleurs

import { useState } from 'react';
import { Palette, Pencil, Check, X, Plus, Trash2 } from 'lucide-react';

interface ColorPaletteDisplayProps {
  primary: string[];
  accent: string[];
  background: string[];
  text: string[];
  rationale: string;
  editable: boolean;
  onEdit?: (field: 'primary' | 'accent' | 'background' | 'text' | 'rationale', value: string[] | string) => Promise<void>;
  saving?: boolean;
}

export function ColorPaletteDisplay({
  primary,
  accent,
  background,
  text,
  rationale,
  editable,
  onEdit,
  saving = false,
}: ColorPaletteDisplayProps) {
  const [editing, setEditing] = useState<'primary' | 'accent' | 'background' | 'text' | 'rationale' | null>(null);
  const [editColors, setEditColors] = useState<string[]>([]);
  const [editText, setEditText] = useState('');

  const handleEditColors = (field: 'primary' | 'accent' | 'background' | 'text', currentColors: string[]) => {
    setEditing(field);
    setEditColors([...currentColors]);
  };

  const handleEditRationale = () => {
    setEditing('rationale');
    setEditText(rationale);
  };

  const handleSave = async () => {
    if (editing && onEdit) {
      try {
        if (editing === 'rationale') {
          await onEdit(editing, editText);
        } else {
          await onEdit(editing, editColors);
        }
        setEditing(null);
      } catch (error) {
        console.error('Failed to save edit:', error);
      }
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setEditColors([]);
    setEditText('');
  };

  const addColor = () => {
    setEditColors([...editColors, '#000000']);
  };

  const removeColor = (index: number) => {
    setEditColors(editColors.filter((_, i) => i !== index));
  };

  const updateColor = (index: number, value: string) => {
    const updated = [...editColors];
    updated[index] = value;
    setEditColors(updated);
  };

  const renderColorGroup = (
    label: string,
    colors: string[],
    field: 'primary' | 'accent' | 'background' | 'text'
  ) => (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {editable && editing !== field && (
          <button
            onClick={() => handleEditColors(field, colors)}
            className="text-gray-400 hover:text-purple-600 transition-colors"
            disabled={saving}
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>

      {editing === field ? (
        <div className="space-y-3">
          {editColors.map((color, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-lg border-2 border-gray-200 shadow-sm"
                style={{ backgroundColor: color }}
              />
              <input
                type="text"
                value={color}
                onChange={(e) => updateColor(idx, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm font-mono"
                placeholder="#000000"
              />
              <input
                type="color"
                value={color}
                onChange={(e) => updateColor(idx, e.target.value)}
                className="w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer"
              />
              <button
                onClick={() => removeColor(idx)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          <button
            onClick={addColor}
            className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-purple-400 hover:text-purple-600 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Ajouter couleur
          </button>

          <div className="flex gap-2 pt-2">
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
        <div className="flex flex-wrap gap-2">
          {colors.map((color, idx) => (
            <div key={idx} className="group relative">
              <div
                className="w-12 h-12 rounded-lg border-2 border-gray-200 shadow-sm transition-transform group-hover:scale-110"
                style={{ backgroundColor: color }}
              />
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs font-mono text-gray-500 whitespace-nowrap">{color}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
          <Palette className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Palette de Couleurs</h3>
          <p className="text-sm text-gray-500">Harmonies chromatiques du projet</p>
        </div>
      </div>

      {/* Color Groups */}
      <div className="space-y-6">
        {renderColorGroup('Couleurs Primaires', primary, 'primary')}
        {renderColorGroup('Couleurs Accent', accent, 'accent')}
        {renderColorGroup('Couleurs Background', background, 'background')}
        {renderColorGroup('Couleurs Texte', text, 'text')}
      </div>

      {/* Rationale */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">Rationale</label>
          {editable && editing !== 'rationale' && (
            <button
              onClick={handleEditRationale}
              className="text-gray-400 hover:text-purple-600 transition-colors"
              disabled={saving}
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
        </div>

        {editing === 'rationale' ? (
          <div className="space-y-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
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
          <p className="text-sm text-gray-600 leading-relaxed italic">{rationale}</p>
        )}
      </div>
    </div>
  );
}
