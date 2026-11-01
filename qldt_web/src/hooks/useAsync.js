import { useCallback, useEffect, useEffectEvent, useState } from "react";

export function useAsync(asyncFn, key) {
  const [result, setResult] = useState({ key: null, data: null, error: null });
  const [reloadCount, setReloadCount] = useState(0);
  const requestKey = `${key}#${reloadCount}`;

  const runAsync = useEffectEvent(asyncFn);

  useEffect(() => {
    let active = true;
    runAsync().then(data => {
      if(active) setResult({ key: requestKey, data, error: null });
    }).catch(error => {
      if(active) setResult({ key: requestKey, data: null, error });
    })
    return () => {
      active = false;
    }
  }, [requestKey]);

  const loading = result.key !== requestKey;
  const reload = useCallback(() => setReloadCount(count => count + 1), []);
  const setData = useCallback(updater => {
    setResult(prev => ({
      ...prev,
      data: typeof updater === 'function' ? updater(prev.data) : updater
    }));
  }, []);

  return { data: result.data, error: loading ? null : result.error, loading, reload, setData };
}