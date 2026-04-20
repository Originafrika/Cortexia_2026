// LLM Response Adapter — Maps LLM output to GeminiAnalysisResponse format
// 
// The LLM can return two formats:
// 1. New Coconut format: { title, description, complexity, steps: [{id, type, model, prompt, ...}] }
// 2. Old format: { finalPrompt, creativeDirections, suggestedFormats, suggestedResolutions, ... }
//
// This adapter normalizes both into the UI-expected GeminiAnalysisResponse format.

import type { GeminiAnalysisResponse } from '../types/gemini';

export interface LLMAnalysisResult {
  success: boolean;
  data: GeminiAnalysisResponse;
}

export interface AdapterInput {
  parsedContent: Record<string, any>;
  intentDescription: string;
}

/**
 * Adapt any LLM response into the GeminiAnalysisResponse format expected by the UI.
 */
export function adaptLLMResponse(input: AdapterInput): LLMAnalysisResult {
  const { parsedContent, intentDescription } = input;
  
  const isCoconutFormat = parsedContent.steps && Array.isArray(parsedContent.steps);
  
  let finalPrompt: string;
  let creativeDirections: Array<{ title: string; description: string }>;
  let suggestedFormats: string[];
  let suggestedResolutions: string[];
  let missingAssets: string[];
  let estimatedCredits: number;
  let projectTitle: string;
  let concept: { direction: string; mainConcept: string; visualStyle: string; targetEmotion: string; keyMessage: string };
  let colorPalette: { primary: string[]; accent: string[]; background: string[]; text: string[]; rationale: string };
  let technicalSpecs: { format: string; resolution: string; style: string };
  let estimatedCost: { analysis: number; finalGeneration: number; total: number; credits: number };
  let assetsRequired: { missing: Array<{ id: string; type: string; description: string; canBeGenerated: boolean }>; canGenerate: boolean };
  let recommendations: { generationApproach: string; style: string; mood: string };

  if (isCoconutFormat) {
    // New Coconut format — adapt to old UI format
    finalPrompt = parsedContent.steps
      .filter((s: any) => s.prompt)
      .map((s: any) => s.prompt)
      .join('\n\n---\n\n') || parsedContent.description || intentDescription;
    
    projectTitle = parsedContent.title || 'Coconut Project';
    
    const desc = parsedContent.description || intentDescription;
    concept = {
      direction: parsedContent.title || 'AI-generated direction',
      mainConcept: desc.substring(0, 200),
      visualStyle: parsedContent.complexity || 'medium',
      targetEmotion: parsedContent.targetAudience || 'General audience',
      keyMessage: desc.substring(0, 100),
    };
    
    colorPalette = {
      primary: ['#2C3E50', '#34495E'],
      accent: ['#95A5A6', '#ECF0F1'],
      background: ['#FFFFFF', '#F5F5F0'],
      text: ['#000000', '#666666'],
      rationale: 'Auto-generated from analysis',
    };
    
    creativeDirections = [
      { title: parsedContent.title || 'Direction 1', description: desc },
      { title: 'Complexity', description: parsedContent.complexity || 'medium' },
      { title: `${parsedContent.steps.length} steps`, description: parsedContent.targetAudience || '' },
    ];
    
    const ratios = new Set<string>();
    const resolutions = new Set<string>();
    for (const step of parsedContent.steps) {
      if (step.aspectRatio) ratios.add(step.aspectRatio);
      if (step.resolution) resolutions.add(step.resolution);
    }
    suggestedFormats = ratios.size > 0 ? Array.from(ratios) : ['9:16', '1:1'];
    suggestedResolutions = resolutions.size > 0 ? Array.from(resolutions) : ['1K', '2K'];
    
    const firstFormat = suggestedFormats[0] || '9:16';
    const firstRes = suggestedResolutions[0] || '1K';
    
    technicalSpecs = {
      format: firstFormat,
      resolution: firstRes === '1K' ? '1024x1024' : firstRes === '2K' ? '2048x2048' : '1080x1920',
      style: 'photorealistic',
    };
    
    missingAssets = parsedContent.missingAssets || [];
    estimatedCredits = parsedContent.steps.reduce((sum: number, s: any) => sum + (s.creditsEstimated || 0), 0);
    if (estimatedCredits === 0) estimatedCredits = 100;
    
    assetsRequired = {
      missing: missingAssets.map((m: string, i: number) => ({
        id: `missing_${i}`,
        type: 'element',
        description: m,
        canBeGenerated: true,
      })),
      canGenerate: true,
    };
    
    estimatedCost = {
      analysis: 50,
      finalGeneration: estimatedCredits,
      total: 50 + estimatedCredits,
      credits: 50 + estimatedCredits,
    };
    
    recommendations = {
      generationApproach: 'coconut-pipeline',
      style: 'Professional',
      mood: 'Dynamic',
    };
  } else {
    // Old format — use as-is with defaults for missing fields
    finalPrompt = parsedContent.finalPrompt || intentDescription;
    projectTitle = parsedContent.projectTitle || 'Coconut Project';
    
    concept = parsedContent.concept || {
      direction: parsedContent.creativeDirections?.[0]?.title || 'Direction 1',
      mainConcept: intentDescription.substring(0, 200),
      visualStyle: 'minimal',
      targetEmotion: 'neutral',
      keyMessage: intentDescription.substring(0, 100),
    };
    
    colorPalette = parsedContent.colorPalette || {
      primary: ['#2C3E50', '#34495E'],
      accent: ['#95A5A6', '#ECF0F1'],
      background: ['#FFFFFF', '#F5F5F0'],
      text: ['#000000', '#666666'],
      rationale: 'Default palette',
    };
    
    creativeDirections = parsedContent.creativeDirections || [
      { title: 'Direction 1', description: 'Generated by LLM' },
      { title: 'Direction 2', description: 'Generated by LLM' },
      { title: 'Direction 3', description: 'Generated by LLM' }
    ];
    suggestedFormats = parsedContent.suggestedFormats || ['9:16', '1:1'];
    suggestedResolutions = parsedContent.suggestedResolutions || ['1080x1920'];
    missingAssets = parsedContent.missingAssets || [];
    estimatedCredits = 100;
    
    technicalSpecs = parsedContent.technicalSpecs || {
      format: suggestedFormats[0] || '9:16',
      resolution: '1080x1920',
      style: 'photorealistic',
    };
    
    assetsRequired = parsedContent.assetsRequired || {
      missing: missingAssets.map((m: string, i: number) => ({
        id: `missing_${i}`,
        type: 'element',
        description: m,
        canBeGenerated: true,
      })),
      canGenerate: true,
    };
    
    const rawCost = parsedContent.estimatedCost;
    estimatedCost = {
      analysis: rawCost?.analysis || 50,
      finalGeneration: rawCost?.finalGeneration || rawCost?.credits || 100,
      total: rawCost?.total || (rawCost?.analysis || 50) + (rawCost?.finalGeneration || rawCost?.credits || 100),
      credits: rawCost?.credits || rawCost?.total || 150,
    };
    
    recommendations = parsedContent.recommendations || {
      generationApproach: 'AI-powered generation',
      style: 'Professional',
      mood: 'Dynamic',
    };
  }

  // Safety net: ensure all fields have valid values
  estimatedCost = {
    analysis: Number(estimatedCost?.analysis) || 50,
    finalGeneration: Number(estimatedCost?.finalGeneration) || estimatedCredits || 100,
    total: Number(estimatedCost?.total) || (Number(estimatedCost?.analysis) || 50) + (Number(estimatedCost?.finalGeneration) || estimatedCredits || 100),
    credits: Number(estimatedCost?.credits) || (Number(estimatedCost?.total) || 150),
  };

  if (!finalPrompt || finalPrompt.trim().length === 0) {
    finalPrompt = intentDescription;
  }
  if (!projectTitle || projectTitle.trim().length === 0) {
    projectTitle = 'Coconut Project';
  }
  if (!concept.mainConcept || concept.mainConcept.trim().length === 0) {
    concept.mainConcept = intentDescription.substring(0, 200);
  }

  return {
    success: true,
    data: {
      projectTitle,
      concept,
      colorPalette,
      technicalSpecs,
      estimatedCost,
      assetsRequired,
      recommendations,
      finalPrompt,
      creativeDirections,
      suggestedFormats,
      suggestedResolutions,
      missingAssets,
    }
  };
}

