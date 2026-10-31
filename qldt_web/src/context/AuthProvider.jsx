import { useCallback, useEffect, useMemo, useState } from "react";
import { authApi } from '../apis/authApi'
import { setSessionExpiredHandler } from '../apis/axiosClient'
import { clearToken, setToken } from '../utils/tokenStore'
import { AuthContext } from './authContext'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('checking');

  const resetSession = useCallback(() => {
    clearToken();
    setUser(null);
    setStatus('guest');
  }, []);

  useEffect(() => {
    setSessionExpiredHandler(resetSession);
    return () => setSessionExpiredHandler(null);
  }, [resetSession]);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        await authApi.refresh();
        if(!active) return;
        const me = await authApi.getMe();
        if(active) {
          setUser(me);
          setStatus('authenticated');
        }
      } catch {
        if(active) resetSession();
      }
    }
    restoreSession()
    return () => {
      active = false;
    }
  }, [resetSession]);

  const login = useCallback(async(username, password) => {
    const { token, ...profile } = await authApi.login({ username, password });
    setToken(token);
    setUser(profile);
    setStatus('authenticated');
    return profile;
  }, []);

  const logout = useCallback(async() => {
    try {
      await authApi.logout();
    } catch {
      
    } finally {
      resetSession();
    }
  }, [resetSession]);

  const value = useMemo(() => ({ user, status, login, logout }), [user, status, login, logout])

  return <AuthContext value={value}>{ children }</AuthContext>
}