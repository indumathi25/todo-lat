import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from "./components/LoginButton";
import TodoList from "./pages/TodoList";

function App() {
    const { isAuthenticated, isLoading } = useAuth0();

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
                <h1 className="text-3xl font-bold mb-8">Welcome to Todo App</h1>
                <LoginButton />
            </div>
        );
    }

    return <TodoList />;
}

export default App;
