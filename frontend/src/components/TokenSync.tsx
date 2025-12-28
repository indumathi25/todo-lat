import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";

const TokenSync = () => {
    const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();

    useEffect(() => {
        if (isLoading) return;

        const syncToken = async () => {
            if (isAuthenticated) {
                try {
                    const token = await getAccessTokenSilently();
                    // Set cookie: Secure, SameSite=Strict, Path=/
                    // Note: 'Secure' might need HTTPS. For localhost, it usually works or we omit it if not serving https.
                    // Given the user asked for HTTPS secure, we typically set it. 
                    // But on localhost http, Secure cookies might be rejected by some browsers unless on localhost.
                    document.cookie = `access_token=${token}; path=/; samesite=strict; secure`;
                } catch (error) {
                    console.error("Error setting token cookie:", error);
                }
            }
        };

        syncToken();
    }, [isAuthenticated, isLoading, getAccessTokenSilently]);

    return null;
};

export default TokenSync;
