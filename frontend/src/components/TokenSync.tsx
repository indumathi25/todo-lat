import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useRef } from 'react';

const TokenSync = () => {
  const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isLoading) return;

    const syncToken = async () => {
      if (isAuthenticated) {
        try {
          const token = await getAccessTokenSilently();
          document.cookie = `access_token=${token}; path=/; samesite=strict; secure`;
          console.log('Token refreshed successfully');
        } catch (error) {
          console.error('Error setting token cookie:', error);
          // If token refresh fails, try to get a new one
          try {
            const token = await getAccessTokenSilently({ cacheMode: 'off' });
            document.cookie = `access_token=${token}; path=/; samesite=strict; secure`;
          } catch (retryError) {
            console.error('Failed to refresh token, user may need to re-login:', retryError);
          }
        }
      }
    };

    // Initial sync
    syncToken();

    // Refresh token every 30 minutes
    if (isAuthenticated) {
      refreshIntervalRef.current = setInterval(
        () => {
          syncToken();
        },
        30 * 60 * 1000
      ); // 30 minutes
    }

    // Cleanup interval on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [isAuthenticated, isLoading, getAccessTokenSilently]);

  return null;
};

export default TokenSync;
