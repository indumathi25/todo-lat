import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import TodoList from "./pages/TodoList";
import WelcomePage from "./pages/WelcomePage";

function App() {
    return (
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
    );
}

export default App;
