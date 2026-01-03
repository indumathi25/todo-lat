import { useAuth0 } from "@auth0/auth0-react";

const LogoutButton = () => {
    const { logout } = useAuth0();

    const handleLogout = () => {
        document.cookie = "access_token=; path=/; max-age=0";
        logout({ logoutParams: { returnTo: window.location.origin } });
    };

    return (
        <button
            onClick={handleLogout}
            className="cursor-pointer bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
            Log Out
        </button>
    );
};

export default LogoutButton;