/**
 * Create a fallback analysis result when the LLM completely fails.
 */
export function createFallbackAnalysis(intentDescription: string): LLMAnalysisResult {
  return {
    success: true,
    data: {
      finalPrompt: intentDescription,
      creativeDirections: [
        { title: 'Direction 1', description: 'LLM fallback' },
        { title: 'Direction 2', description: 'LLM fallback' },
        { title: 'Direction 3', description: 'LLM fallback' }
      ],
      suggestedFormats: ['9:16', '1:1'],
      suggestedResolutions: ['1K', '2K'],
      missingAssets: [],
      estimatedCost: {
        analysis: 50,
        finalGeneration: 100,
        total: 150,
        credits: 150,
      },
      assetsRequired: {
        missing: [],
        canGenerate: true,
      },
      recommendations: {
        generationApproach: 'AI-powered generation',
        style: 'Professional',
        mood: 'Dynamic',
      },
      projectTitle: 'Coconut Project',
      concept: {
        direction: 'Fallback direction',
        mainConcept: intentDescription.substring(0, 200),
        visualStyle: 'minimal',
        targetEmotion: 'neutral',
        keyMessage: intentDescription.substring(0, 100),
      },
      colorPalette: {
        primary: ['#2C3E50', '#34495E'],
        accent: ['#95A5A6', '#ECF0F1'],
        background: ['#FFFFFF', '#F5F5F0'],
        text: ['#000000', '#666666'],
        rationale: 'Fallback',
      },
      technicalSpecs: {
        format: '9:16',
        resolution: '1080x1920',
        style: 'photorealistic',
      },
    }
  };
}
