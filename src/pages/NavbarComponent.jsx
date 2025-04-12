import { Navbar, Nav, Button } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';

export default function NavbarComponent({ username }) {
  const navigate = useNavigate();

  return (
    <Navbar bg="light" expand="lg" className="px-5 justify-content-between">
                <Navbar.Brand as={Link} to="/" style={{ fontWeight: 'bold', fontSize: '20px' }}>
                    Blog
                </Navbar.Brand>

                <Nav className="d-flex gap-3">
                    <Button className="no-style-button">Notification</Button>
                    <Button className="no-style-button" onClick={() => navigate('/post')}>Post</Button>
                    <Button className="no-style-button">Bookmark</Button>
                    <Button variant="dark" disabled>Hi {username}</Button>
                </Nav>
            </Navbar>
  );
}
