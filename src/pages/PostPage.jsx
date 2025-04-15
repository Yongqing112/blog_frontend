import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Form, Button, Alert, Navbar, Nav, Modal } from 'react-bootstrap';
import { useAuth } from '../AuthContext';

export default function PostPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setShowModal(true);
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');

    const articleId = new Date().toISOString();
    const date = new Date().toISOString();

    axios.post('http://localhost:8080/article/', {
      articleId,
      userId: user.userId,
      title,
      content,
      tag,
      category,
      date
    }, { withCredentials: true })
      .then(() => {
        setMessage('文章發表成功！');
        setTimeout(() => navigate('/user'), 1500);
      })
      .catch(() => {
        setMessage('發表失敗，請再試一次');
      });
  };

  return (
    <>
      <Navbar bg="light" expand="lg" className="px-5 justify-content-between">
        <Navbar.Brand style={{ fontWeight: 'bold', fontSize: '20px' }} onClick={() => navigate('/')}>
          Blog
        </Navbar.Brand>
        <Nav className="d-flex gap-3">
          <Button className="no-style-button" onClick={() => navigate('/user')}>
            Back
          </Button>
        </Nav>
      </Navbar>

      <Container className="mt-5">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-4">
            <Form.Label style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Article Title</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your title"
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Content</Form.Label>
            <Form.Control
              as="textarea"
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your content here..."
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Tag</Form.Label>
            <Form.Control
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="Enter tag (ex: tech, life)"
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Category</Form.Label>
            <Form.Control
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Enter category (ex: Java, React)"
            />
          </Form.Group>

          <Button variant="dark" type="submit">Save</Button>
          {message && <Alert variant="info" className="mt-3 text-center">{message}</Alert>}
        </Form>
      </Container>

      <Modal show={showModal} onHide={() => navigate(-1)} centered>
        <Modal.Header closeButton>
          <Modal.Title>尚未登入</Modal.Title>
        </Modal.Header>
        <Modal.Body>請先登入才能發文，是否前往登入頁？</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            取消
          </Button>
          <Button variant="primary" onClick={() => navigate('/login')}>
            確定
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
