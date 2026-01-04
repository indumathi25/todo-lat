import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import TodoList from './pages/TodoList';
import WelcomePage from './pages/WelcomePage';
import YouTubeSearch from './pages/YouTubeSearch';
import TokenSync from './components/TokenSync';
import NestedComments from './pages/NestedComments';

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
                <Route
                    path="/youtube"
                    element={
                        <ProtectedRoute>
                            <YouTubeSearch />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/nested-comments"
                    element={
                        <ProtectedRoute>
                            <NestedComments />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </>
    );
}

export default App;
