import { Auth0Provider } from "@auth0/auth0-react";
import React from "react";
import { useNavigate } from "react-router-dom";

type Auth0ProviderWithNavigateProps = {
    children: React.ReactNode;
};

export const Auth0ProviderWithNavigate = ({ children }: Auth0ProviderWithNavigateProps) => {
    const navigate = useNavigate();

    const domain = import.meta.env.VITE_AUTH0_DOMAIN;
    const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
    const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

    const onRedirectCallback = (appState?: any) => {
        navigate(appState?.returnTo || "/todos");
    };

    if (!(domain && clientId && audience)) {
        return null;
    }

    return (
        <Auth0Provider
            domain={domain}
            clientId={clientId}
            authorizationParams={{
                redirect_uri: window.location.origin,
                audience: audience,
            }}
            onRedirectCallback={onRedirectCallback}
        >
            {children}
        </Auth0Provider>
    );
};
