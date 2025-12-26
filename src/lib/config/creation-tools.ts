/**
 * CREATION TOOLS CONFIGURATION
 * Configuration des outils disponibles dans le hub
 */

import { Wand2, Image as ImageIcon, Film, Sparkles, Maximize2, Scissors, Palette, Zap, Copy, Layers } from 'lucide-react';
import type { ToolDefinition } from '../types/creation-tools';

// Credit costs per tool type
export const CREDIT_COSTS = {
  'text-to-image': 3,
  'image-to-image': 4,
  'batch-generation': 2, // per image
  'image-to-video': 10,
  'video-to-video': 15,
  'prompt-enhancer': 1,
  'style-transfer': 5,
  'upscale-2x': 5,
  'upscale-4x': 8,
  'upscale-8x': 12,
  'background-removal': 2,
  'coconut': 20, // minimum
} as const;

// Pro-only tools
export const PRO_ONLY_TOOLS = [
  'image-to-video',
  'video-to-video',
  'upscale-4x',
  'upscale-8x',
  'style-transfer',
  'coconut',
] as const;

// Best API/Model routing per tool
export const API_ROUTING = {
  'text-to-image': {
    primary: { api: 'replicate', model: 'black-forest-labs/flux-pro' },
    fallback: { api: 'together', model: 'black-forest-labs/FLUX.1-schnell' },
    speed: '~6s',
  },
  'image-to-image': {
    primary: { api: 'replicate', model: 'black-forest-labs/flux-pro' },
    fallback: { api: 'together', model: 'black-forest-labs/FLUX.1-schnell' },
    speed: '~7s',
  },
  'batch-generation': {
    primary: { api: 'together', model: 'black-forest-labs/FLUX.1-schnell-Free' },
    fallback: { api: 'pollinations', model: 'flux' },
    speed: '~4s per image',
  },
  'image-to-video': {
    primary: { api: 'replicate', model: 'google/veo-3.1-fast' },
    fallback: null,
    speed: '~15s',
  },
  'video-to-video': {
    primary: { api: 'replicate', model: 'stability-ai/stable-video-diffusion' },
    fallback: null,
    speed: '~25s',
  },
  'prompt-enhancer': {
    primary: { api: 'together', model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo' },
    fallback: null,
    speed: '~2s',
  },
  'style-transfer': {
    primary: { api: 'replicate', model: 'cjwbw/style-transfer' },
    fallback: null,
    speed: '~8s',
  },
  'upscale-2x': {
    primary: { api: 'replicate', model: 'nightmareai/real-esrgan' },
    fallback: null,
    speed: '~8s',
  },
  'upscale-4x': {
    primary: { api: 'replicate', model: 'nightmareai/real-esrgan' },
    fallback: null,
    speed: '~12s',
  },
  'upscale-8x': {
    primary: { api: 'replicate', model: 'nightmareai/real-esrgan' },
    fallback: null,
    speed: '~18s',
  },
  'background-removal': {
    primary: { api: 'replicate', model: 'cjwbw/rembg' },
    fallback: null,
    speed: '~3s',
  },
  'coconut': {
    primary: { api: 'replicate', model: 'multi-model' },
    fallback: null,
    speed: 'Variable',
  },
} as const;

export const CREATION_TOOLS: ToolDefinition[] = [
  // IMAGE GENERATION
  {
    id: 'text-to-image',
    name: 'Text to Image',
    description: 'Générez des images à partir de descriptions textuelles',
    icon: 'Wand2',
    category: 'image',
    provider: 'replicate', // Auto-selected (best model)
    estimatedTime: API_ROUTING['text-to-image'].speed,
    isPro: false,
  },
  {
    id: 'image-to-image',
    name: 'Image to Image',
    description: 'Transformez vos images avec des prompts',
    icon: 'ImageIcon',
    category: 'image',
    provider: 'replicate',
    estimatedTime: API_ROUTING['image-to-image'].speed,
    isPro: false,
  },
  {
    id: 'batch-generation',
    name: 'Batch Generator',
    description: 'Générez jusqu\'à 3 images simultanément (Pro: 50 max)',
    icon: 'Copy',
    category: 'image',
    provider: 'together',
    estimatedTime: API_ROUTING['batch-generation'].speed,
    isPro: false, // Free: max 3, Pro: max 50
  },
  
  // VIDEO GENERATION (PRO ONLY)
  {
    id: 'image-to-video',
    name: 'Image to Video',
    description: 'Animez vos images en vidéos cinématiques',
    icon: 'Film',
    category: 'video',
    provider: 'replicate',
    estimatedTime: API_ROUTING['image-to-video'].speed,
    isPro: true,
  },
  {
    id: 'video-to-video',
    name: 'Video to Video',
    description: 'Transformez vos vidéos avec l\'IA',
    icon: 'Film',
    category: 'video',
    provider: 'replicate',
    estimatedTime: API_ROUTING['video-to-video'].speed,
    isPro: true,
  },
  
  // AI TOOLS
  {
    id: 'prompt-enhancer',
    name: 'Prompt Enhancer',
    description: 'Améliorez vos prompts automatiquement',
    icon: 'Sparkles',
    category: 'ai-tools',
    provider: 'together',
    estimatedTime: API_ROUTING['prompt-enhancer'].speed,
    isPro: false,
  },
  {
    id: 'style-transfer',
    name: 'Style Transfer',
    description: 'Appliquez le style d\'une image à une autre',
    icon: 'Palette',
    category: 'ai-tools',
    provider: 'replicate',
    estimatedTime: API_ROUTING['style-transfer'].speed,
    isPro: true,
  },
  
  // UTILITIES
  {
    id: 'upscale',
    name: 'Image Upscale',
    description: 'Augmentez la résolution (2x gratuit, 4x/8x Pro)',
    icon: 'Maximize2',
    category: 'utilities',
    provider: 'replicate',
    estimatedTime: '~8-18s',
    isPro: false, // 2x free, 4x/8x pro
  },
  {
    id: 'background-removal',
    name: 'Background Removal',
    description: 'Supprimez l\'arrière-plan automatiquement',
    icon: 'Scissors',
    category: 'utilities',
    provider: 'replicate',
    estimatedTime: API_ROUTING['background-removal'].speed,
    isPro: false,
  },
  
  // COCONUT (PRO ONLY)
  {
    id: 'coconut',
    name: 'Coconut Creator',
    description: 'Orchestration multimodale complète',
    icon: 'Layers',
    category: 'coconut',
    provider: 'replicate',
    estimatedTime: API_ROUTING['coconut'].speed,
    isPro: true,
  },
];

export const TOOL_CATEGORIES = [
  {
    id: 'image' as const,
    name: 'Image Generation',
    description: 'Créez et transformez des images',
    icon: 'ImageIcon',
  },
  {
    id: 'video' as const,
    name: 'Video Generation',
    description: 'Créez et animez des vidéos',
    icon: 'Film',
  },
  {
    id: 'ai-tools' as const,
    name: 'AI Tools',
    description: 'Outils intelligents assistés par l\'IA',
    icon: 'Sparkles',
  },
  {
    id: 'utilities' as const,
    name: 'Utilities',
    description: 'Outils d\'édition et optimisation',
    icon: 'Zap',
  },
  {
    id: 'coconut' as const,
    name: 'Coconut',
    description: 'Orchestration multimodale avancée',
    icon: 'Layers',
  },
];

export const PRESET_DIMENSIONS = {
  square: { width: 1024, height: 1024, label: 'Square (1:1)' },
  landscape: { width: 1344, height: 768, label: 'Landscape (16:9)' },
  portrait: { width: 768, height: 1344, label: 'Portrait (9:16)' },
  ultrawide: { width: 1536, height: 640, label: 'Ultra Wide (21:9)' },
};

export const PRESET_STYLES = [
  { id: 'realistic', name: 'Realistic', description: 'Photo-realistic style' },
  { id: 'artistic', name: 'Artistic', description: 'Artistic and creative' },
  { id: 'cinematic', name: 'Cinematic', description: 'Movie-like quality' },
  { id: 'anime', name: 'Anime', description: 'Japanese animation style' },
  { id: 'digital-art', name: 'Digital Art', description: 'Modern digital art' },
  { id: '3d-render', name: '3D Render', description: 'CGI style render' },
];