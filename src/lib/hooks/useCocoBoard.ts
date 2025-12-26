/**
 * COCONUT V14 - USE COCOBOARD HOOK
 * Phase 3 - Jour 3: Custom hook for CocoBoard API interactions
 */

import { useState, useCallback } from 'react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import type { CocoBoard, ApiResponse } from '../types/coconut-v14';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

interface UseCocoBoardOptions {
  onSuccess?: (board: CocoBoard) => void;
  onError?: (error: string) => void;
}

export function useCocoBoard(options: UseCocoBoardOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch CocoBoard
  const fetchCocoBoard = useCallback(async (cocoBoardId: string): Promise<CocoBoard | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE}/coconut-v14/cocoboard/${cocoBoardId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch CocoBoard`);
      }

      const data: ApiResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch CocoBoard');
      }

      const board = data.data as CocoBoard;
      options.onSuccess?.(board);
      return board;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch CocoBoard';
      setError(errorMessage);
      options.onError?.(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  // Create CocoBoard from project
  const createCocoBoard = useCallback(async (
    userId: string,
    projectId: string
  ): Promise<CocoBoard | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE}/coconut-v14/cocoboard/create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ userId, projectId }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to create CocoBoard`);
      }

      const data: ApiResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create CocoBoard');
      }

      const board = data.data as CocoBoard;
      options.onSuccess?.(board);
      return board;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create CocoBoard';
      setError(errorMessage);
      options.onError?.(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  // Save CocoBoard
  const saveCocoBoard = useCallback(async (
    userId: string,
    projectId: string,
    board: CocoBoard,
    status: 'draft' | 'validated' | 'ready'
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE}/coconut-v14/cocoboard/save`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            userId,
            projectId,
            cocoboard: board,
            status,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to save CocoBoard`);
      }

      const data: ApiResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to save CocoBoard');
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save CocoBoard';
      setError(errorMessage);
      options.onError?.(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  // Update CocoBoard
  const updateCocoBoard = useCallback(async (
    cocoBoardId: string,
    updates: Partial<CocoBoard>
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE}/coconut-v14/cocoboard/${cocoBoardId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to update CocoBoard`);
      }

      const data: ApiResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to update CocoBoard');
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update CocoBoard';
      setError(errorMessage);
      options.onError?.(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  return {
    isLoading,
    error,
    fetchCocoBoard,
    createCocoBoard,
    saveCocoBoard,
    updateCocoBoard,
  };
}
