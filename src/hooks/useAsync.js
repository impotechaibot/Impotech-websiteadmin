import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * জেনেরিক অ্যাসিঙ্ক ডেটা হুক।
 * const { data, loading, error, reload } = useAsync(fn, deps);
 */
export default function useAsync(fn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      if (mounted.current) setData(result);
      return result;
    } catch (e) {
      if (mounted.current) setError(e);
      return null;
    } finally {
      if (mounted.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mounted.current = true;
    run();
    return () => {
      mounted.current = false;
    };
  }, [run]);

  return { data, loading, error, reload: run, setData };
}
