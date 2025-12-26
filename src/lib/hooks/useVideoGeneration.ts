/**
 * USE VIDEO GENERATION HOOK
 * Complete video generation logic with Kie AI
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import type { VideoModel, GenerationType, AspectRatio, VideoStatusResponse } from '../../types/video';
import { calculateVideoCost } from '../../types/video';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

interface UseVideoGenerationOptions {
  onSuccess?: (video: VideoStatusResponse) => void;
  onError?: (error: string) => void;
  userId?: string;
}

export function useVideoGeneration(options: UseVideoGenerationOptions = {}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [videoResult, setVideoResult] = useState<VideoStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExtending, setIsExtending] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Poll video status
  const pollVideoStatus = useCallback(async (taskId: string) => {
    try {
      console.log('📊 Polling video status:', taskId);
      
      const response = await fetch(`${API_BASE}/video/status/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      const result = await response.json();

      if (!result.success) {
        console.error('Status check failed:', result.error);
        return;
      }

      console.log('Video status:', result.status);

      if (result.status === 'completed') {
        stopPolling();
        setVideoResult(result);
        setIsGenerating(false);
        options.onSuccess?.(result);
      } else if (result.status === 'failed') {
        stopPolling();
        setError(result.errorMessage || 'Video generation failed');
        setIsGenerating(false);
        options.onError?.(result.errorMessage || 'Video generation failed');
      }
      // If pending, continue polling
    } catch (err) {
      console.error('Error polling status:', err);
      // Don't stop polling on network errors, just log and continue
    }
  }, [stopPolling, options]);

  // Start polling
  const startPolling = useCallback((taskId: string) => {
    console.log('🔄 Starting polling for task:', taskId);
    
    // Initial poll
    pollVideoStatus(taskId);
    
    // Poll every 5 seconds
    pollingIntervalRef.current = setInterval(() => {
      pollVideoStatus(taskId);
    }, 5000);
  }, [pollVideoStatus]);

  // Generate video
  const generateVideo = useCallback(async (params: {
    prompt: string;
    model?: VideoModel;
    generationType?: GenerationType;
    imageUrls?: string[];
    aspectRatio?: AspectRatio;
    seeds?: number;
    watermark?: string;
  }) => {
    try {
      console.log('🎬 Starting video generation:', params);
      
      setIsGenerating(true);
      setError(null);
      setVideoResult(null);
      setCurrentTaskId(null);

      const response = await fetch(`${API_BASE}/video/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          ...params,
          userId: options.userId || 'anonymous'
        })
      });

      const result = await response.json();

      if (result.success && result.taskId) {
        console.log('✅ Video generation started:', result.taskId);
        setCurrentTaskId(result.taskId);
        startPolling(result.taskId);
        return result.taskId;
      } else {
        console.error('Video generation failed:', result.error);
        setError(result.error || 'Failed to start video generation');
        setIsGenerating(false);
        options.onError?.(result.error || 'Failed to start video generation');
        return null;
      }
    } catch (err) {
      console.error('Error generating video:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setIsGenerating(false);
      options.onError?.(errorMessage);
      return null;
    }
  }, [startPolling, options]);

  // Extend video
  const extendVideo = useCallback(async (taskId: string, prompt: string) => {
    try {
      console.log('➕ Extending video:', taskId);
      
      setIsExtending(true);
      setIsGenerating(true); // ✅ Set generating state
      setError(null);

      const response = await fetch(`${API_BASE}/video/extend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          taskId,
          prompt,
          userId: options.userId || 'anonymous'
        })
      });

      const result = await response.json();

      if (result.success && result.taskId) {
        console.log('✅ Video extension started:', result.taskId);
        setCurrentTaskId(result.taskId);
        setVideoResult(null); // Clear previous result
        setIsExtending(false); // ✅ Stop extending state, but keep generating
        startPolling(result.taskId);
        return result.taskId;
      } else {
        console.error('Video extension failed:', result.error);
        setError(result.error || 'Failed to extend video');
        setIsExtending(false);
        setIsGenerating(false);
        options.onError?.(result.error || 'Failed to extend video');
        return null;
      }
    } catch (err) {
      console.error('Error extending video:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setIsExtending(false);
      setIsGenerating(false);
      options.onError?.(errorMessage);
      return null;
    }
  }, [startPolling, options]);

  // Upgrade to 1080P
  const upgrade1080P = useCallback(async (taskId: string) => {
    try {
      console.log('📹 Upgrading to 1080P:', taskId);
      
      setIsUpgrading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/video/1080p/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      const result = await response.json();

      if (result.success && result.url) {
        console.log('✅ 1080P video ready:', result.url);
        
        // Update current video result with 1080P URL
        if (videoResult) {
          setVideoResult({
            ...videoResult,
            resultUrls: [result.url],
            resolution: '1080p',
            storedUrl: result.url
          });
        }
        
        return result.url;
      } else {
        console.error('1080P upgrade failed:', result.error);
        setError(result.error || 'Failed to upgrade to 1080P');
        options.onError?.(result.error || 'Failed to upgrade to 1080P');
        return null;
      }
    } catch (err) {
      console.error('Error upgrading to 1080P:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      options.onError?.(errorMessage);
      return null;
    } finally {
      setIsUpgrading(false);
    }
  }, [videoResult, options]);

  // Reset state
  const reset = useCallback(() => {
    stopPolling();
    setIsGenerating(false);
    setCurrentTaskId(null);
    setVideoResult(null);
    setError(null);
    setIsExtending(false);
    setIsUpgrading(false);
  }, [stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    // State
    isGenerating,
    currentTaskId,
    videoResult,
    error,
    isExtending,
    isUpgrading,
    
    // Actions
    generateVideo,
    extendVideo,
    upgrade1080P,
    reset,
  };
}