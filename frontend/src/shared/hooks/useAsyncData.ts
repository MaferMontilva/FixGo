import { useEffect, useState } from "react";

export function useAsyncData<T>(loader: () => Promise<T>, fallback: T) {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    loader()
      .then((result) => {
        if (active) setData(result);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loader]);

  return { data, loading };
}
