/**
 * COCONUT V14 - COCOBOARD STORE
 * Phase 3 - Jour 3: Zustand store for CocoBoard state management
 * ✅ FIX 1.2: Extended to include Gemini analysis (single source of truth)
 */

import { create } from 'zustand';
import type { CocoBoard } from '../types/coconut-v14';

// ✅ FIX 1.2: Add GeminiAnalysisResponse type
interface GeminiAnalysisResponse {
  analysis: any;
  cocoBoardId: string;
  createdAt: string;
  [key: string]: any;
}

interface CocoBoardState {
  // Current CocoBoard
  currentBoard: CocoBoard | null;
  
  // ✅ FIX 1.2: Add Gemini analysis data
  geminiAnalysis: GeminiAnalysisResponse | null;
  uploadedReferences: {
    images: Array<{ url: string; description?: string; filename: string }>;
    videos: Array<{ url: string; description?: string; filename: string }>;
  } | null;
  
  // UI State
  isLoading: boolean;
  isSaving: boolean;
  isGenerating: boolean;
  error: string | null;
  
  // Edit state
  isDirty: boolean;
  lastSaved: Date | null;
  
  // Generation state
  generationJobId: string | null;
  generationProgress: number;
  generationStatus: string | null;
  
  // Actions
  setCurrentBoard: (board: CocoBoard | null) => void;
  
  // ✅ FIX 1.2: Add Gemini data actions
  setGeminiAnalysis: (analysis: GeminiAnalysisResponse | null) => void;
  setUploadedReferences: (refs: any) => void;
  
  updateBoard: (updates: Partial<CocoBoard>) => void;
  updatePrompt: (prompt: any) => void;
  updateSpecs: (specs: any) => void;
  addReference: (reference: any) => void;
  removeReference: (referenceId: string) => void;
  
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setGenerating: (generating: boolean) => void;
  setError: (error: string | null) => void;
  
  markDirty: () => void;
  markSaved: () => void;
  
  setGenerationJob: (jobId: string | null) => void;
  updateGenerationProgress: (progress: number, status: string) => void;
  
  reset: () => void;
}

const initialState = {
  currentBoard: null,
  geminiAnalysis: null,
  uploadedReferences: null,
  isLoading: false,
  isSaving: false,
  isGenerating: false,
  error: null,
  isDirty: false,
  lastSaved: null,
  generationJobId: null,
  generationProgress: 0,
  generationStatus: null,
};

export const useCocoBoardStore = create<CocoBoardState>((set) => ({
  ...initialState,
  
  setCurrentBoard: (board) => set({ 
    currentBoard: board,
    isDirty: false,
    lastSaved: board ? new Date() : null
  }),
  
  // ✅ FIX 1.2: Add Gemini data actions
  setGeminiAnalysis: (analysis) => set({ geminiAnalysis: analysis }),
  setUploadedReferences: (refs) => set({ uploadedReferences: refs }),
  
  updateBoard: (updates) => set((state) => ({
    currentBoard: state.currentBoard 
      ? { ...state.currentBoard, ...updates }
      : null,
    isDirty: true
  })),
  
  updatePrompt: (prompt) => set((state) => ({
    currentBoard: state.currentBoard
      ? { ...state.currentBoard, finalPrompt: prompt }
      : null,
    isDirty: true
  })),
  
  updateSpecs: (specs) => set((state) => ({
    currentBoard: state.currentBoard
      ? { ...state.currentBoard, specs }
      : null,
    isDirty: true
  })),
  
  addReference: (reference) => set((state) => {
    if (!state.currentBoard) return state;
    
    return {
      currentBoard: {
        ...state.currentBoard,
        references: [...state.currentBoard.references, reference]
      },
      isDirty: true
    };
  }),
  
  removeReference: (referenceId) => set((state) => {
    if (!state.currentBoard) return state;
    
    return {
      currentBoard: {
        ...state.currentBoard,
        references: state.currentBoard.references.filter(r => r.id !== referenceId)
      },
      isDirty: true
    };
  }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  setSaving: (saving) => set({ isSaving: saving }),
  setGenerating: (generating) => set({ isGenerating: generating }),
  setError: (error) => set({ error }),
  
  markDirty: () => set({ isDirty: true }),
  markSaved: () => set({ isDirty: false, lastSaved: new Date() }),
  
  setGenerationJob: (jobId) => set({ 
    generationJobId: jobId,
    generationProgress: 0,
    generationStatus: jobId ? 'pending' : null
  }),
  
  updateGenerationProgress: (progress, status) => set({ 
    generationProgress: progress,
    generationStatus: status
  }),
  
  reset: () => set(initialState),
}));