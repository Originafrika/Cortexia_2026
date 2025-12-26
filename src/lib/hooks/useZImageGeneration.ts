import { useState, useCallback, useRef } from 'react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface UseZImageGenerationOptions {
  onSuccess?: (imageUrl: string) => void;
  onError?: (error: string) => void;
}

interface ZImageGenerationResult {
  isGenerating: boolean;
  error: string | null;
  progress: number;
  elapsedTime: number;
  currentTaskId: string | null;
  generateZImage: (userId: string, prompt: string, aspectRatio?: '1:1' | '4:3' | '3:4' | '16:9' | '9:16') => Promise<string | null>;
  cancelGeneration: () => void;
}

const MAX_WAIT_TIME = 5 * 60 * 1000; // 5 minutes max
const POLL_INTERVAL = 3000; // Poll every 3 seconds

export function useZImageGeneration(options: UseZImageGenerationOptions = {}): ZImageGenerationResult {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  
  const pollIntervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const elapsedIntervalRef = useRef<number | null>(null);
  const isCancelledRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (elapsedIntervalRef.current) {
      clearInterval(elapsedIntervalRef.current);
      elapsedIntervalRef.current = null;
    }
  }, []);

  const cancelGeneration = useCallback(() => {
    console.log('🛑 [Z-Image] Cancelling generation');
    isCancelledRef.current = true;
    clearTimers();
    setIsGenerating(false);
    setError('Generation cancelled');
    setProgress(0);
    setElapsedTime(0);
    setCurrentTaskId(null);
  }, [clearTimers]);

  const pollStatus = useCallback(async (taskId: string): Promise<{ imageUrl?: string; completed: boolean; error?: string }> => {
    try {
      console.log(`[Z-Image] 📊 Polling status for task: ${taskId}`);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/z-image/kie-ai/status/${taskId}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check status');
      }

      const data = await response.json();
      console.log('[Z-Image] Status response:', data);

      if (data.status === 'completed' && data.imageUrls && data.imageUrls.length > 0) {
        return { imageUrl: data.imageUrls[0], completed: true };
      }

      if (data.status === 'failed') {
        return { completed: true, error: data.error || 'Generation failed' };
      }

      // Still processing - update progress based on time
      const elapsed = Date.now() - startTimeRef.current;
      const estimatedTotal = 60000; // 60 seconds estimate
      const calculatedProgress = Math.min(90, (elapsed / estimatedTotal) * 100);
      setProgress(calculatedProgress);

      return { completed: false };
    } catch (err) {
      console.error('[Z-Image] ❌ Status check error:', err);
      return { completed: false, error: err instanceof Error ? err.message : 'Status check failed' };
    }
  }, []);

  const generateZImage = useCallback(
    async (userId: string, prompt: string, aspectRatio: '1:1' | '4:3' | '3:4' | '16:9' | '9:16' = '1:1'): Promise<string | null> => {
      try {
        console.log('[Z-Image] 🚀 Starting generation:', { userId, promptLength: prompt.length, aspectRatio });

        // Reset state
        isCancelledRef.current = false;
        setIsGenerating(true);
        setError(null);
        setProgress(5);
        setElapsedTime(0);
        setCurrentTaskId(null);
        startTimeRef.current = Date.now();

        // Start elapsed time counter
        elapsedIntervalRef.current = window.setInterval(() => {
          setElapsedTime(Date.now() - startTimeRef.current);
        }, 1000);

        // Start generation
        const startResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/z-image/kie-ai/start`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              userId,
              prompt,
              aspect_ratio: aspectRatio,
            }),
          }
        );

        if (!startResponse.ok) {
          const errorData = await startResponse.json();
          throw new Error(errorData.error || 'Failed to start generation');
        }

        const startData = await startResponse.json();
        console.log('[Z-Image] ✅ Generation started:', startData);

        if (!startData.success || !startData.taskId) {
          throw new Error('Invalid response from server');
        }

        const taskId = startData.taskId;
        setCurrentTaskId(taskId);
        setProgress(10);

        // Poll for completion
        return new Promise((resolve, reject) => {
          const startTime = Date.now();

          pollIntervalRef.current = window.setInterval(async () => {
            if (isCancelledRef.current) {
              clearTimers();
              reject(new Error('Generation cancelled'));
              return;
            }

            const elapsed = Date.now() - startTime;

            // Timeout after MAX_WAIT_TIME
            if (elapsed > MAX_WAIT_TIME) {
              clearTimers();
              const timeoutError = `⏱️ Z-Image generation timed out after ${Math.round(elapsed / 1000)}s`;
              console.error('[Z-Image]', timeoutError);
              setError(timeoutError);
              setIsGenerating(false);
              if (options.onError) options.onError(timeoutError);
              reject(new Error(timeoutError));
              return;
            }

            // Check status
            const result = await pollStatus(taskId);

            if (result.error) {
              clearTimers();
              console.error('[Z-Image] ❌ Generation failed:', result.error);
              setError(result.error);
              setIsGenerating(false);
              if (options.onError) options.onError(result.error);
              reject(new Error(result.error));
              return;
            }

            if (result.completed && result.imageUrl) {
              clearTimers();
              setProgress(100);
              setIsGenerating(false);
              console.log('[Z-Image] ✅ Generation completed:', result.imageUrl);
              if (options.onSuccess) options.onSuccess(result.imageUrl);
              resolve(result.imageUrl);
              return;
            }

            // Log progress every 10 seconds
            if (elapsed % 10000 < POLL_INTERVAL) {
              console.log(`[Z-Image] ⏳ Still processing... (${Math.round(elapsed / 1000)}s elapsed)`);
            }
          }, POLL_INTERVAL);
        });
      } catch (err) {
        clearTimers();
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('[Z-Image] ❌ Generation error:', errorMessage);
        setError(errorMessage);
        setIsGenerating(false);
        setProgress(0);
        if (options.onError) options.onError(errorMessage);
        return null;
      }
    },
    [pollStatus, clearTimers, options]
  );

  return {
    isGenerating,
    error,
    progress,
    elapsedTime,
    currentTaskId,
    generateZImage,
    cancelGeneration,
  };
}
