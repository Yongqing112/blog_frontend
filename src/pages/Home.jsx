import axios from 'axios';
import { Container, Button, Navbar, Nav } from 'react-bootstrap';

export default function Home() {

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:8080/users/logout', null, { withCredentials: true });
      window.location.href = '/login';
    } catch (err) {
      alert('登出失敗，請稍後再試');
    }
  };

  return (
    <>
      <Navbar bg="light" expand="lg" className="justify-content-between">
        <Container>
          <Navbar.Brand>Blog</Navbar.Brand>
          <Nav>
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
