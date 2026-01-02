import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import TodoList from './pages/TodoList';
import WelcomePage from './pages/WelcomePage';
import YouTubeSearch from './pages/YouTubeSearch';
import TokenSync from './components/TokenSync';

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
      </Routes>
    </>
  );
}

export default App;
