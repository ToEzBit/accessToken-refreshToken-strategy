"use client";
import axiosInstance from "@/config/axios-config";
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
} from "react";

interface AuthContextType {
  accessToken: string | null;
  isAuth: boolean;
  addAccessToken: (accessToken: string) => void;
  handleLogOut: () => void;
}

const maxRetryCount = 3;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const isAuth = useMemo(() => (accessToken ? true : false), [accessToken]);

  const addAccessToken = (accessToken: string) => {
    setAccessToken(accessToken);
  };

  const handleLogOut = () => {
    setAccessToken(null);
  };

  useEffect(() => {
    if (!accessToken) return;
    console.log("accessToken is added", accessToken);
  }, [accessToken]);

  useLayoutEffect(() => {
    if (!accessToken) return;
    const authInterceptor = axiosInstance.interceptors.request.use((config) => {
      config.headers.Authorization =
        //@ts-expect-error: retry is custom props from line 80
        !config._retry && accessToken
          ? `Bearer ${accessToken}`
          : config.headers.Authorization;
      return config;
    });
    return () => {
      axiosInstance.interceptors.request.eject(authInterceptor);
    };
  }, [accessToken]);

  useLayoutEffect(() => {
    const refreshInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Initialize _retryCount if not already set
        if (!originalRequest._retryCount) {
          originalRequest._retryCount = 0;
        }

        if (
          error.response.status === 401 &&
          originalRequest._retryCount < maxRetryCount
        ) {
          originalRequest._retryCount += 1;

          try {
            console.log("error", originalRequest._retryCount);
            const res = await axiosInstance.get("auth/refresh", {
              withCredentials: true,
            });

            setAccessToken(res.data.accessToken);
            originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
            originalRequest._retry = true;

            return axiosInstance(originalRequest);
          } catch {
            handleLogOut();
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.response.eject(refreshInterceptor);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ accessToken, isAuth, addAccessToken, handleLogOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useTheme must be used within a AuthContextType");
  }
  return context;
};
