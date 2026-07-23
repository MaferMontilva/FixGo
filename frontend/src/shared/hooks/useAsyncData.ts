import { useEffect, useState } from "react";

export function useAsyncData<T>(loader: () => Promise<T>, fallback: T) {
  const [data, setData] = useState<T>(fallback);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    loader()
      .then((result) => {
        if (active) {
          setData(result);
          setError(null);
        }
      })
      .catch((loadError) => {
        if (active) setError(loadError);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loader]);

  return { data, error, loading };
}
