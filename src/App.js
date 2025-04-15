import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import UserPage from './pages/UserPage';
import PostPage from './pages/PostPage';
import Register from './pages/Register';
import ArticlePage from './pages/ArticlePage';
import { useEffect, useState } from 'react';
import axios from 'axios';
import DevTool from './DevTool';

export default function App() {
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:8080/users/profile', { withCredentials: true })
      .then(res => {
        if (res.status === 200) {
          setIsLogin(true);
        }
      })
      .catch(() => {
        setIsLogin(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={isLogin ? <Home /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={isLogin ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/register"
          element={<Register />}
        />
        <Route path="/user" element={isLogin ? <UserPage /> : <Navigate to="/login" />} />
        <Route path="/post" element={isLogin ? <PostPage /> : <Navigate to="/login" />} />
        <Route path="/article/:articleId" element={<ArticlePage />} />

        <Route path='/devtool' element={<DevTool />}/>
      </Routes>
    </BrowserRouter>
  );
}