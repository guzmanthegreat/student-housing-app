import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../lib/api";

// Small helper so axios always has the latest token
function setAuthHeader(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);      // { id, email, name, ... }
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  // 1) On mount: restore token -> /auth/me
  useEffect(() => {
    const token = localStorage.getItem("token");
    setAuthHeader(token);

    async function loadMe() {
      if (!token) { setLoading(false); return; }
      try {
        const { data } = await api.get("/auth/me");
        setUser(data.user);
      } catch (e) {
        // token invalid/expired
        localStorage.removeItem("token");
        setAuthHeader(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadMe();
  }, []);

  // 2) Global 401 handler: if backend says unauthorized, log out
  useEffect(() => {
    const id = api.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err?.response?.status === 401) {
          localStorage.removeItem("token");
          setAuthHeader(null);
          setUser(null);
        }
        return Promise.reject(err);
      }
    );
    return () => api.interceptors.response.eject(id);
  }, []);

  // 3) Cross-tab sync (login/logout in other tabs)
  useEffect(() => {
    function onStorage(e) {
      if (e.key === "token") {
        const t = e.newValue;
        setAuthHeader(t);
        if (!t) {
          setUser(null);
        } else {
          // try to refresh user
          api.get("/auth/me")
            .then(({ data }) => setUser(data.user))
            .catch(() => {
              localStorage.removeItem("token");
              setAuthHeader(null);
              setUser(null);
            });
        }
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  async function login(email, password) {
    setAuthError("");
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    setAuthHeader(data.token);
    setUser(data.user);
    return data.user;
  }

  async function register(email, password, name) {
    setAuthError("");
    const { data } = await api.post("/auth/register", { email, password, name });
    localStorage.setItem("token", data.token);
    setAuthHeader(data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem("token");
    setAuthHeader(null);
    setUser(null);
  }

  const isAuthenticated = !!user;
  const value = useMemo(
    () => ({ user, loading, authError, isAuthenticated, login, register, logout }),
    [user, loading, authError, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
