import { useAuth0 } from "@auth0/auth0-react";

const LogoutButton = () => {
    const { logout } = useAuth0();

    return (
        <button
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            className="cursor-pointer bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
            Log Out
        </button>
    );
};

export default LogoutButton;
