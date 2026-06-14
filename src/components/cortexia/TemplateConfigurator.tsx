/**
 * TEMPLATE CONFIGURATOR
 * Configure template variables before generation
 * BDS: Logique (cohérence), Rhétorique (clarté)
 */

import { useState } from 'react';
import { ArrowLeft, Sparkles, FileImage, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useSound } from '../../lib/hooks/useSound';
import { useHaptic } from '../../lib/hooks/useHaptic';
import type { CocoTemplate, TemplateVariable } from '../../lib/templates/coconut-templates';

interface TemplateConfiguratorProps {
  template: CocoTemplate;
  onBack: () => void;
  onSubmit: (variables: Record<string, string | string[]>) => void;
  isLoading?: boolean;
}

export function TemplateConfigurator({ template, onBack, onSubmit, isLoading }: TemplateConfiguratorProps) {
  const [variables, setVariables] = useState<Record<string, string | string[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { playClick, playSuccess } = useSound();
  const { medium } = useHaptic();

  // Handle text/select input
  const handleChange = (key: string, value: string) => {
    setVariables(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  // Handle image upload
  const handleImageUpload = async (key: string, file: File) => {
    try {
      // Convert to data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setVariables(prev => ({ ...prev, [key]: dataUrl }));
        if (errors[key]) {
          setErrors(prev => ({ ...prev, [key]: '' }));
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [key]: 'Failed to upload image'
      }));
    }
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    template.variables.forEach(variable => {
      if (variable.required && !variables[variable.key]) {
        newErrors[variable.key] = `${variable.label} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = () => {
    if (validate()) {
      playSuccess();
      medium();
      onSubmit(variables);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6">
      {/* Back button */}
      <button
        onClick={() => {
          playClick();
          onBack();
        }}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux templates
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4">
          <span className="text-2xl">{template.icon}</span>
          <span className="text-sm text-purple-300">Template</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-bold mb-3">
          {template.name}
        </h2>

        <p className="text-gray-400 text-lg">
          {template.description}
        </p>
      </div>

      {/* Template info */}
      <div className="mb-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-300">
            <p className="mb-2">Ce template générera <strong>{template.nodes.length} assets</strong></p>
            <p className="text-blue-400/70">
              Temps estimé: {template.estimatedTime} · Coût: {template.estimatedCost} crédits
            </p>
          </div>
        </div>
      </div>

      {/* Variables form */}
      <div className="space-y-6 mb-8">
        {template.variables.map((variable, index) => (
          <motion.div
            key={variable.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <label className="block">
              <span className="text-sm font-medium text-gray-300">
                {variable.label}
                {variable.required && <span className="text-red-400 ml-1">*</span>}
              </span>
            </label>

            {/* Text input */}
            {variable.type === 'text' && (
              <input
                type="text"
                value={(variables[variable.key] as string) || ''}
                onChange={(e) => handleChange(variable.key, e.target.value)}
                placeholder={variable.placeholder}
                className={`
                  w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500
                  focus:outline-none focus:border-purple-500/50 transition-colors
                  ${errors[variable.key] ? 'border-red-500/50' : 'border-white/10'}
                `}
              />
            )}

            {/* Select input */}
            {variable.type === 'select' && (
              <select
                value={(variables[variable.key] as string) || variable.default || ''}
                onChange={(e) => handleChange(variable.key, e.target.value)}
                className={`
                  w-full px-4 py-3 bg-white/5 border rounded-xl text-white
                  focus:outline-none focus:border-purple-500/50 transition-colors
                  ${errors[variable.key] ? 'border-red-500/50' : 'border-white/10'}
                `}
              >
                <option value="" disabled>Select {variable.label}</option>
                {variable.options?.map(option => (
                  <option key={option} value={option} className="bg-gray-900">
                    {option}
                  </option>
                ))}
              </select>
            )}

            {/* Image input */}
            {variable.type === 'image' && (
              <div>
                {!variables[variable.key] ? (
                  <label className={`
                    block w-full px-4 py-8 border-2 border-dashed rounded-xl
                    cursor-pointer hover:border-purple-500/50 transition-colors text-center
                    ${errors[variable.key] ? 'border-red-500/50' : 'border-white/10'}
                  `}>
                    <FileImage className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                    <p className="text-sm text-gray-400">
                      Cliquez pour uploader une image
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(variable.key, file);
                      }}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative">
                    <img
                      src={variables[variable.key] as string}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <button
                      onClick={() => handleChange(variable.key, '')}
                      className="absolute top-2 right-2 px-3 py-1 bg-red-500 hover:bg-red-600 rounded-lg text-sm text-white transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Error message */}
            {errors[variable.key] && (
              <p className="text-sm text-red-400 mt-1">
                {errors[variable.key]}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Preview nodes */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Assets à générer</h3>
        
        <div className="space-y-2">
          {template.nodes.map((node, index) => (
            <div
              key={index}
              className="p-3 bg-white/5 border border-white/10 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-white">
                    {node.title}
                  </span>
                  <span className="ml-2 text-xs text-gray-500">
                    {node.type} · {node.model}
                  </span>
                </div>
                <div className="text-xs text-purple-400">
                  Level {node.level}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl font-medium text-white shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2"
      >
        <Sparkles className="w-5 h-5" />
        Créer avec ce template
      </button>
    </div>
  );
}