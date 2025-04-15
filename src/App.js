import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './pages/Login';
import Home from './pages/Home';
import UserPage from './pages/UserPage';
import PostPage from './pages/PostPage';
import Register from './pages/Register';
import ArticlePage from './pages/ArticlePage';
import DevTool from './DevTool';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AuthProvider>
  );
}

function AppRouter() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/user" element={user ? <UserPage /> : <Navigate to="/login" />} />
      <Route path="/post" element={user ? <PostPage /> : <Navigate to="/login" />} />
      <Route path="/article/:articleId" element={<ArticlePage />} />
      <Route path="/devtool" element={<DevTool />} />
    </Routes>
  );
}
