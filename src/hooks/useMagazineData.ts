/**
 * Hook for fetching magazine data
 * Task 3.3: Extract Custom Hooks
 */

import { useState, useEffect, useCallback } from 'react';

export interface MagazineItem {
  id: string;
  displayOrder: number;
  submission: {
    id: string;
    category: string;
    textContent: string | null;
    mediaUrl: string | null;
    userName: string | null;
    accessibilityText: string | null;
    contentType: string;
    user: {
      name: string;
    } | null;
  };
}

export interface Magazine {
  id: string;
  title: string;
  description: string | null;
  version: string | null;
  publishedAt: string | null;
  items: MagazineItem[];
}

interface UseMagazineDataOptions {
  magazineId?: string;
  publicOnly?: boolean;
  autoFetch?: boolean;
}

export function useMagazineData(options: UseMagazineDataOptions = {}) {
  const { magazineId, publicOnly = true, autoFetch = true } = options;

  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [magazine, setMagazine] = useState<Magazine | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMagazines = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const url = publicOnly ? '/api/magazines?public=true' : '/api/magazines';
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch magazines: ${response.statusText}`);
      }

      const data: Magazine[] = await response.json();
      setMagazines(data || []);

      // If we're looking for a specific magazine, find it
      if (magazineId) {
        const found = data.find((m) => m.id === magazineId);
        setMagazine(found || null);
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch magazines';
      setError(errorMessage);
      console.error('Magazine fetch error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [magazineId, publicOnly]);

  const fetchMagazineById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = publicOnly
        ? `/api/magazines?public=true`
        : `/api/magazines`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch magazine: ${response.statusText}`);
      }

      const data: Magazine[] = await response.json();
      const found = data.find((m) => m.id === id);

      if (!found) {
        throw new Error('Magazine not found');
      }

      setMagazine(found);
      return found;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch magazine';
      setError(errorMessage);
      console.error('Magazine fetch error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [publicOnly]);

  const refetch = useCallback(() => {
    if (magazineId) {
      return fetchMagazineById(magazineId);
    }
    return fetchMagazines();
  }, [magazineId, fetchMagazineById, fetchMagazines]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      refetch();
    }
  }, [autoFetch, refetch]);

  return {
    magazines,
    magazine,
    isLoading,
    error,
    refetch,
    fetchMagazineById,
  };
}
