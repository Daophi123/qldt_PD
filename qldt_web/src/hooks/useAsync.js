import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";

export function useAsync(asyncFn, key) {
  const [result, setResult] = useState({ key: null, data: null, error: null });
  const [reloadCount, setReloadCount] = useState(0);
  const requestKey = `${key}#${reloadCount}`;
  const pendingRef = useRef({ key: null, promise: null });

  const runAsync = useEffectEvent(asyncFn);

  useEffect(() => {
    let active = true;
    if(pendingRef.current.key !== requestKey) {
      pendingRef.current = { key: requestKey, promise: runAsync() };
    }
    pendingRef.current.promise.then(data => {
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