import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Button, Navbar, Nav } from 'react-bootstrap';

export default function Home() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:8080/users/profile', { withCredentials: true })
      .then(res => {
        setUser(res.data);
        localStorage.setItem('userId', res.data.userId);
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:8080/users/logout', null, { withCredentials: true });
      window.location.href = '/login';
    } catch {
      alert('登出失敗');
    }
  };

  return (
    <>
      <Navbar bg="light" expand="lg" className="justify-content-between">
        <Container>
          <Navbar.Brand>Blog</Navbar.Brand>
          <Nav className="d-flex gap-2">
            {user && (
              <Button variant="outline-primary" onClick={() => navigate(`/user`)}>
                個人頁面
              </Button>
            )}
            <Button variant="outline-danger" onClick={handleLogout}>
              登出
            </Button>
          </Nav>
        </Container>
      </Navbar>

      <Container className="mt-5 text-center">
        <h1>歡迎來到 Blog 主畫面！</h1>
      </Container>
    </>
  );
}
