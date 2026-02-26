import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactElement;
    requiredRole?: number;
}

interface DecodedToken {
    id: number;
    email: string;
    role: number;
    fullname: string;
    exp: number;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
    const { token, logout, loading, user } = useAuth();

    if (loading) {
        return null;
    }

    if (!token) {
        return <Navigate to="/Login" replace />;
    }

    try {
        const decoded = jwtDecode<DecodedToken>(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
            console.warn("Session expired. Logging out.");
            logout();
            return <Navigate to="/Login" replace />;
        }

        if (requiredRole !== undefined && user?.role !== requiredRole) {
            console.error("Access denied: Insufficient permissions.");
            const fallback = user?.role === 1 ? "/AdminDashboard" : "/UserMainPage";
            return <Navigate to={fallback} replace />;
        }

        return children;

    } catch (error) {
        console.error("Authentication error:", error);
        logout();
        return <Navigate to="/Login" replace />;
    }
};

export default ProtectedRoute;