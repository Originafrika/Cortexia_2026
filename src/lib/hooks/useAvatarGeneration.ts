/**
 * USE AVATAR GENERATION HOOK
 * Complete avatar generation logic with Kie AI InfiniteTalk
 */

import { useState, useCallback, useRef } from 'react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

interface AvatarStatusResponse {
  success: boolean;
  status: 'processing' | 'completed' | 'failed';
  videoUrls?: string[];
  error?: string;
  creditsUsed?: number;
}

interface UseAvatarGenerationOptions {
  onSuccess?: (videoUrl: string) => void;
  onError?: (error: string) => void;
  userId?: string;
}

export function useAvatarGeneration(options: UseAvatarGenerationOptions = {}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [avatarResult, setAvatarResult] = useState<AvatarStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0); // Elapsed time in seconds
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollCountRef = useRef(0);
  const maxPollAttempts = 144; // 144 × 5s = 12 minutes max

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    pollCountRef.current = 0;
    setElapsedTime(0);
  }, []);

  // Poll avatar status
  const pollAvatarStatus = useCallback(async (taskId: string) => {
    try {
      pollCountRef.current++;
      const elapsed = Math.floor((pollCountRef.current * 5) / 60); // minutes elapsed
      const seconds = (pollCountRef.current * 5) % 60;
      setElapsedTime(pollCountRef.current * 5);
      console.log(`📊 [InfiniteTalk] Polling status [${pollCountRef.current}/${maxPollAttempts}, ${elapsed}:${seconds.toString().padStart(2, '0')}]:`, taskId.substring(0, 16) + '...');
      
      const response = await fetch(`${API_BASE}/avatar/kie-ai/infinitalk/status/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      const result = await response.json();

      if (!result.success) {
        console.error('❌ [InfiniteTalk] Status check failed:', result.error);
        return;
      }

      console.log(`🔍 [InfiniteTalk] Current status: ${result.status}`);

      if (result.status === 'completed') {
        stopPolling();
        setAvatarResult(result);
        setIsGenerating(false);
        console.log('✅ [InfiniteTalk] Generation completed! Video URLs:', result.videoUrls);
        // Get first video URL
        const videoUrl = result.videoUrls?.[0];
        if (videoUrl) {
          options.onSuccess?.(videoUrl);
        }
      } else if (result.status === 'failed') {
        stopPolling();
        const errorMsg = result.error || 'Avatar generation failed';
        console.error('❌ [InfiniteTalk] Generation failed:', errorMsg);
        setError(errorMsg);
        setIsGenerating(false);
        options.onError?.(errorMsg);
      }
      // If processing, continue polling
    } catch (err) {
      console.error('⚠️ [InfiniteTalk] Error polling avatar status:', err);
      // Don't stop polling on network errors, just log and continue
    }
  }, [stopPolling, options]);

  // Start polling
  const startPolling = useCallback((taskId: string) => {
    console.log('🔄 Starting polling for avatar task:', taskId);
    pollCountRef.current = 0; // Reset counter
    
    // Initial poll
    pollAvatarStatus(taskId);
    
    // Poll every 5 seconds with timeout check
    pollingIntervalRef.current = setInterval(() => {
      if (pollCountRef.current >= maxPollAttempts) {
        stopPolling();
        const errorMsg = `Avatar generation timed out after ${Math.floor(maxPollAttempts * 5 / 60)} minutes`;
        console.error('⏱️', errorMsg);
        setError(errorMsg);
        setIsGenerating(false);
        options.onError?.(errorMsg);
        return;
      }
      pollAvatarStatus(taskId);
    }, 5000);
  }, [pollAvatarStatus, stopPolling, options, maxPollAttempts]);

  // Generate avatar
  const generateAvatar = useCallback(async (params: {
    image_url: string;
    audio_url: string;
    prompt: string;
    resolution?: '480p' | '720p';
    userId?: string;
  }) => {
    try {
      console.log('👤 Starting avatar generation:', params);
      
      setIsGenerating(true);
      setError(null);
      setAvatarResult(null);

      const response = await fetch(`${API_BASE}/avatar/kie-ai/infinitalk/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          userId: params.userId || options.userId || 'anonymous',
          image_url: params.image_url,
          audio_url: params.audio_url,
          prompt: params.prompt,
          resolution: params.resolution || '480p'
        })
      });

      const data = await response.json();
      console.log('👤 Avatar generation response:', data);

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (!data.success || !data.taskId) {
        throw new Error(data.error || 'Failed to start avatar generation');
      }

      // Store task ID
      setCurrentTaskId(data.taskId);
      
      // Start polling for status
      startPolling(data.taskId);

      return data.taskId;
    } catch (err) {
      console.error('❌ Avatar generation error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate avatar';
      setError(errorMsg);
      setIsGenerating(false);
      options.onError?.(errorMsg);
      return null;
    }
  }, [options, startPolling]);

  // Cleanup on unmount
  useCallback(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    generateAvatar,
    isGenerating,
    avatarResult,
    error,
    currentTaskId,
    stopPolling,
    elapsedTime
  };
}