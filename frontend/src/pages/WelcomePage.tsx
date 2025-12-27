import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const WelcomePage = () => {
    const { isAuthenticated, isLoading } = useAuth0();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            navigate('/todos');
        }
    }, [isLoading, isAuthenticated, navigate]);

    return (
        <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
            <h1 className="text-4xl font-bold mb-4 text-gray-800">Welcome to Todo App</h1>
            <p className="text-gray-600 mb-8 max-w-md text-center">
                Organize your tasks efficiently. No login required to get started!
            </p>
            <button
                onClick={() => navigate('/todos')}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition shadow-lg"
            >
                Enter App
            </button>
        </div>
    );
};

export default WelcomePage;
