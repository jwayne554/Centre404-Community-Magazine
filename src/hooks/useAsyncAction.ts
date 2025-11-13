/**
 * Generic hook for handling async actions with loading/error/success states
 * Task 3.3: Extract Custom Hooks
 */

import { useState, useCallback } from 'react';

export interface AsyncActionState<T = unknown> {
  isLoading: boolean;
  error: string | null;
  data: T | null;
}

export interface UseAsyncActionReturn<T, Args extends unknown[]> {
  execute: (...args: Args) => Promise<T | null>;
  reset: () => void;
  isLoading: boolean;
  error: string | null;
  data: T | null;
}

/**
 * Hook for managing async action state
 * @param asyncFn - The async function to execute
 * @param onSuccess - Optional callback when action succeeds
 * @param onError - Optional callback when action fails
 */
export function useAsyncAction<T = unknown, Args extends unknown[] = []>(
  asyncFn: (...args: Args) => Promise<T>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    initialData?: T;
  }
): UseAsyncActionReturn<T, Args> {
  const [state, setState] = useState<AsyncActionState<T>>({
    isLoading: false,
    error: null,
    data: options?.initialData ?? null,
  });

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await asyncFn(...args);
        setState({ isLoading: false, error: null, data: result });

        if (options?.onSuccess) {
          options.onSuccess(result);
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An unknown error occurred');
        const errorMessage = error.message;

        setState({ isLoading: false, error: errorMessage, data: null });

        if (options?.onError) {
          options.onError(error);
        }

        return null;
      }
    },
    [asyncFn, options]
  );

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      data: options?.initialData ?? null,
    });
  }, [options?.initialData]);

  return {
    execute,
    reset,
    isLoading: state.isLoading,
    error: state.error,
    data: state.data,
  };
}
