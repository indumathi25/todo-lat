import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect } from "react";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

    // Helper to check for cookie
    const hasCookie = document.cookie.split(';').some((item) => item.trim().startsWith('access_token='));

    useEffect(() => {
        if (!isLoading && !isAuthenticated && !hasCookie) {
            loginWithRedirect();
        }
    }, [isLoading, isAuthenticated, hasCookie, loginWithRedirect]);

    if (isLoading && !hasCookie) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!isAuthenticated && !hasCookie) {
        return null;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
