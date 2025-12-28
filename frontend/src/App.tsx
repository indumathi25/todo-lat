import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import TodoList from "./pages/TodoList";
import WelcomePage from "./pages/WelcomePage";
import TokenSync from "./components/TokenSync";

function App() {
    return (
        <>
            <TokenSync />
            <Routes>
                <Route path="/" element={<WelcomePage />} />
                <Route
                    path="/todos"
                    element={
                        <ProtectedRoute>
                            <TodoList />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </>
    );
}

export default App;
