import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

interface User {
    id: number;
    system_id: string;
    firstname: string;
    lastname: string;
    fullname: string;
    email: string;
    role: number;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (token: string, userData: User) => void;
    logout: (reason?: string) => void;
    resetInactivityTimer: () => void;
    loading: boolean;
}

// ⚠️ TESTING CONFIGURATION: 10 SECONDS TOTAL
const INACTIVITY_LIMIT = 5 * 60 * 1000;  // Auto logout after 5 minutes
const WARNING_THRESHOLD = 4 * 60 * 1000; // Show warning toast after 4 seconds (1s left)

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
    const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
    const warningToastIdRef = useRef<string | null>(null);

    // Clear active timers & toasts
    const clearTimers = useCallback(() => {
        if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        if (warningToastIdRef.current) {
            toast.dismiss(warningToastIdRef.current);
            warningToastIdRef.current = null;
        }
    }, []);

    const logout = useCallback((reason?: string) => {
        console.warn("Logout triggered. Reason:", reason || "manual");
        clearTimers();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setToken(null);
        setUser(null);

        if (reason === 'inactivity') {
            toast.error('Session expired due to inactivity.', {
                duration: 5000,
                id: 'auto-logout-toast'
            });
        }

        if (window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
    }, [clearTimers]);

    // Reset inactivity timer & dismiss active warning toast
    const resetInactivityTimer = useCallback(() => {
        clearTimers();
        console.log("Inactivity timer reset. Starting 10-second countdown...");

        // 1. Warning Timer -> Triggers at 6s
        warningTimerRef.current = setTimeout(() => {
            console.warn("Displaying inactivity warning toast...");
            warningToastIdRef.current = toast(
                (t) => (
                    <div className="flex flex-col gap-2">
                        <span className="font-medium text-sm">
                            ⚠️ You will be logged out in 4 seconds due to inactivity.
                        </span>
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                                resetInactivityTimer();
                                toast.success('Session extended!', { duration: 2000 });
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-1 px-3 rounded w-fit font-semibold"
                        >
                            Stay Logged In
                        </button>
                    </div>
                ),
                {
                    duration: 4000,
                    position: 'top-right',
                    style: {
                        border: '1px solid #f59e0b',
                        padding: '12px',
                        color: '#1f2937',
                    },
                }
            );
        }, WARNING_THRESHOLD);

        // 2. Logout Timer -> Triggers at 10s
        logoutTimerRef.current = setTimeout(() => {
            console.error("10 seconds reached. Executing auto-logout.");
            logout('inactivity');
        }, INACTIVITY_LIMIT);
    }, [clearTimers, logout]);

    // 1. Initialize Auth on load
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedUser && storedToken) {
            try {
                setUser(JSON.parse(storedUser));
                setToken(storedToken);
                axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            } catch (error) {
                console.error("Auth initialization failed:", error);
                logout();
            }
        }
        setLoading(false);
    }, [logout]);

    // 2. Attach user interaction events
    useEffect(() => {
        if (!token) return;

        // Note: During 10s testing, avoid moving your mouse or pressing keys after page load!
        const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

        let lastExecution = 0;
        const handleUserActivity = () => {
            const now = Date.now();
            if (now - lastExecution > 2000) {
                lastExecution = now;
                resetInactivityTimer();
            }
        };

        resetInactivityTimer();

        activityEvents.forEach((event) => {
            window.addEventListener(event, handleUserActivity);
        });

        return () => {
            clearTimers();
            activityEvents.forEach((event) => {
                window.removeEventListener(event, handleUserActivity);
            });
        };
    }, [token, resetInactivityTimer, clearTimers]);

    // 3. Setup Axios Interceptor
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    logout();
                }
                return Promise.reject(error);
            }
        );

        return () => axios.interceptors.response.eject(interceptor);
    }, [logout]);

    const login = (newToken: string, userData: User) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        toast.success(`Welcome back, ${userData.firstname || userData.fullname}!`);
    };

    const value = {
        user,
        token,
        isAuthenticated: !!token,
        login,
        logout,
        resetInactivityTimer,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            <Toaster position="top-right" />
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};