import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

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
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/Login" replace />;
    }

    try {
        const decoded = jwtDecode<DecodedToken>(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
            console.warn("Token expired. Logging out.");
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return <Navigate to="/Login" replace />;
        }

        if (requiredRole !== undefined && decoded.role !== requiredRole) {
            console.error("Access denied: Insufficient permissions.");
            return <Navigate to="/" replace />;
        }

        return children;

    } catch (error) {
        console.error("Invalid token format:", error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return <Navigate to="/Login" replace />;
    }
};

export default ProtectedRoute;