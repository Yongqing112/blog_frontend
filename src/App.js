import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './pages/Login';
import Home from './pages/Home';
import UserPage from './pages/UserPage';
import PostPage from './pages/PostPage';
import Register from './pages/Register';
import ArticlePage from './pages/article/ArticlePage';
import DevTool from './DevTool';
import BookmarkPage from './pages/BookmarkPage';
import Search from './pages/Search';
import NotificationPage from "./pages/NotificationPage";

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
      <Route path="/post" element={<PostPage />} />
      <Route path="/bookmark" element={<BookmarkPage />} />
      <Route path="/article/:articleId" element={<ArticlePage />} />
      <Route path="/notification" element={<NotificationPage />} />
      <Route path="/search" element={<Search />} />
      <Route path="/devtool" element={<DevTool />} />
    </Routes>
  );
}
