import { useCallback, useEffect, useState } from 'react';

interface AsyncState<T> {
  data: T;
  loading: boolean;
  error: string | null;
  /** Re-runs the fetcher — call after a mutation to pull fresh rows. */
  reload: () => void;
  /** Local override, for optimistic updates after a delete or insert. */
  setData: (next: T) => void;
}

/**
 * Runs `fetcher` on mount and whenever `deps` change, with the usual
 * loading/error bookkeeping. Results from a stale run are discarded so a
 * fast second call can't be overwritten by a slow first one.
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  fallback: T,
  deps: unknown[] = [],
): AsyncState<T> {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetcher()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Failed to load data.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  return { data, loading, error, reload, setData };
}
