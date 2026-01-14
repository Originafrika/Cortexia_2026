/**
 * COCONUT V14 - MONACO PROMPT EDITOR
 * 
 * ✅ FIXED: BDS Compliance Phase 2B
 * - Design tokens integration
 * - Consistent spacing and radius
 * - Icon sizing standardized
 * - Focus states
 * - French labels
 */

import React, { useRef, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { useSoundContext } from './SoundProvider'; // 🔊 PHASE 2A: Import sound
import { fluxPromptSchema, defaultFluxPrompt, fluxPromptSuggestions } from '../../lib/schemas/flux-prompt-schema';
import { Check, AlertCircle, Maximize2, Minimize2, RotateCcw } from 'lucide-react';
import { tokens } from '../../lib/design/tokens';

interface PromptEditorProps {
  value: any;
  onChange: (value: any) => void;
  onValidate?: (isValid: boolean, errors: string[]) => void;
  readOnly?: boolean;
  height?: string;
}

export function PromptEditor({ 
  value, 
  onChange, 
  onValidate,
  readOnly = false,
  height = '600px'
}: PromptEditorProps) {
  // 🔊 PHASE 2A: Sound context
  const { playClick, playSuccess } = useSoundContext();
  
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [isValid, setIsValid] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editorValue, setEditorValue] = useState(() => 
    JSON.stringify(value || defaultFluxPrompt, null, 2)
  );

  // Handle editor mount
  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: any) => {
    editorRef.current = editor;

    // Configure JSON defaults with schema
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [{
        uri: 'https://coconut-v14.com/schemas/flux-prompt.json',
        fileMatch: ['*'],
        schema: fluxPromptSchema
      }]
    });

    // Add custom completion provider
    monaco.languages.registerCompletionItemProvider('json', {
      provideCompletionItems: (model: any, position: any) => {
        const suggestions: any[] = [];
        
        // Get current word
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        // Add suggestions for style.primary
        if (model.getLineContent(position.lineNumber).includes('"primary"')) {
          fluxPromptSuggestions.styles.forEach(style => {
            suggestions.push({
              label: style,
              kind: monaco.languages.CompletionItemKind.Value,
              insertText: `"${style}"`,
              range,
              documentation: `Visual style: ${style}`
            });
          });
        }

        // Add suggestions for style.mood
        if (model.getLineContent(position.lineNumber).includes('"mood"')) {
          fluxPromptSuggestions.moods.forEach(mood => {
            suggestions.push({
              label: mood,
              kind: monaco.languages.CompletionItemKind.Value,
              insertText: `"${mood}"`,
              range,
              documentation: `Mood: ${mood}`
            });
          });
        }

        // Add suggestions for position
        if (model.getLineContent(position.lineNumber).includes('"position"')) {
          fluxPromptSuggestions.positions.forEach(pos => {
            suggestions.push({
              label: pos,
              kind: monaco.languages.CompletionItemKind.Value,
              insertText: `"${pos}"`,
              range,
              documentation: `Position: ${pos}`
            });
          });
        }

        // Add suggestions for lighting.type
        if (model.getLineContent(position.lineNumber).includes('"type"')) {
          fluxPromptSuggestions.lightingTypes.forEach(type => {
            suggestions.push({
              label: type,
              kind: monaco.languages.CompletionItemKind.Value,
              insertText: `"${type}"`,
              range,
              documentation: `Lighting: ${type}`
            });
          });
        }

        return { suggestions };
      }
    });

    // Focus editor
    editor.focus();
  };

  // Handle editor change
  const handleEditorChange = (value: string | undefined) => {
    if (!value) return;
    
    setEditorValue(value);

    try {
      const parsed = JSON.parse(value);
      
      // Validate against schema
      const errors = validatePrompt(parsed);
      
      setIsValid(errors.length === 0);
      setValidationErrors(errors);
      
      if (errors.length === 0) {
        onChange(parsed);
      }
      
      onValidate?.(errors.length === 0, errors);
    } catch (err) {
      setIsValid(false);
      const errorMessage = err instanceof Error ? err.message : 'Invalid JSON';
      setValidationErrors([errorMessage]);
      onValidate?.(false, [errorMessage]);
    }
  };

  // Validate prompt against schema
  const validatePrompt = (prompt: any): string[] => {
    const errors: string[] = [];

    // Required fields
    if (!prompt.scene) {
      errors.push('Missing required field: scene');
    } else if (prompt.scene.length < 10) {
      errors.push('Scene description too short (min 10 characters)');
    }

    if (!prompt.style?.primary) {
      errors.push('Missing required field: style.primary');
    }

    if (!prompt.subjects || prompt.subjects.length === 0) {
      errors.push('At least one subject is required');
    }

    // Validation rules
    if (prompt.subjects?.length > 5) {
      errors.push('Maximum 5 subjects allowed');
    }

    if (prompt.style?.secondary?.length > 3) {
      errors.push('Maximum 3 secondary styles allowed');
    }

    return errors;
  };

  // Format JSON
  const handleFormat = () => {
    if (!editorRef.current) return;
    
    try {
      const parsed = JSON.parse(editorValue);
      const formatted = JSON.stringify(parsed, null, 2);
      setEditorValue(formatted);
      editorRef.current.setValue(formatted);
    } catch (err) {
      console.error('Format error:', err);
    }
  };

  // Reset to default
  const handleReset = () => {
    const defaultValue = JSON.stringify(defaultFluxPrompt, null, 2);
    setEditorValue(defaultValue);
    if (editorRef.current) {
      editorRef.current.setValue(defaultValue);
    }
    onChange(defaultFluxPrompt);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-900' : ''}`}>
      {/* Toolbar */}
      <div className={`bg-slate-800 border-b border-slate-700 px-4 py-2 flex items-center justify-between ${tokens.gap.normal}`}>
        <div className={`flex items-center ${tokens.gap.normal}`}>
          {/* Validation Status */}
          <div className={`flex items-center ${tokens.gap.tight}`}>
            {isValid ? (
              <>
                <Check className={`${tokens.iconSize.sm} text-[var(--coconut-husk)]`} />
                <span className="text-sm text-[var(--coconut-husk)]">Valide</span>
              </>
            ) : (
              <>
                <AlertCircle className={`${tokens.iconSize.sm} text-[var(--coconut-shell)]`} />
                <span className="text-sm text-[var(--coconut-shell)]">
                  {validationErrors.length} erreur{validationErrors.length !== 1 ? 's' : ''}
                </span>
              </>
            )}
          </div>

          {/* Errors dropdown */}
          {!isValid && validationErrors.length > 0 && (
            <div className={`bg-[var(--coconut-shell)]/50 ${tokens.radius.md} px-3 py-1.5 max-w-md`}>
              <div className="text-xs text-[var(--coconut-milk)] space-y-1">
                {validationErrors.slice(0, 3).map((error, idx) => (
                  <div key={idx}>• {error}</div>
                ))}
                {validationErrors.length > 3 && (
                  <div className="text-[var(--coconut-cream)]">
                    +{validationErrors.length - 3} erreurs supplémentaires
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={`flex items-center ${tokens.gap.tight}`}>
          <button
            onClick={() => {
              playClick(); // 🔊 Sound feedback
              handleFormat();
            }}
            className={`px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm ${tokens.radius.md} transition-colors ${tokens.focus}`}
            aria-label="Formater le JSON"
          >
            Formater
          </button>
          
          <button
            onClick={() => {
              playClick(); // 🔊 Sound feedback
              handleReset();
            }}
            className={`flex items-center ${tokens.gap.tight} px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm ${tokens.radius.md} transition-colors ${tokens.focus}`}
            aria-label="Réinitialiser"
          >
            <RotateCcw className={tokens.iconSize.sm} />
            <span>Réinitialiser</span>
          </button>

          <button
            onClick={() => {
              playClick(); // 🔊 Sound feedback
              toggleFullscreen();
            }}
            className={`flex items-center ${tokens.gap.tight} px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm ${tokens.radius.md} transition-colors ${tokens.focus}`}
            aria-label={isFullscreen ? 'Quitter plein écran' : 'Plein écran'}
          >
            {isFullscreen ? (
              <Minimize2 className={tokens.iconSize.sm} />
            ) : (
              <Maximize2 className={tokens.iconSize.sm} />
            )}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div style={{ height: isFullscreen ? 'calc(100vh - 48px)' : height }}>
        <Editor
          defaultLanguage="json"
          value={editorValue}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            readOnly,
            minimap: { enabled: !isFullscreen },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            formatOnPaste: true,
            formatOnType: true,
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            wordWrap: 'on',
            wrappingIndent: 'indent',
            folding: true,
            foldingStrategy: 'indentation',
            showFoldingControls: 'always',
            matchBrackets: 'always',
            autoClosingBrackets: 'always',
            autoClosingQuotes: 'always',
            bracketPairColorization: {
              enabled: true
            }
          }}
        />
      </div>

      {/* Hints */}
      {!isFullscreen && (
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-2">
          <div className="text-xs text-slate-600 space-y-1">
            <div>💡 <strong>Ctrl+Space</strong> pour les suggestions d'auto-complétion</div>
            <div>💡 <strong>Ctrl+Shift+F</strong> pour formater automatiquement</div>
            <div>💡 Passez la souris sur les champs pour la documentation</div>
          </div>
        </div>
      )}
    </div>
  );
}