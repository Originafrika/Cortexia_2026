// /lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '@/utils/supabase/info';

// Initialize Supabase client
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseAnonKey = publicAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Type-safe database access
export type Database = {
  public: {
    Tables: {
      cocoboards: {
        Row: CocoBoard;
        Insert: CocoBoard;
        Update: Partial<CocoBoard>;
      };
      nodes: {
        Row: CocoNode;
        Insert: CocoNode;
        Update: Partial<CocoNode>;
      };
      jobs: {
        Row: Job;
        Insert: Job;
        Update: Partial<Job>;
      };
    };
  };
};

// Database types (matching KV store structure)
export interface CocoBoard {
  id: string;
  user_id: string;
  title: string;
  vision: string;
  output_type: 'image' | 'video' | 'campaign';
  mode: 'auto' | 'semi-auto' | 'manual';
  status: 'reasoning' | 'generating' | 'complete' | 'error';
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface CocoNode {
  id: string;
  cocoboard_id: string;
  parent_id?: string;
  title: string;
  type: 'campaign' | 'video' | 'image' | 'shot' | 'storyboard';
  status: 'pending' | 'generating' | 'done' | 'error' | 'cancelled';
  prompt: string;
  negative_prompt?: string;
  model?: string;
  thumbnail?: string;
  result_url?: string;
  duration?: number;
  seed?: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  cocoboard_id: string;
  node_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  provider: 'replicate' | 'together';
  model: string;
  prediction_id?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
}
