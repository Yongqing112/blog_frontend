import { useAuth } from './AuthContext';
import { Navbar, Nav, Button } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function NavbarComponent() {
  const { user, setUser, isAdminMode, setIsAdminMode } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:8080/users/logout', null, { withCredentials: true });
      setUser(null);
    } catch (err) {
      alert('登出失敗，請稍後再試');
    }
  };

  return (
    <Navbar bg="light" expand="lg" className="px-5 justify-content-between">
      <Navbar.Brand as={Link} to="/" style={{ fontWeight: 'bold', fontSize: '20px' }}>
        Blog
      </Navbar.Brand>

      {user?.username === 'Admin' && (
        <Button
          variant={isAdminMode ? 'dark' : 'outline-dark'}
          onClick={() => setIsAdminMode(!isAdminMode)}
        >
          {isAdminMode ? 'Disable Admin Mode' : 'Enable Admin Mode'}
        </Button>
      )}


      <Nav className="d-flex gap-3 align-items-center">
        {isAdminMode && (
          <Button variant="outline-warning" onClick={() => navigate('/admin/creator')}>
            Creator Management
          </Button>
        )}
        <Button variant="outline-primary" onClick={() => navigate('/search')}>Search</Button>
        <Button variant="outline-primary" onClick={() => navigate('/notification')}>Notification</Button>
        <Button variant="outline-primary" onClick={() => navigate('/post')}>Post</Button>
        <Button variant="outline-primary" onClick={() => navigate('/bookmark')}>Bookmark</Button>

        {user ? (
          <>
            <Button variant="outline-success" onClick={() => navigate('/user')}>
              Hi {user.username}
            </Button>
            <Button variant="outline-danger" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <Button variant="outline-secondary" onClick={() => navigate('/login')}>
            Login
          </Button>
        )}
      </Nav>
    </Navbar>
  );
}
